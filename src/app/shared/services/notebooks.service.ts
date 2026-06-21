import { inject, Injectable } from "@angular/core";
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

    @HandleError
    public loadNotebooks(): Promise<Notebook[]> {
        return firstValueFrom(this.httpClient.get<Notebook[]>(this.endpoint));
    }

    @HandleError
    public addNotebook(notebook: Notebook): Promise<{ id: number }> {
        return firstValueFrom(this.httpClient.post<{ id: number }>(this.endpoint, notebook));
    }

    @HandleError
    public updateNotebook(id: number, changes: Partial<Notebook>): Promise<void> {
        return firstValueFrom(this.httpClient.put<void>(`${this.endpoint}/${id}`, changes));
    }

    @HandleError
    public deleteNotebook(id: number): Promise<void> {
        return firstValueFrom(this.httpClient.delete<void>(`${this.endpoint}/${id}`));
    }
}
