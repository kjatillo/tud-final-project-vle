import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordComplexityValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value || '';
        const errors: any = {};
        if (!/[A-Z]/.test(value)) {
            errors.uppercase = true;
        }
        if (!/[0-9]/.test(value)) {
            errors.number = true;
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
            errors.special = true;
        }
        return Object.keys(errors).length ? errors : null;
    };
}