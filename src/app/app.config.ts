import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { NOTES_SERVICE_TOKEN } from './shared/services/notes.token';
import { NotesService } from './shared/services/notes.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    {
      provide: NOTES_SERVICE_TOKEN,
      useClass: NotesService
    }
  ]
};
