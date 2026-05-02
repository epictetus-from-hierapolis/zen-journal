import { Table, UpdateSpec } from "dexie";
import { IBaseStorageService } from "./base-storage.service.interface";

export abstract class BaseStorageService<T> implements IBaseStorageService<T> {

    constructor(protected readonly table: Table<T, number>) { }

    public async add(item: Omit<T, "id">): Promise<number> {
        return await this.table.add(item as T);
    }
    public async update(id: number, changes: Partial<T>): Promise<void> {
        await this.table.update(id, changes as UpdateSpec<T>);
    }
    public async delete(id: number): Promise<void> {
        await this.table.delete(id);
    }
    public async getAll(): Promise<T[]> {
        return await this.table.toArray();
    }
}