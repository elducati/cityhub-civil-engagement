import { BaseRepository } from './baseRepository';
import type { AuthUser } from '../types/express.d';

export interface User {
  id: string;
  email: string;
  name: string | null;
  password_hash: string;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserInput {
  email: string;
  name?: string;
  password_hash: string;
  role?: 'USER' | 'MODERATOR' | 'ADMIN';
}

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super('users');
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.db(this.tableName).where('email', email).first() as Promise<User | null>;
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.db(this.tableName)
      .select('id', 'email', 'name', 'password_hash', 'role', 'created_at', 'updated_at')
      .where('email', email)
      .first() as Promise<User | null>;
  }

  async findPublicProfile(id: string): Promise<AuthUser | null> {
    const user = await this.db(this.tableName)
      .select('id', 'email', 'role', 'created_at')
      .where('id', id)
      .first();
    
    if (!user) return null;
    
    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  async createWithPassword(input: CreateUserInput): Promise<User> {
    return this.create(input);
  }

  async findByIds(ids: string[]): Promise<User[]> {
    return this.db(this.tableName)
      .select('id', 'email', 'name', 'role', 'created_at')
      .whereIn('id', ids) as Promise<User[]>;
  }
}

export const userRepository = new UserRepository();