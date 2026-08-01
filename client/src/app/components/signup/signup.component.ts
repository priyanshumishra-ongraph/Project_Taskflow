import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
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
  router = inject(Router);
  
  submittedSuccessfully = false;
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
      console.log('Form Submitted!', this.signupForm.value);
      this.submittedSuccessfully = true;
      
      // Reset the form back to pristine state
      this.signupForm.reset();
      
      // Remove success message and redirect after 1.5 seconds
      setTimeout(() => {
        this.submittedSuccessfully = false;
        this.router.navigate(['/login']);
      }, 1500);
    } else {
      // Mark all fields as touched so errors display if they try to submit an empty form
      this.signupForm.markAllAsTouched();
    }
  }
}
