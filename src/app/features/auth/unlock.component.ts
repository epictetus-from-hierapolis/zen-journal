import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { AuthService, EncryptionService } from "@core/services";

@Component({
    selector: 'app-unlock',
    standalone: true,
    templateUrl: './unlock.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnlockComponent {
    protected readonly authService = inject(AuthService);

    private readonly encryptionService = inject(EncryptionService);
    protected readonly password = signal<string>('');
    protected readonly errorMessage = signal<string>('');

    protected onPasswordType(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.password.set(input.value);
    }

    protected async onSubmit(): Promise<void> {
        const unlocked = await this.encryptionService.unlock(this.password());
        if (!unlocked) {
            this.errorMessage.set('Wrong password')
        }
    }

    protected async onLogout(): Promise<void> {
        await this.authService.logout();
    }
}