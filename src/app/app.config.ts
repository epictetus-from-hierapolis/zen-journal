import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
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
import { NotesService, NotebooksService, WorkspaceFacadeService, EncryptedNotesService, AppSettingsService } from '@core/services';
import { provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import { authInterceptor, errorInterceptor, dexieBackendInterceptor } from '@core/interceptors';
import { isDevMode } from '@angular/core';
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    NotesService,
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
    }),
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
    provideAppInitializer(() => inject(AppSettingsService).init())
  ],
};
