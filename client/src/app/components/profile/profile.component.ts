import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  profile = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  saveProfile() {
    alert('Profile saved successfully!');
  }
}
