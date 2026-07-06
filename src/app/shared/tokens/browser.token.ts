import { inject, InjectionToken } from "@angular/core";

export const WINDOW = new InjectionToken<Window>('Window', {
    providedIn: 'root',
    factory: () => window
});

export const CRYPTO = new InjectionToken<Crypto>('Crypto', {
    providedIn: 'root',
    factory: () => inject(WINDOW).crypto
});

export const LOCAL_STORAGE = new InjectionToken<Storage>('LocalStorage', {
    providedIn: 'root',
    factory: () => inject(WINDOW).localStorage
});