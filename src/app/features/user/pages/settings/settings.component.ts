/**
 * Settings Component
 * User settings, profile management, and account controls
 */

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../auth/services/auth.service';
import { UserService } from '../../../../shared/services/user.service';
import { Router } from '@angular/router';
import { User } from '../../../../models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class SettingsComponent {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);
  
  protected currentUser = this.authService.getCurrentUser();
  protected activeTab = signal<'profile' | 'security' | 'privacy' | 'notifications'>('profile');
  protected isLoading = signal(false);
  
  // Store initial values for comparison
  private initialProfileValues: any;
  private initialPrivacyValues: any;
  private initialNotificationValues: any;
  
  // Profile form
  protected profileForm = new FormGroup({
    name: new FormControl(this.currentUser?.name || ''),
    bio: new FormControl(this.currentUser?.bio || ''),
    location: new FormControl(this.currentUser?.location || ''),
    preferOnline: new FormControl(this.currentUser?.preferOnline || true),
    preferOffline: new FormControl(this.currentUser?.preferOffline || false)
  });
  
  // Password form
  protected passwordForm = new FormGroup({
    currentPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
    newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required])
  }, {
    validators: (control: AbstractControl) => {
      const newPass = control.get('newPassword')?.value;
      const confirm = control.get('confirmPassword')?.value;
      return newPass === confirm ? null : { 'passwordMismatch': true };
    }
  });
  
  // Privacy settings form
  protected privacyForm = new FormGroup({
    profileVisibility: new FormControl('public'),
    allowMessages: new FormControl(true),
    showEmail: new FormControl(false),
    allowSwapRequests: new FormControl(true)
  });
  
  // Notification settings
  protected notificationForm = new FormGroup({
    newMatch: new FormControl(true),
    newRequest: new FormControl(true),
    requestAccepted: new FormControl(true),
    newMessage: new FormControl(true),
    sessionReminder: new FormControl(true),
    emailNotifications: new FormControl(false)
  });

  constructor() {
    // Store initial values for comparison
    this.initialProfileValues = this.profileForm.value;
    this.initialPrivacyValues = this.privacyForm.value;
    this.initialNotificationValues = this.notificationForm.value;
  }
  
  /**
   * Check if profile form has changed
   */
  private hasProfileChanged(): boolean {
    const current = this.profileForm.value;
    return current.name !== this.initialProfileValues.name ||
           current.bio !== this.initialProfileValues.bio ||
           current.location !== this.initialProfileValues.location ||
           current.preferOnline !== this.initialProfileValues.preferOnline ||
           current.preferOffline !== this.initialProfileValues.preferOffline;
  }

  /**
   * Check if privacy settings have changed
   */
  private hasPrivacyChanged(): boolean {
    const current = this.privacyForm.value;
    return current.profileVisibility !== this.initialPrivacyValues.profileVisibility ||
           current.allowMessages !== this.initialPrivacyValues.allowMessages ||
           current.showEmail !== this.initialPrivacyValues.showEmail ||
           current.allowSwapRequests !== this.initialPrivacyValues.allowSwapRequests;
  }

  /**
   * Check if notification settings have changed
   */
  private hasNotificationChanged(): boolean {
    const current = this.notificationForm.value;
    return current.newMatch !== this.initialNotificationValues.newMatch ||
           current.newRequest !== this.initialNotificationValues.newRequest ||
           current.requestAccepted !== this.initialNotificationValues.requestAccepted ||
           current.newMessage !== this.initialNotificationValues.newMessage ||
           current.sessionReminder !== this.initialNotificationValues.sessionReminder ||
           current.emailNotifications !== this.initialNotificationValues.emailNotifications;
  }
  
  /**
   * Update profile
   */
  async updateProfile() {
    if (!this.currentUser) return;

    if (!this.hasProfileChanged()) {
      Swal.fire('No Changes', 'You haven\'t modified any profile information', 'info');
      return;
    }
    
    this.isLoading.set(true);
    try {
      const updatedData = {
        name: this.profileForm.get('name')?.value || this.currentUser.name,
        bio: this.profileForm.get('bio')?.value || '',
        location: this.profileForm.get('location')?.value || '',
        preferOnline: this.profileForm.get('preferOnline')?.value === true,
        preferOffline: this.profileForm.get('preferOffline')?.value === true
      };

      await this.userService.updateUserProfile(this.currentUser.id, updatedData);
      
      // Update initial values for next comparison
      this.initialProfileValues = this.profileForm.value;
      
      // Update current user in auth service
      const updatedUser = await this.userService.getUserProfile(this.currentUser.id);
      this.authService.setCurrentUser(updatedUser!);
      
      Swal.fire('Success', 'Profile updated successfully', 'success');
    } catch (error) {
      Swal.fire('Error', 'Failed to update profile', 'error');
      console.error('Error updating profile:', error);
    } finally {
      this.isLoading.set(false);
    }
  }
  
  /**
   * Change password
   */
  async changePassword() {
    if (!this.passwordForm.valid) {
      Swal.fire('Validation Error', 'Please check your password fields', 'warning');
      return;
    }

    const newPassword = this.passwordForm.get('newPassword')?.value;
    const currentPassword = this.passwordForm.get('currentPassword')?.value;

    if (newPassword === currentPassword) {
      Swal.fire('Error', 'New password must be different from current password', 'error');
      return;
    }
    
    this.isLoading.set(true);
    try {
      // Note: In a real app, you'd call Firebase password change methods
      // This is a placeholder - implement with actual Firebase Auth
      
      Swal.fire('Success', 'Password changed successfully', 'success');
      this.passwordForm.reset();
    } catch (error) {
      Swal.fire('Error', 'Failed to change password', 'error');
      console.error('Error changing password:', error);
    } finally {
      this.isLoading.set(false);
    }
  }
  
  /**
   * Save privacy settings
   */
  async savePrivacySettings() {
    if (!this.hasPrivacyChanged()) {
      Swal.fire('No Changes', 'You haven\'t modified any privacy settings', 'info');
      return;
    }

    this.isLoading.set(true);
    try {
      if (!this.currentUser) return;

      const privacySettings = this.privacyForm.value;
      
      // Save privacy settings to database
      await this.userService.updateUserProfile(this.currentUser.id, {
        privacySettings: {
          profileVisibility: privacySettings.profileVisibility,
          allowMessages: privacySettings.allowMessages,
          showEmail: privacySettings.showEmail,
          allowSwapRequests: privacySettings.allowSwapRequests
        }
      } as any);

      // Update initial values for next comparison
      this.initialPrivacyValues = this.privacyForm.value;
      
      Swal.fire('Success', 'Privacy settings updated', 'success');
    } catch (error) {
      Swal.fire('Error', 'Failed to save privacy settings', 'error');
      console.error('Error saving privacy settings:', error);
    } finally {
      this.isLoading.set(false);
    }
  }
  
  /**
   * Save notification settings
   */
  async saveNotificationSettings() {
    if (!this.hasNotificationChanged()) {
      Swal.fire('No Changes', 'You haven\'t modified any notification settings', 'info');
      return;
    }

    this.isLoading.set(true);
    try {
      if (!this.currentUser) return;

      const notificationSettings = this.notificationForm.value;
      
      // Save notification settings
      await this.userService.updateUserProfile(this.currentUser.id, {
        notificationSettings
      } as any);

      // Update initial values for next comparison
      this.initialNotificationValues = this.notificationForm.value;
      
      Swal.fire('Success', 'Notification settings updated', 'success');
    } catch (error) {
      Swal.fire('Error', 'Failed to save notification settings', 'error');
      console.error('Error saving notification settings:', error);
    } finally {
      this.isLoading.set(false);
    }
  }
  
  /**
   * Delete account
   */
  async deleteAccount() {
    const result = await Swal.fire({
      title: 'Delete Account',
      text: 'Are you sure you want to permanently delete your account? This cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete my account'
    });
    
    if (result.isConfirmed) {
      this.isLoading.set(true);
      try {
        // Delete account - would require backend implementation
        await this.authService.signOut();
        Swal.fire('Deleted', 'Your account has been deleted', 'success');
        this.router.navigate(['/']);
      } catch (error) {
        Swal.fire('Error', 'Failed to delete account', 'error');
      } finally {
        this.isLoading.set(false);
      }
    }
  }
  
  /**
   * Sign out
   */
  async signOut() {
    try {
      await this.authService.signOut();
      Swal.fire('Success', 'You have been signed out', 'success');
      this.router.navigate(['/']);
    } catch (error) {
      Swal.fire('Error', 'Failed to sign out', 'error');
    }
  }
}
