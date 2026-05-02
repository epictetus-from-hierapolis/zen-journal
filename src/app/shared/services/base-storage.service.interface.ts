export interface IBaseStorageService<T> {
    add(item: Omit<T, 'id'>): Promise<Number>;
    update(id: number, changes: Partial<T>): Promise<void>;
    delete(id: number): Promise<void>;
    getAll(): Promise<T[]>;
}