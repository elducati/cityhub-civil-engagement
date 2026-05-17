import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { logger } from './logger';
import type { UserPayload } from '../types/express.d';

let io: SocketIOServer | null = null;

interface SocketAuthData {
  user?: UserPayload;
}

export function initSocketServer(): SocketIOServer {
  const httpServer = createServer();
  const socketPort = config.SOCKET_PORT || 3001;

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: config.FRONTEND_URL.split(','),
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = jwt.verify(token as string, config.AUTH_JWT_SECRET) as UserPayload;
      (socket as SocketAuthData).user = decoded;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const user = (socket as SocketAuthData).user;
    logger.info({ userId: user?.id, socketId: socket.id }, 'Socket client connected');

    socket.on('join:proposal', (proposalId: string) => {
      socket.join(`proposal:${proposalId}`);
    });

    socket.on('leave:proposal', (proposalId: string) => {
      socket.leave(`proposal:${proposalId}`);
    });

    socket.on('disconnect', () => {
      logger.info({ socketId: socket.id }, 'Socket client disconnected');
    });
  });

  httpServer.listen(socketPort, () => {
    logger.info({ port: socketPort }, 'Socket.IO server started');
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.IO server not initialized. Call initSocketServer() first.');
  }
  return io;
}

export function emitVoteCreated(proposalId: string, voteCount: number): void {
  if (!io) return;
  io.to(`proposal:${proposalId}`).emit('vote:created', { proposalId, voteCount });
  io.emit('vote:stats', { proposalId, voteCount });
}

export function emitVoteRemoved(proposalId: string, voteCount: number): void {
  if (!io) return;
  io.to(`proposal:${proposalId}`).emit('vote:removed', { proposalId, voteCount });
  io.emit('vote:stats', { proposalId, voteCount });
}

export function emitProposalCreated(proposal: Record<string, unknown>): void {
  if (!io) return;
  io.emit('proposal:created', proposal);
}

export function emitProposalUpdated(proposal: Record<string, unknown>): void {
  if (!io) return;
  io.to(`proposal:${proposal.id}`).emit('proposal:updated', proposal);
  io.emit('proposal:listChanged', { id: proposal.id });
}

export function emitProposalDeleted(proposalId: string): void {
  if (!io) return;
  io.to(`proposal:${proposalId}`).emit('proposal:deleted', { proposalId });
  io.emit('proposal:listChanged', { proposalId });
}

export function emitProposalStatusChanged(proposalId: string, newStatus: string): void {
  if (!io) return;
  io.to(`proposal:${proposalId}`).emit('proposal:statusChanged', { proposalId, status: newStatus });
  io.emit('proposal:listChanged', { proposalId });
}

export function emitCommentCreated(proposalId: string, comment: Record<string, unknown>): void {
  if (!io) return;
  io.to(`proposal:${proposalId}`).emit('comment:created', comment);
}

export function closeSocketServer(): void {
  if (io) {
    io.close();
    io = null;
  }
}
