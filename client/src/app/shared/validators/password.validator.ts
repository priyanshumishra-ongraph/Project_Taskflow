import { AbstractControl, ValidationErrors } from '@angular/forms';

// Custom validator to check password strength (uppercase, lowercase, number, special char, min 12 chars)
export function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value || '';

  const errors: ValidationErrors = {};
  if (value.length < 12) errors['minlength'] = true;
  if (!/[A-Z]/.test(value)) errors['missingUppercase'] = true;
  if (!/[a-z]/.test(value)) errors['missingLowercase'] = true;
  if (!/[0-9]/.test(value)) errors['missingNumber'] = true;
  if (!/[^a-zA-Z0-9]/.test(value)) errors['missingSpecialChar'] = true;

  return Object.keys(errors).length > 0 ? errors : null;
}

// Custom validator to check if passwords match
export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  // We only return a mismatch error if both fields exist, have values, and don't match.
  if (password && confirmPassword && password.value !== confirmPassword.value && confirmPassword.value) {
    return { 'passwordMismatch': true };
  }
  return null;
}
