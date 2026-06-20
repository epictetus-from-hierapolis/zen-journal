import { inject, Injectable, signal, Signal } from "@angular/core";
import { Notebook } from "../models/note.model";
import { INotebooksService } from "./notebooks.service.interface";
import { HttpClient } from "@angular/common/http";
import { APP_CONFIG } from "../config/app.config.token";
import { HandleError } from "../decorators/handle-error.decorator";
import { firstValueFrom } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class NotebooksService implements INotebooksService {
    private readonly httpClient = inject(HttpClient);
    private readonly appConfig = inject(APP_CONFIG);
    private readonly endpoint = `${this.appConfig.apiUrl}/notebooks`;
    public notebooks = signal<Notebook[]>([]);
    public isLoading = signal<boolean>(false);
    public selectedNotebook = signal<Notebook | null>(null);

    @HandleError
    public async loadNotebooks(): Promise<void> {
        this.isLoading.set(true);
        try {
            const notebooks = await firstValueFrom(this.httpClient.get<Notebook[]>(this.endpoint));
            this.notebooks.set(notebooks);
        } finally {
            this.isLoading.set(false);
        }
    }

    @HandleError
    public async addNotebook(name: string): Promise<void> {
        const newNotebook: Omit<Notebook, 'id'> = { name, createdAt: new Date() };
        const tempId: number = -Date.now();
        const tempNotebook: Notebook = { ...newNotebook, id: tempId };
        this.notebooks.update(notebooks => [...notebooks, tempNotebook]);
        try {
            const { id } = await firstValueFrom(this.httpClient.post<{ id: number }>(this.endpoint, newNotebook));
            this.notebooks.update(notebooks => notebooks.map(notebook => notebook.id === tempId ? { ...notebook, id } : notebook))
        } catch (error) {
            this.notebooks.update(notebooks => notebooks.filter(notebook => notebook.id !== tempId));
            throw error;
        }
    }

    @HandleError
    public async updateNotebook(id: number, changes: Partial<Notebook>): Promise<void> {
        const currentNotebook = this.notebooks().find(notebook => notebook.id === id) ?? null;

        if (!currentNotebook) throw new Error(`Notebook  with ${id} doesn't exist`);

        const copyCurrentNotebook = { ...currentNotebook };

        this.notebooks.update(notebooks => notebooks.map(notebook => notebook.id === id ? { ...notebook, ...changes } : notebook));

        if (this.selectedNotebook()?.id === id) this.selectedNotebook.set({ ...currentNotebook, ...changes });
        try {
            await firstValueFrom(this.httpClient.put(`${this.endpoint}/${id}`, changes));
        } catch (error) {
            if (this.selectedNotebook()?.id === id) this.selectedNotebook.set(copyCurrentNotebook);
            this.notebooks.update(notebooks => notebooks.map(notebook => notebook.id === id ? copyCurrentNotebook : notebook));
            throw error;
        }
    }

    @HandleError
    public async deleteNotebook(id: number): Promise<void> {
        const currentNotebook = this.notebooks().find(notebook => notebook.id === id) ?? null;
        if (!currentNotebook) throw new Error(`Notebook  with ${id} doesn't exist`);

        const currentNotebooks = this.notebooks();
        const previousNotebook = this.selectedNotebook();
        this.notebooks.update(notebooks => notebooks.filter(notebook => notebook.id !== id));
        if (previousNotebook?.id === id) this.selectedNotebook.set(null);

        try {
            await firstValueFrom(this.httpClient.delete(`${this.endpoint}/${id}`));

        } catch (error) {
            this.notebooks.set(currentNotebooks);
            this.selectedNotebook.set(previousNotebook);
            throw error;
        }
    }

    public selectNotebook(notebook: Notebook | null): void {
        this.selectedNotebook.set(notebook);
    }
}
