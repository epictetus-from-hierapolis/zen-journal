import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function themeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const valid = control.value === 'light' || control.value === 'dark';
        return valid ? null : { invalidTheme: { value: control.value } }
    };
}