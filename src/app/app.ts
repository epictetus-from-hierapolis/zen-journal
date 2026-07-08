import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppSettingsService, AuthService, EncryptionService } from '@core/services';
import { UnlockComponent } from './features/auth/unlock.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, UnlockComponent],
  standalone: true,
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  protected readonly authService = inject(AuthService);
  protected readonly encryptionService = inject(EncryptionService);
  private readonly appSettingsService = inject(AppSettingsService);
}
