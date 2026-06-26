import { Injectable, inject } from "@angular/core";
import { Note } from '@shared/models';
import { INotesService } from "@shared/interfaces";
import { firstValueFrom } from 'rxjs';
import { HandleError } from "@shared/decorators";
import { HttpClient } from "@angular/common/http";
import { APP_CONFIG } from "@shared/tokens";

@Injectable()
export class NotesService implements INotesService {
    private readonly httpClient = inject(HttpClient);
    private readonly appConfig = inject(APP_CONFIG);
    private readonly endpoint = `${this.appConfig.apiUrl}/notes`;

    @HandleError
    public loadNotes(): Promise<Note[]> {
        return firstValueFrom(this.httpClient.get<Note[]>(this.endpoint));
    }

    @HandleError
    public addNote(note: Omit<Note, 'id'>): Promise<{ id: number }> {
        return firstValueFrom(this.httpClient.post<{ id: number }>(this.endpoint, note));
    }

    @HandleError
    public updateNote(id: number, changes: Partial<Note>): Promise<void> {
        return firstValueFrom(this.httpClient.put<void>(`${this.endpoint}/${id}`, changes));
    }

    @HandleError
    public deleteNote(id: number): Promise<void> {
        return firstValueFrom(this.httpClient.delete<void>(`${this.endpoint}/${id}`));
    }
}
