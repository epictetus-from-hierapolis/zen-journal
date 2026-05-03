import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthService } from "../../shared/services/auth.service";
import { Router } from "@angular/router";

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ReactiveFormsModule],
    templateUrl: './login.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
    private readonly authService = inject(AuthService);
    private readonly routerService = inject(Router);
    private readonly fb = inject(NonNullableFormBuilder)

    protected readonly errorMessage = signal<string>('');

    protected loginForm = this.fb.group({
        username: ['', Validators.required],
        password: ['', Validators.required]
    });

    protected async onSubmit(): Promise<void> {
        const { username, password } = this.loginForm.getRawValue();
        const success = await this.authService.login(username, password);

        if (success) {
            this.routerService.navigate(['/']);
        } else {
            this.errorMessage.set("Credentiale gresite!");
        }
    }
}