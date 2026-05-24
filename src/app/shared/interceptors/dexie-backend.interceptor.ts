import { HttpEvent, HttpInterceptorFn, HttpRequest, HttpResponse } from "@angular/common/http";
import { inject } from "@angular/core";
import { from, map, Observable, of } from "rxjs";
import { DatabaseService } from "../services/database.service";
import { Note } from "../models/note.model";

export const dexieBackendInterceptor: HttpInterceptorFn = (req, next): Observable<HttpEvent<unknown>> => {
    if (req.url.startsWith('/api/notes')) {
        const resp = new HttpResponse(
            {
                status: 200
            }
        );
        const databaseService = inject(DatabaseService);
        switch (req.method) {
            case 'GET':
                return from(databaseService.notes.toArray()).pipe(
                    map((notes: Note[]) => new HttpResponse({
                        body: notes
                    }))
                );
            case 'POST': {
                return from(databaseService.notes.add(<Omit<Note, 'id'>>req.body)).pipe(
                    map((id: number) => new HttpResponse({
                        status: 200,
                        body: { id }
                    }))
                );
            }
            case 'PUT': {
                const id = Number(req.url.match(/\/api\/notes\/(\d+)/)?.[1]);
                return from(databaseService.notes.update(id, (req.body as Partial<Note>))).pipe(
                    map(() => new HttpResponse({
                        status: 200
                    }))
                );
            }
            case 'DELETE': {
                const id = Number(req.url.match(/\/api\/notes\/(\d+)/)?.[1]);
                return from(databaseService.notes.delete(id)).pipe(
                    map(() => new HttpResponse({
                        status: 200
                    }))
                );
            }

            default:
                return of(resp);
        }

    }
    return next(req);
} 