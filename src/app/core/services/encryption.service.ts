import { inject, Injectable, signal } from "@angular/core";
import { CRYPTO, LOCAL_STORAGE } from "@shared/tokens";

@Injectable({
    providedIn: 'root'
})
export class EncryptionService {
    private readonly localStorage = inject(LOCAL_STORAGE);
    private readonly crypto = inject(CRYPTO);
    private readonly _isUnlocked = signal<boolean>(false);
    private key: CryptoKey | null = null;

    public readonly isUnlocked = this._isUnlocked.asReadonly();

    public async unlock(password: string): Promise<void> {
        if (!password) return;
        let saltBytes: Uint8Array;
        const saltHex = this.localStorage.getItem('encryption-salt');

        if (!saltHex) {
            saltBytes = this.createSalt();
            this.localStorage.setItem('encryption-salt', this.arrayToHex(saltBytes));
        } else {
            saltBytes = this.hexToArray(saltHex);
        }

        const passwordBytes = new TextEncoder().encode(password); // convert to Uint8Array
        const keyMaterial = await this.crypto.subtle.importKey(
            'raw',                         // Formatul brut
            passwordBytes,                 // Parola convertită în octeți
            'PBKDF2',                      // Algoritmul pentru a genera cheia
            false,                         // Nu se permite extragerea parolei brute
            ['deriveBits', 'deriveKey']    // Permisiunile: pentru derivarea altor chei
        );

        this.key = await this.crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: saltBytes.buffer as ArrayBuffer,              // Salt sub formă de octeți
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
        return this._isUnlocked.set(true);
    }

    public async encrypt(plainText: string): Promise<{ ciphertext: string, iv: string }> {
        if (!this.key) {
            throw new Error("Database is locked");
        }
        const plainTextBytes = new TextEncoder().encode(plainText);
        const ivBytes = this.crypto.getRandomValues(new Uint8Array(12));// genereaza 12 octeti aleatori
        const ciphertext = await this.crypto.subtle.encrypt({ name: 'AES-GCM', iv: ivBytes }, this.key, plainTextBytes);
        const ciphertextHex = this.arrayToHex(new Uint8Array(ciphertext));
        const ivHex = this.arrayToHex(ivBytes);
        return { ciphertext: ciphertextHex, iv: ivHex };
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
    private arrayToHex(bytes: Uint8Array): string {
        return Array.from(bytes).map(byte => byte.toString(16).padStart(2, '0')).join('');
    }

    private hexToArray(hexString: string): Uint8Array {
        const matches = hexString.match(/.{1,2}/g) || [];
        return new Uint8Array(matches.map(byte => parseInt(byte, 16)));
    }

    private createSalt(): Uint8Array {
        return this.crypto.getRandomValues(new Uint8Array(16));
    }
}
