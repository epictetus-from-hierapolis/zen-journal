import { InjectionToken } from '@angular/core';
import { AppSettings } from '../models/app-settings.model';
import { SESSION_STORAGE } from './browser.token';

export interface AppConfig {
    autosaveDelay: number;
    maxNotesPerNotebook: number;
    appName: string;
    themeAppearence: 'light' | 'dark';
    apiUrl: string;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('AppConfig', {
    providedIn: 'root',
    factory: () => ({
        autosaveDelay: 800,
        maxNotesPerNotebook: 100,// TODO: implement in app setings
        appName: 'Zen Journal',
        themeAppearence: 'dark',
        apiUrl: '/api'
    })
});