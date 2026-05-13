import * as amqp from 'amqplib';
import { config } from '../config';
import { logger } from './logger';

type AmqpConnection = Awaited<ReturnType<typeof amqp.connect>>;
type AmqpChannel = Awaited<ReturnType<AmqpConnection['createChannel']>>;

let connection: AmqpConnection | null = null;
let channel: AmqpChannel | null = null;

const QUEUE_NAME = 'votes';

interface VoteMessage {
  proposalId: string;
  userId: string;
  action: 'cast' | 'remove';
  timestamp: string;
}

export async function connectToQueue(): Promise<void> {
  if (connection && channel) return;

  connection = await amqp.connect(config.RABBITMQ_URL);
  channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME, { durable: true });
}

export async function publishVoteMessage(message: VoteMessage): Promise<void> {
  if (!channel) {
    await connectToQueue();
  }

  const payload: VoteMessage = {
    ...message,
    timestamp: new Date().toISOString(),
  };

  if (channel) {
    channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(payload)), { persistent: true });
  }
}

export async function startVoteConsumer(): Promise<void> {
  if (!channel) {
    await connectToQueue();
  }

  if (!channel) throw new Error('Failed to establish RabbitMQ channel');

  await channel.consume(QUEUE_NAME, async (msg) => {
    if (msg !== null) {
      try {
        const voteData: VoteMessage = JSON.parse(msg.content.toString());
        logger.info({ proposalId: voteData.proposalId, action: voteData.action }, 'Vote message consumed');
        channel?.ack(msg);
      } catch (error) {
        logger.error({ error }, 'Error processing vote message');
        channel?.nack(msg, false, false);
      }
    }
  });

  logger.info('Vote consumer started');
}

export async function closeQueue(): Promise<void> {
  if (channel) {
    await channel.close();
    channel = null;
  }
  if (connection) {
    await connection.close();
    connection = null;
  }
}
