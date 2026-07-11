import { DOCUMENT, inject, Injectable, signal } from "@angular/core";
import { SettingRecord, ThemeAppearence } from "@shared/models";
import { APP_CONFIG } from "@shared/tokens";
import { DatabaseService } from "./database.service";
import { STORAGE_KEYS } from '@shared/constants/storage-keys';
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class AppSettingsService {
    private document = inject(DOCUMENT);
    private readonly appConfig = inject(APP_CONFIG);
    private readonly databaseService = inject(DatabaseService);
    private readonly httpClient = inject(HttpClient);

    public themeAppearence = signal<ThemeAppearence>(this.appConfig.themeAppearence);
    public autosaveDelay = signal<number>(this.appConfig.autosaveDelay);
    public encriptionSalt = signal<string | null>(null);
    public verificationCiphertext = signal<string | null>(null);
    public verificationIv = signal<string | null>(null);
    public username = signal<string | null>(null);

    constructor() { }

    public async init(): Promise<void> {
        const settings = await firstValueFrom(this.httpClient.get<{ key: string, value: unknown }[]>(`${this.appConfig.apiUrl}/settings`));
        const settingsMap = new Map(settings.map(s => [s.key, s.value]));

        this.themeAppearence.set((settingsMap.get(STORAGE_KEYS.THEME) as ThemeAppearence || this.appConfig.themeAppearence));
        this.autosaveDelay.set((settingsMap.get(STORAGE_KEYS.AUTOSAVE_DELAY) as number) || this.appConfig.autosaveDelay);
        this.encriptionSalt.set(settingsMap.get(STORAGE_KEYS.ENCRYPTION_SALT) as string || null);
        this.verificationCiphertext.set(settingsMap.get(STORAGE_KEYS.VERIFICATION_CIPHERTEXT) as string || null);
        this.verificationIv.set(settingsMap.get(STORAGE_KEYS.VERIFICATION_IV) as string || null);
        this.username.set(settingsMap.get(STORAGE_KEYS.USERNAME) as string || null);

        if (this.themeAppearence() === 'dark') {
            this.document.documentElement.classList.add('dark');
        } else {
            this.document.documentElement.classList.remove('dark');
        }
    }

    public setThemeAppearence(themeAppearence: ThemeAppearence): void {
        if (themeAppearence === this.themeAppearence()) return;
        this.document.documentElement.classList.remove(this.themeAppearence());
        this.document.documentElement.classList.add(themeAppearence);
        this.themeAppearence.set(themeAppearence);
        const body: SettingRecord = { key: STORAGE_KEYS.THEME, value: themeAppearence }
        this.httpClient.put(`${this.appConfig.apiUrl}/settings/${STORAGE_KEYS.THEME}`, body).subscribe();
    }

    public updateAutosaveDelay(autosaveDelay: number): void {
        this.autosaveDelay.set(autosaveDelay);
        const body: SettingRecord = { key: STORAGE_KEYS.AUTOSAVE_DELAY, value: autosaveDelay }
        this.httpClient.put(`${this.appConfig.apiUrl}/settings/${STORAGE_KEYS.AUTOSAVE_DELAY}`, body).subscribe();
    }

    public async saveEncryptionSettings(salt: string, ciphertext: string, iv: string, username: string): Promise<void> {
        this.encriptionSalt.set(salt);
        this.verificationCiphertext.set(ciphertext);
        this.verificationIv.set(iv);
        this.username.set(username);
        await Promise.all([
            firstValueFrom(this.httpClient.put(
                `${this.appConfig.apiUrl}/settings/${STORAGE_KEYS.ENCRYPTION_SALT}`,
                { key: STORAGE_KEYS.ENCRYPTION_SALT, value: salt }
            )),
            firstValueFrom(this.httpClient.put(
                `${this.appConfig.apiUrl}/settings/${STORAGE_KEYS.VERIFICATION_CIPHERTEXT}`,
                { key: STORAGE_KEYS.VERIFICATION_CIPHERTEXT, value: ciphertext }
            )),
            firstValueFrom(this.httpClient.put(
                `${this.appConfig.apiUrl}/settings/${STORAGE_KEYS.VERIFICATION_IV}`,
                { key: STORAGE_KEYS.VERIFICATION_IV, value: iv }
            )),
            firstValueFrom(this.httpClient.put(
                `${this.appConfig.apiUrl}/settings/${STORAGE_KEYS.USERNAME}`,
                { key: STORAGE_KEYS.USERNAME, value: username }
            )),
        ]);
    }
}