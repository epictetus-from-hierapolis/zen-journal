import { DOCUMENT, inject, Injectable, signal } from "@angular/core";
import { AppSettings, ThemeAppearence } from "@shared/models";
import { APP_CONFIG } from "@shared/tokens";

@Injectable({
    providedIn: 'root'
})
export class AppSettingsService {
    private document = inject(DOCUMENT);
    private readonly appConfig = inject(APP_CONFIG);
    public themeAppearence = signal<ThemeAppearence>(this.appConfig.themeAppearence);
    public autosaveDelay = signal<number>(this.appConfig.autosaveDelay);

    constructor() {
        if (this.appConfig.themeAppearence === 'dark') {
            this.document.documentElement.classList.add(this.appConfig.themeAppearence);
        }
    }

    public setThemeAppearence(themeAppearence: ThemeAppearence): void {
        if (themeAppearence === this.themeAppearence()) return;
        this.document.documentElement.classList.remove(this.themeAppearence());
        this.document.documentElement.classList.add(themeAppearence);
        this.themeAppearence.set(themeAppearence);
        this.saveSettings();
    }

    public updateAutosaveDelay(autosaveDelay: number): void {
        this.autosaveDelay.set(autosaveDelay);
        this.saveSettings();
    }

    private saveSettings(): void {
        localStorage.setItem('settings', JSON.stringify({
            themeAppearence: this.themeAppearence(),
            autosaveDelay: this.autosaveDelay()
        }));
    }
}