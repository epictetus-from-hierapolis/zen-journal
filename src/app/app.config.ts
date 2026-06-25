import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { NOTES_SERVICE_TOKEN } from './shared/services/notes.token';
import { NOTEBOOKS_SERVICE_TOKEN } from './shared/services/notebooks.token';
import { NotesService } from './shared/services/notes.service';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { errorInterceptor } from './shared/interceptors/error.interceptor';
import { authInterceptor } from './shared/interceptors/auth.interceptor';
import { dexieBackendInterceptor } from './shared/interceptors/dexie-backend.interceptor';
import { NotebooksService } from './shared/services/notebooks.service';
import { WORKSPACE_FACADE_SERVICE_TOKEN } from './shared/services/workspace-facade.token';
import { WorkspaceFacadeService } from './shared/services/workspace-facade.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor, dexieBackendInterceptor])
    ),
    provideRouter(routes, withComponentInputBinding()),
    {
      provide: NOTES_SERVICE_TOKEN,
      useClass: NotesService
    },
    {
      provide: NOTEBOOKS_SERVICE_TOKEN,
      useClass: NotebooksService
    },
    {
      provide: WORKSPACE_FACADE_SERVICE_TOKEN,
      useClass: WorkspaceFacadeService
    },
  ]
};
