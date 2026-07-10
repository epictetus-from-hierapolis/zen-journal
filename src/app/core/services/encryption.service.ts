import { inject, Injectable, signal } from "@angular/core";
import { CRYPTO, LOCAL_STORAGE } from "@shared/tokens";
import { STORAGE_KEYS } from '@shared/constants/storage-keys';

@Injectable({
    providedIn: 'root'
})
export class EncryptionService {
    private readonly localStorage = inject(LOCAL_STORAGE);
    private readonly crypto = inject(CRYPTO);
    private readonly _isUnlocked = signal<boolean>(false);
    private key: CryptoKey | null = null;
    private readonly verificationPlaintext: string = 'vrabiuta-ciugule';

    public readonly isUnlocked = this._isUnlocked.asReadonly();

    public async unlock(password: string): Promise<boolean> {
        if (!password) return false;

        const [salt, ciphertext, iv] = [
            this.localStorage.getItem(STORAGE_KEYS.ENCRYPTION_SALT),
            this.localStorage.getItem(STORAGE_KEYS.VERIFICATION_CIPHERTEXT),
            this.localStorage.getItem(STORAGE_KEYS.VERIFICATION_IV)
        ];

        if (!salt || !ciphertext || !iv) {
            return false;
        }

        try {
            this.key = await this.deriveKey(password, this.hexToArray(salt));
            const verificationPlaintext = await this.decrypt(ciphertext, iv);
            if (verificationPlaintext === this.verificationPlaintext) {
                this._isUnlocked.set(true);
                return true;
            }
        } catch (error) {

        }

        this.lock();
        return false;

    }

    private async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {

        const passwordBytes = new TextEncoder().encode(password); // convert to Uint8Array
        const keyMaterial = await this.crypto.subtle.importKey(
            'raw',                         // Formatul brut
            passwordBytes,                 // Parola convertită în octeți
            'PBKDF2',                      // Algoritmul pentru a genera cheia
            false,                         // Nu se permite extragerea parolei brute
            ['deriveBits', 'deriveKey']    // Permisiunile: pentru derivarea altor chei
        );

        return await this.crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt.buffer as ArrayBuffer,              // Salt sub formă de octeți
                iterations: 100000,           // Numărul de iterații pentru securitate
                hash: 'SHA-256'               // Funcția de dispersie
            },
            keyMaterial,                      // Parola importată din pasul anterior
            {
                name: 'AES-GCM',              // Algoritmul folosit pentru criptarea notițelor
                length: 256                   // Dimensiunea cheii (AES-256)
            },
            false,                            // Nu se permite exportarea cheii în afara browserului
            ['encrypt', 'decrypt']            // Utilizări permise
        );
    }

    public async encrypt(plainText: string): Promise<{ ciphertext: string, iv: string }> {
        if (!this.key) {
            throw new Error('Encryption service is locked.');
        }
        const plainTextBytes = new TextEncoder().encode(plainText);
        const ivBytes = this.crypto.getRandomValues(new Uint8Array(12));// genereaza 12 octeti aleatori
        const ciphertext = await this.crypto.subtle.encrypt({ name: 'AES-GCM', iv: ivBytes }, this.key, plainTextBytes);
        const ciphertextHex = this.arrayToHex(new Uint8Array(ciphertext));
        const ivHex = this.arrayToHex(ivBytes);
        return { ciphertext: ciphertextHex, iv: ivHex };
    }

    public lock(): void {
        this.key = null;
        this._isUnlocked.set(false);
    }

    public async decrypt(ciphertext: string, iv: string): Promise<string> {
        if (!this.key) {
            throw new Error("Database is locked");
        }
        const ciphertextBytes = this.hexToArray(ciphertext);
        const ivBytes = this.hexToArray(iv);

        const decrypted = await this.crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: ivBytes.buffer as ArrayBuffer },
            this.key,
            ciphertextBytes.buffer as ArrayBuffer
        );

        return new TextDecoder().decode(decrypted);
    }

    public isPasswordSet(): boolean {
        return !!this.localStorage.getItem(STORAGE_KEYS.ENCRYPTION_SALT);
    }

    public async setupPassword(password: string): Promise<void> { // ruleaza la primul contact
        if (!password) throw new Error('Password is missing.')

        const salt = this.createSalt();
        const key = await this.deriveKey(password, salt);
        this.key = key;
        const canary = await this.encrypt(this.verificationPlaintext);

        this.localStorage.setItem(STORAGE_KEYS.VERIFICATION_CIPHERTEXT, canary.ciphertext);
        this.localStorage.setItem(STORAGE_KEYS.VERIFICATION_IV, canary.iv);
        this.localStorage.setItem(STORAGE_KEYS.ENCRYPTION_SALT, this.arrayToHex(salt));

        this._isUnlocked.set(true);
    }

    private arrayToHex(bytes: Uint8Array): string {
        return Array.from(bytes).map(byte => byte.toString(16).padStart(2, '0')).join('');
    }

    private hexToArray(hex: string): Uint8Array {
        if (!/^[0-9a-fA-F]+$/.test(hex) || hex.length % 2 !== 0) {
            throw new Error('Invalid hex string');
        }
        const matches = hex.match(/.{1,2}/g) || [];
        return new Uint8Array(matches.map(byte => parseInt(byte, 16)));
    }

    private createSalt(): Uint8Array {
        return this.crypto.getRandomValues(new Uint8Array(16));
    }
}
