import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { passwordStrengthValidator, passwordMatchValidator } from '../../shared/validators/password.validator';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  fb = inject(FormBuilder);
  router = inject(Router);
  http = inject(HttpClient);
  
  submittedSuccessfully = false;
  errorMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Initialize the Reactive Form
  signupForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, passwordStrengthValidator]],
    confirmPassword: ['']
  }, { validators: passwordMatchValidator });

  // Helper method for template to check field validity cleanly
  isFieldInvalid(fieldName: string): boolean {
    const field = this.signupForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  onSubmit() {
    if (this.signupForm.valid) {
      this.errorMessage = '';
      const formValue = this.signupForm.value;
      
      this.http.post(`${environment.apiUrl}/auth/register`, {
        name: formValue.username,
        email: formValue.email,
        password: formValue.password
      }).subscribe({
        next: () => {
          this.submittedSuccessfully = true;
          this.signupForm.reset();
          
          setTimeout(() => {
            this.submittedSuccessfully = false;
            this.router.navigate(['/login']);
          }, 1500);
        },
        error: (err) => {
          this.errorMessage = err.error?.error || 'Signup failed. Please try again.';
        }
      });
    } else {
      this.signupForm.markAllAsTouched();
    }
  }
}
