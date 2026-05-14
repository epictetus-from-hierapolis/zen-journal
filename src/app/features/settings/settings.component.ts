import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { APP_CONFIG } from "../../shared/config/app.config.token";
import { themeValidator } from "../../shared/validators/theme.validator";

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [ReactiveFormsModule],
    templateUrl: './settings.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent {
    private readonly fb = inject(NonNullableFormBuilder);
    private readonly appConfig = inject(APP_CONFIG);

    protected settingsForm = this.fb.group({
        debounce: [
            this.appConfig.autosaveDelay,
            [Validators.required, Validators.min(300), Validators.max(3000)]],
        theme: [this.appConfig.theme, [Validators.required, themeValidator()]]
    });

    public async onSubmit(): Promise<void> {

    }



}