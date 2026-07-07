import { getSupabaseClient } from '../config/database';
import type { IPaginatedResult, IPagination } from '../types';

interface FindAllOptions {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Base repository class with common CRUD operations
 */
export abstract class BaseRepository<T> {
  protected tableName: string;
  protected getClient = getSupabaseClient;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  /**
   * Find all records with pagination
   */
  async findAll(options: FindAllOptions = {}): Promise<IPaginatedResult<T>> {
    const client = this.getClient();
    const { page = 1, limit = 10, sort = 'created_at', order = 'desc' } = options;
    const offset = (page - 1) * limit;

    const { data, error, count } = await client
      .from(this.tableName)
      .select('*', { count: 'exact' })
      .order(sort, { ascending: order === 'asc' })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return {
      data: data as T[],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      } as IPagination,
    };
  }

  /**
   * Find by ID
   */
  async findById(id: string): Promise<T | null> {
    const client = this.getClient();
    const { data, error } = await client.from(this.tableName).select('*').eq('id', id).maybeSingle();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data as T | null;
  }

  /**
   * Create a new record
   */
  async create(recordData: Partial<T>): Promise<T> {
    const client = this.getClient();
    const { data, error } = await client.from(this.tableName).insert(recordData as Record<string, unknown>).select().single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data as T;
  }

  /**
   * Update a record by ID
   */
  async update(id: string, updates: Partial<T>): Promise<T | null> {
    const client = this.getClient();
    const { data, error } = await client
      .from(this.tableName)
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data as T | null;
  }

  /**
   * Delete a record by ID
   */
  async delete(id: string): Promise<boolean> {
    const client = this.getClient();
    const { error } = await client.from(this.tableName).delete().eq('id', id);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return true;
  }

  /**
   * Find by a single field
   */
  async findBy(field: keyof T, value: unknown): Promise<T | null> {
    const client = this.getClient();
    const { data, error } = await client
      .from(this.tableName)
      .select('*')
      .eq(field as string, value)
      .maybeSingle();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data as T | null;
  }

  /**
   * Find all by a field
   */
  async findAllBy(field: keyof T, value: unknown): Promise<T[]> {
    const client = this.getClient();
    const { data, error } = await client.from(this.tableName).select('*').eq(field as string, value);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data as T[];
  }

  /**
   * Check if record exists
   */
  async exists(id: string): Promise<boolean> {
    const record = await this.findById(id);
    return record !== null;
  }

  /**
   * Count records
   */
  async count(filters: Partial<Record<keyof T, unknown>> = {}): Promise<number> {
    const client = this.getClient();
    let query = client.from(this.tableName).select('*', { count: 'exact', head: true });

    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value);
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return count || 0;
  }
}

export default BaseRepository;
