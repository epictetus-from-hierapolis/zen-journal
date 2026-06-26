import { Signal } from "@angular/core";
import { Notebook } from "../models/note.model";

export interface INotebooksService {
    loadNotebooks(): Promise<Notebook[]>;
    addNotebook(notebook: Notebook): Promise<{ id: number }>;
    updateNotebook(id: number, changes: Partial<Notebook>): Promise<void>;
    deleteNotebook(id: number): Promise<void>;
}