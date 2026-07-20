import { computed, inject, Injectable, signal } from "@angular/core";
import { HandleError } from "@shared/decorators";
import { EncryptionService } from "./encryption.service";
import { SESSION_STORAGE, WORKSPACE_FACADE_SERVICE_TOKEN } from "@shared/tokens";
import { STORAGE_KEYS } from '@shared/constants/storage-keys';
import { Router } from "@angular/router";
import { AppSettingsService } from "./app-settings.service";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly encryptionService = inject(EncryptionService);
    private readonly appSettingsService = inject(AppSettingsService);
    private readonly workspaceFacadeService = inject(WORKSPACE_FACADE_SERVICE_TOKEN);
    private readonly sessionStorage = inject(SESSION_STORAGE);
    private readonly router = inject(Router);

    private readonly _isAuthenticated = signal<boolean>(
        !!this.sessionStorage.getItem(STORAGE_KEYS.AUTH)
    );
    private readonly _currentUser = signal<string>(this.appSettingsService.username() || '');

    public readonly isAuthenticated = this._isAuthenticated.asReadonly();
    public readonly currentUser = this._currentUser.asReadonly();
    public readonly hasSavedUsername = computed(() => !!this.appSettingsService.username());

    @HandleError
    public async login(username: string, password: string): Promise<boolean> {
        if (!username || !password) return false;
        if (this.encryptionService.isPasswordSet()) {
            const unlocked = await this.encryptionService.unlock(password);
            if (!unlocked) return false;
        } else {
            const cryptoData = await this.encryptionService.setupPassword(password);

            await this.appSettingsService.saveEncryptionSettings(
                cryptoData.salt,
                cryptoData.ciphertext,
                cryptoData.iv,
                username
            );
        }
        this.sessionStorage.setItem(STORAGE_KEYS.AUTH, 'true');

        this._isAuthenticated.set(true);
        this._currentUser.set(username);
        return true;
    }

    @HandleError
    public async logout(): Promise<void> {
        await this.router.navigate(['/login']);
        this.sessionStorage.removeItem(STORAGE_KEYS.AUTH);
        this.encryptionService.lock();
        this.workspaceFacadeService.reset();
        this._isAuthenticated.set(false);
        this._currentUser.set('');
    }
}