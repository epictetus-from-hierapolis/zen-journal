import { Signal } from "@angular/core";
import { Notebook } from "../models/note.model";

export interface INotebooksService {
    notebooks: Signal<Notebook[]>;
    isLoading: Signal<boolean>;
    selectedNotebook: Signal<Notebook | null>;
    loadNotebooks(): Promise<void>;
    addNotebook(name: string): Promise<void>;
    updateNotebook(id: number, changes: Partial<Notebook>): Promise<void>;
    deleteNotebook(id: number): Promise<void>;
    selectNotebook(notebook: Notebook | null): void;
}