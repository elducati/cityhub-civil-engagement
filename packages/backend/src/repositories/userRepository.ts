import { BaseRepository } from './baseRepository';

export interface User {
  id: string;
  email: string;
  name: string | null;
  password_hash: string;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  created_at: Date;
  updated_at: Date;
}

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super('users');
  }
}

export const userRepository = new UserRepository();
