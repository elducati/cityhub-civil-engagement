import { Knex } from 'knex';
import { getDatabase } from '../config/database';

export abstract class BaseRepository<T extends { id: string }> {
  protected db: Knex;
  protected tableName: string;

  constructor(tableName: string) {
    this.db = getDatabase();
    this.tableName = tableName;
  }

  async findById(id: string): Promise<T | null> {
    return this.db(this.tableName).where('id', id).first() as Promise<T | null>;
  }

  async findAll(): Promise<T[]> {
    return this.db(this.tableName).select('*') as Promise<T[]>;
  }

  async create(data: Partial<T>): Promise<T> {
    const [result] = await this.db(this.tableName).insert(data).returning('*');
    return result as T;
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    const [result] = await this.db(this.tableName)
      .where('id', id)
      .update(data)
      .returning('*');
    return result as T | null;
  }

  async delete(id: string): Promise<boolean> {
    const count = await this.db(this.tableName).where('id', id).del();
    return count > 0;
  }

  async exists(id: string): Promise<boolean> {
    const result = await this.db(this.tableName).where('id', id).first();
    return !!result;
  }
}