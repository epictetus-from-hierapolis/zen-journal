import { DOCUMENT, inject, Injectable, signal } from "@angular/core";
import { AppSettings, Theme } from "../models/app-settings.model";

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private document = inject(DOCUMENT);
    private settings: AppSettings = JSON.parse(localStorage.getItem('settings') ?? 'null') ?? { theme: 'light' };
    public theme = signal<Theme>(this.settings.theme);

    constructor() {
        if (this.settings.theme === 'dark') {
            this.document.documentElement.classList.add(this.settings.theme);
        }
    }

    public toggleTheme() {
        const isDark: boolean = this.document.documentElement.classList.toggle('dark');
        const theme = isDark ? 'dark' : 'light';
        localStorage.setItem('settings', JSON.stringify({ theme }));
        this.theme.set(theme);
    }
}