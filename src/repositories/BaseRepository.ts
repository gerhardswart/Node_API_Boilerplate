import {
    getDatabaseClient,
    type IDatabaseClient,
    type QueryOptions,
    type Filters,
} from '../config/database';
import type { IPaginatedResult } from '../types';

/**
 * Base repository class with common CRUD operations
 * Uses dependency injection for the database client
 */
export abstract class BaseRepository<T> {
    protected tableName: string;
    protected getClient: () => IDatabaseClient;

    constructor(tableName: string, getClient: () => IDatabaseClient = getDatabaseClient) {
        this.tableName = tableName;
        this.getClient = getClient;
    }

    /**
     * Find all records with pagination
     */
    async findAll(options: QueryOptions = {}): Promise<IPaginatedResult<T>> {
        const client = this.getClient();
        return client.findAll<T>(this.tableName, options);
    }

    /**
     * Find by ID
     */
    async findById(id: string): Promise<T | null> {
        const client = this.getClient();
        return client.findById<T>(this.tableName, id);
    }

    /**
     * Create a new record
     */
    async create(recordData: Partial<T>): Promise<T> {
        const client = this.getClient();
        return client.create<T>(this.tableName, recordData as Record<string, unknown>);
    }

    /**
     * Update a record by ID
     */
    async update(id: string, updates: Partial<T>): Promise<T | null> {
        const client = this.getClient();
        return client.update<T>(this.tableName, id, updates as Record<string, unknown>);
    }

    /**
     * Delete a record by ID
     */
    async delete(id: string): Promise<boolean> {
        const client = this.getClient();
        return client.delete(this.tableName, id);
    }

    /**
     * Find by a single field
     */
    async findBy(field: keyof T, value: unknown): Promise<T | null> {
        const client = this.getClient();
        return client.findOne<T>(
            this.tableName,
            field as string,
            value as string | number | boolean | null
        );
    }

    /**
     * Find all by a field
     */
    async findAllBy(field: keyof T, value: unknown): Promise<T[]> {
        const client = this.getClient();
        return client.findMany<T>(this.tableName, {
            [field]: value as string | number | boolean | null,
        });
    }

    /**
     * Check if record exists
     */
    async exists(id: string): Promise<boolean> {
        const client = this.getClient();
        return client.exists(this.tableName, id);
    }

    /**
     * Count records
     */
    async count(filters: Filters = {}): Promise<number> {
        const client = this.getClient();
        return client.count(this.tableName, filters);
    }
}

export default BaseRepository;
