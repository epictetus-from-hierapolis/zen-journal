import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import {
  NOTES_SERVICE_TOKEN,
  NOTEBOOKS_SERVICE_TOKEN,
  WORKSPACE_FACADE_SERVICE_TOKEN,
} from '@shared/tokens';
import { NotesService, NotebooksService, WorkspaceFacadeService, EncryptedNotesService } from '@core/services';
import { provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import { authInterceptor, errorInterceptor, dexieBackendInterceptor } from '@core/interceptors';

export const appConfig: ApplicationConfig = {
  providers: [
    NotesService,
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(
      withXhr(),
      withInterceptors([authInterceptor, errorInterceptor, dexieBackendInterceptor]),
    ),
    provideRouter(routes, withComponentInputBinding()),
    {
      provide: NOTES_SERVICE_TOKEN,
      useClass: EncryptedNotesService,
    },
    {
      provide: NOTEBOOKS_SERVICE_TOKEN,
      useClass: NotebooksService,
    },
    {
      provide: WORKSPACE_FACADE_SERVICE_TOKEN,
      useClass: WorkspaceFacadeService,
    },
  ],
};
