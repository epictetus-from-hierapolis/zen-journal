import { InjectionToken } from '@angular/core';
import { AppSettings } from '../models/app-settings.model';

export interface AppConfig {
    autosaveDelay: number;
    maxNotesPerNotebook: number;
    appName: string;
    themeAppearence: 'light' | 'dark';
}

const settings: AppSettings = JSON.parse(localStorage.getItem('settings') ?? 'null') ?? { themeAppearence: 'light', autosaveDelay: 800 };
export const APP_CONFIG = new InjectionToken<AppConfig>('AppConfig', {
    providedIn: 'root',
    factory: () => ({
        autosaveDelay: settings.autosaveDelay,
        maxNotesPerNotebook: 100,// TODO: implement in app setings
        appName: 'Zen Journal',
        themeAppearence: settings.themeAppearence
    })
});