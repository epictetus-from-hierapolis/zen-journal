import { Signal } from "@angular/core";
import { Notebook } from "../models/note.model";

export interface INotebooksService {
    notebooks: Signal<Notebook[]>;
    isLoading: Signal<boolean>;
    loadNotebooks(): Promise<void>;
    addNotebook(notebook: Omit<Notebook, 'id'>): Promise<void>;
    updateNotebook(id: number, changes: Partial<Notebook>): Promise<void>;
    deleteNotebook(id: number): Promise<void>;
}