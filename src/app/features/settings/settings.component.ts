import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { APP_CONFIG } from "../../shared/config/app.config.token";
import { themeValidator } from "../../shared/validators/theme.validator";
import { AppSettingsService } from "../../shared/services/app-settings.service";
import { Router, RouterLink } from "@angular/router";

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './settings.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent {
    private readonly fb = inject(NonNullableFormBuilder);
    private readonly routerService = inject(Router);
    private readonly appSettingsService = inject(AppSettingsService);
    private readonly appConfig = inject(APP_CONFIG);

    protected submitted: boolean = false;

    protected settingsForm = this.fb.group({
        autosaveDelay: [
            this.appConfig.autosaveDelay,
            [Validators.required, Validators.min(300), Validators.max(3000)]],
        themeAppearence: [this.appSettingsService.themeAppearence(), [Validators.required, themeValidator()]]
    });

    protected get autosaveDelayControl() {
        return this.settingsForm.get('autosaveDelay');
    }

    public async onSubmit(): Promise<void> {
        this.submitted = true;
        if (this.settingsForm.invalid) return;
        const { autosaveDelay, themeAppearence } = this.settingsForm.getRawValue();
        this.appSettingsService.setThemeAppearence(themeAppearence);
        this.appSettingsService.updateAutosaveDelay(autosaveDelay);
        this.submitted = false;
        this.settingsForm.markAsPristine();
        this.routerService.navigate(['/']);
    }
}