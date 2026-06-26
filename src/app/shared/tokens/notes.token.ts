import { InjectionToken } from '@angular/core';
import { INotesService } from '../interfaces/notes.service.interface';

export const NOTES_SERVICE_TOKEN = new InjectionToken<INotesService>('INotesService');