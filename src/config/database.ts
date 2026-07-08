import type { IPaginatedResult, IPagination } from '../types';

/**
 * Database query options
 */
export interface QueryOptions {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
}

/**
 * Database filter conditions
 */
export type FilterValue = string | number | boolean | null;
export type Filters = Record<string, FilterValue>;

/**
 * Database client interface
 * Abstract interface for database operations
 * Implement this interface to connect to any database (PostgreSQL, MySQL, MongoDB, etc.)
 */
export interface IDatabaseClient {
    /**
     * Find all records with pagination
     */
    findAll<T>(table: string, options?: QueryOptions): Promise<IPaginatedResult<T>>;

    /**
     * Find a single record by ID
     */
    findById<T>(table: string, id: string): Promise<T | null>;

    /**
     * Find a single record by field value
     */
    findOne<T>(table: string, field: string, value: FilterValue): Promise<T | null>;

    /**
     * Find all records matching filters
     */
    findMany<T>(table: string, filters?: Filters, options?: QueryOptions): Promise<T[]>;

    /**
     * Create a new record
     */
    create<T>(table: string, data: Record<string, unknown>): Promise<T>;

    /**
     * Update a record by ID
     */
    update<T>(table: string, id: string, data: Record<string, unknown>): Promise<T | null>;

    /**
     * Delete a record by ID
     */
    delete(table: string, id: string): Promise<boolean>;

    /**
     * Count records
     */
    count(table: string, filters?: Filters): Promise<number>;

    /**
     * Check if record exists
     */
    exists(table: string, id: string): Promise<boolean>;
}

/**
 * In-memory placeholder database implementation
 * This is a placeholder that stores data in memory.
 * Replace with actual database implementation (PostgreSQL, MySQL, MongoDB, etc.)
 */
class InMemoryDatabase implements IDatabaseClient {
    private data: Map<string, Map<string, Record<string, unknown>>> = new Map();
    private idCounter: Map<string, number> = new Map();

    private getTable(table: string): Map<string, Record<string, unknown>> {
        if (!this.data.has(table)) {
            this.data.set(table, new Map());
        }
        return this.data.get(table)!;
    }

    private generateId(table: string): string {
        const counter = (this.idCounter.get(table) || 0) + 1;
        this.idCounter.set(table, counter);
        return `${table.slice(0, 3)}-${counter.toString().padStart(8, '0')}-${Date.now().toString(16)}`;
    }

    async findAll<T>(table: string, options: QueryOptions = {}): Promise<IPaginatedResult<T>> {
        const tableData = this.getTable(table);
        const { page = 1, limit = 10, sort = 'created_at', order = 'desc' } = options;

        const records = Array.from(tableData.values());

        // Sort
        records.sort((a, b) => {
            const aVal = a[sort];
            const bVal = b[sort];
            if (aVal === bVal) return 0;
            const cmp = aVal! < bVal! ? -1 : 1;
            return order === 'asc' ? cmp : -cmp;
        });

        const total = records.length;
        const offset = (page - 1) * limit;
        const paginatedRecords = records.slice(offset, offset + limit);

        return {
            data: paginatedRecords as T[],
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            } as IPagination,
        };
    }

    async findById<T>(table: string, id: string): Promise<T | null> {
        const tableData = this.getTable(table);
        return (tableData.get(id) as T) || null;
    }

    async findOne<T>(table: string, field: string, value: FilterValue): Promise<T | null> {
        const tableData = this.getTable(table);
        for (const record of tableData.values()) {
            if (record[field] === value) {
                return record as T;
            }
        }
        return null;
    }

    async findMany<T>(table: string, filters?: Filters, options?: QueryOptions): Promise<T[]> {
        const tableData = this.getTable(table);
        let records = Array.from(tableData.values());

        // Apply filters
        if (filters) {
            records = records.filter((record) => {
                return Object.entries(filters).every(([key, value]) => {
                    if (value === null) {
                        return record[key] === null || record[key] === undefined;
                    }
                    return record[key] === value;
                });
            });
        }

        // Sort if options provided
        if (options?.sort) {
            const { sort, order = 'desc' } = options;
            records.sort((a, b) => {
                const aVal = a[sort];
                const bVal = b[sort];
                if (aVal === bVal) return 0;
                const cmp = aVal! < bVal! ? -1 : 1;
                return order === 'asc' ? cmp : -cmp;
            });
        }

        return records as T[];
    }

    async create<T>(table: string, data: Record<string, unknown>): Promise<T> {
        const tableData = this.getTable(table);
        const id = (data.id as string) || this.generateId(table);
        const now = new Date().toISOString();

        const record = {
            ...data,
            id,
            created_at: data.created_at || now,
            updated_at: data.updated_at || now,
        };

        tableData.set(id, record);
        return record as T;
    }

    async update<T>(table: string, id: string, data: Record<string, unknown>): Promise<T | null> {
        const tableData = this.getTable(table);
        const existing = tableData.get(id);

        if (!existing) {
            return null;
        }

        const updated = {
            ...existing,
            ...data,
            id,
            created_at: existing.created_at,
            updated_at: new Date().toISOString(),
        };

        tableData.set(id, updated);
        return updated as T;
    }

    async delete(table: string, id: string): Promise<boolean> {
        const tableData = this.getTable(table);
        return tableData.delete(id);
    }

    async count(table: string, filters?: Filters): Promise<number> {
        const tableData = this.getTable(table);

        if (!filters || Object.keys(filters).length === 0) {
            return tableData.size;
        }

        let count = 0;
        for (const record of tableData.values()) {
            const matches = Object.entries(filters).every(([key, value]) => {
                if (value === null) {
                    return record[key] === null || record[key] === undefined;
                }
                return record[key] === value;
            });
            if (matches) count++;
        }
        return count;
    }

    async exists(table: string, id: string): Promise<boolean> {
        const tableData = this.getTable(table);
        return tableData.has(id);
    }
}

// Database client singleton
let dbClient: IDatabaseClient | null = null;

/**
 * Get database client instance
 * Replace this with your actual database connection logic
 */
export const getDatabaseClient = (): IDatabaseClient => {
    if (!dbClient) {
        // Using in-memory placeholder for development
        // Replace with: PostgreSQL, MySQL, MongoDB, or other database client
        dbClient = new InMemoryDatabase();
    }
    return dbClient;
};

/**
 * Set database client (for testing or custom implementations)
 */
export const setDatabaseClient = (client: IDatabaseClient): void => {
    dbClient = client;
};

/**
 * Reset database (for testing)
 */
export const resetDatabase = (): void => {
    dbClient = null;
};
