import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { passwordStrengthValidator, passwordMatchValidator } from '../../shared/validators/password.validator';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  fb = inject(FormBuilder);
  
  submittedSuccessfully = false;

  // Initialize the Reactive Form
  signupForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, passwordStrengthValidator]],
    confirmPassword: ['']
  }, { validators: passwordMatchValidator });

  // Password requirement checkers for the checklist UI
  passwordVal(): string {
    return this.signupForm.get('password')?.value || '';
  }

  hasMinLength(): boolean {
    return this.passwordVal().length >= 12;
  }

  hasUppercase(): boolean {
    return /[A-Z]/.test(this.passwordVal());
  }

  hasLowercase(): boolean {
    return /[a-z]/.test(this.passwordVal());
  }

  hasNumber(): boolean {
    return /[0-9]/.test(this.passwordVal());
  }

  hasSpecialChar(): boolean {
    return /[^a-zA-Z0-9]/.test(this.passwordVal());
  }

  // Helper method for template to check field validity cleanly
  isFieldInvalid(fieldName: string): boolean {
    const field = this.signupForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  onSubmit() {
    if (this.signupForm.valid) {
      console.log('Form Submitted!', this.signupForm.value);
      this.submittedSuccessfully = true;
      
      // Reset the form back to pristine state
      this.signupForm.reset();
      
      // Remove success message after 4 seconds
      setTimeout(() => {
        this.submittedSuccessfully = false;
      }, 4000);
    } else {
      // Mark all fields as touched so errors display if they try to submit an empty form
      this.signupForm.markAllAsTouched();
    }
  }
}
