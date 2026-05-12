import amqp, { Channel } from 'amqplib';
import { config } from '../config';

type AmqpConnection = Awaited<ReturnType<typeof amqp.connect>>;

let connection: AmqpConnection | null = null;
let channel: Channel | null = null;

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
