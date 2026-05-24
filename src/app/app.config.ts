import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { NOTES_SERVICE_TOKEN } from './shared/services/notes.token';
import { NotesService } from './shared/services/notes.service';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { errorInterceptor } from './shared/interceptors/error.interceptor';
import { authInterceptor } from './shared/interceptors/auth.interceptor';
import { dexieBackendInterceptor } from './shared/interceptors/dexie-backend.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor, dexieBackendInterceptor])
    ),
    provideRouter(routes),
    {
      provide: NOTES_SERVICE_TOKEN,
      useClass: NotesService
    },
  ]
};
