import { inject, InjectionToken } from "@angular/core";

export const WINDOW = new InjectionToken<Window>('Window', {
    providedIn: 'root',
    factory: () => window
});

export const CRYPTO = new InjectionToken<Crypto>('Crypto', {
    providedIn: 'root',
    factory: () => inject(WINDOW).crypto
});

export const SESSION_STORAGE = new InjectionToken<Storage>('SessionStorage', {
    providedIn: 'root',
    factory: () => inject(WINDOW).sessionStorage
});