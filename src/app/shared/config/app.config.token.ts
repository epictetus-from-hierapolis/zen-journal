import { InjectionToken } from '@angular/core';

export interface AppConfig {
    autosaveDelay: number;
    maxNotesPerNotebook: number;
    appName: string;
    theme: 'light' | 'dark';
}

export const APP_CONFIG = new InjectionToken<AppConfig>('AppConfig', {
    providedIn: 'root',
    factory: () => ({
        autosaveDelay: 800,
        maxNotesPerNotebook: 100,
        appName: 'Zen Journal',
        theme: 'light'
    })
});