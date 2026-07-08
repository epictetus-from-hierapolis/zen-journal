import { inject, Injectable, signal } from "@angular/core";
import { HandleError } from "@shared/decorators";
import { EncryptionService } from "./encryption.service";
import { LOCAL_STORAGE, WORKSPACE_FACADE_SERVICE_TOKEN } from "@shared/tokens";
import { STORAGE_KEYS } from '@shared/constants/storage-keys';
import { Router } from "@angular/router";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly encryptionService = inject(EncryptionService);
    private readonly workspaceFacadeService = inject(WORKSPACE_FACADE_SERVICE_TOKEN);
    private readonly localStorage = inject(LOCAL_STORAGE);
    private readonly router = inject(Router);

    private readonly _isAuthenticated = signal<boolean>(
        !!this.localStorage.getItem(STORAGE_KEYS.AUTH)
    );
    private readonly _currentUser = signal<string>(this.localStorage.getItem(STORAGE_KEYS.USERNAME) || '');

    public readonly isAuthenticated = this._isAuthenticated.asReadonly();
    public readonly currentUser = this._currentUser.asReadonly();

    @HandleError
    public async login(username: string, password: string): Promise<boolean> {
        if (!username || !password) return false;
        if (this.encryptionService.isPasswordSet()) {
            const unlocked = await this.encryptionService.unlock(password);
            if (!unlocked) return false;
        } else {
            await this.encryptionService.setupPassword(password);
        }

        this.localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
        this.localStorage.setItem(STORAGE_KEYS.USERNAME, username);

        this._isAuthenticated.set(true);
        this._currentUser.set(username);
        return true;
    }

    @HandleError
    public async logout(): Promise<void> {
        await this.router.navigate(['/login']);
        this.localStorage.removeItem(STORAGE_KEYS.AUTH);
        this.localStorage.removeItem(STORAGE_KEYS.USERNAME);
        this.encryptionService.lock();
        this.workspaceFacadeService.reset();
        this._isAuthenticated.set(false);
        this._currentUser.set('');
    }
}