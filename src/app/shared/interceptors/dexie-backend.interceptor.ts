import { HttpEvent, HttpInterceptorFn, HttpRequest, HttpResponse } from "@angular/common/http";
import { inject } from "@angular/core";
import { from, map, Observable, of } from "rxjs";
import { DatabaseService } from "../services/database.service";
import { Note, Notebook } from "../models/note.model";
import { Table } from "dexie";

type DbRecord = Notebook | Note;

const VALID_TABLES = ['notes', 'notebooks', 'tags'];

export const dexieBackendInterceptor: HttpInterceptorFn = (req, next): Observable<HttpEvent<unknown>> => {
    const databaseService = inject(DatabaseService);
    const parts = req.url.split('/');
    const tableName = VALID_TABLES.find(table => parts.includes(table));

    if (!tableName) return next(req);

    const table = databaseService.table(tableName) as Table<DbRecord, number>;
    const id = Number(parts[parts.indexOf(tableName) + 1]);

    if (tableName) {

        const resp = new HttpResponse(
            {
                status: 200
            }
        );

        switch (req.method) {
            case 'GET':
                return from(databaseService.table(tableName).toArray()).pipe(
                    map((items: DbRecord[]) => new HttpResponse({
                        body: items
                    }))
                );
            case 'POST': {
                return from(databaseService.table(tableName).add(<Omit<DbRecord, 'id'>>req.body)).pipe(
                    map((id) => new HttpResponse({
                        status: 200,
                        body: { id: id as number }
                    }))
                );
            }
            case 'PUT': {
                const id = Number(parts[parts.indexOf(tableName) + 1]);
                if (!id) new HttpResponse({
                    status: 400
                });
                return from(databaseService.table(tableName).update(id, (req.body as Partial<DbRecord>))).pipe(
                    map(() => new HttpResponse({
                        status: 200
                    }))
                );
            }
            case 'DELETE': {
                if (tableName === 'notebooks') {
                    return from(databaseService.transaction('rw', [databaseService.notebooks, databaseService.notes],
                        async () => {
                            await databaseService.notebooks.delete(id);
                            await databaseService.notes.where('notebookId').equals(id).delete();

                        }
                    )).pipe(
                        map(() => new HttpResponse({
                            status: 200
                        }))
                    );
                } else {
                    return from(databaseService.table(tableName).delete(id)).pipe(
                        map(() => new HttpResponse({
                            status: 200
                        }))
                    );
                }

            }

            default:
                return of(resp);
        }

    }
    return next(req);
} 