export type ThemeAppearence = 'light' | 'dark';
export interface AppSettings {
    themeAppearence: ThemeAppearence;
    autosaveDelay: number;
}
export interface SettingRecord {
    key: string;
    value: unknown;
}