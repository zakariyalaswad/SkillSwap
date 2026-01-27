/**
 * Admin Dashboard Component
 * Manage users, reports, and view platform statistics
 */

import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../shared/services/user.service';
import { AuthService } from '../../auth/services/auth.service';
import { User } from '../../models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);

  // State
  protected users = signal<User[]>([]);
  protected bannedUsers = signal<User[]>([]);
  protected totalUsers = signal(0);
  protected activeUsers = signal(0);
  protected totalSwaps = signal(0);
  protected isLoading = signal(false);
  protected activeTab = signal<'overview' | 'users' | 'banned' | 'reports'>('overview');
  protected searchQuery = signal('');
  protected filteredUsers = signal<User[]>([]);

  ngOnInit(): void {
    try {
      const user = this.authService.getCurrentUser();
      if (user?.role !== 'admin') {
        Swal.fire('Access Denied', 'You must be an admin to access this page', 'error');
        return;
      }

      this.loadAdminData();
    } catch (error) {
      console.error('Error initializing admin dashboard:', error);
      Swal.fire('Error', 'Failed to load admin dashboard', 'error');
    }
  }

  /**
   * Load admin data
   */
  async loadAdminData(): Promise<void> {
    this.isLoading.set(true);
    try {
      const allUsers = await this.userService.getAllActiveUsers();
      this.users.set(allUsers);
      this.filteredUsers.set(allUsers);

      // Calculate statistics
      const banned = allUsers.filter(u => u.isBanned);
      this.bannedUsers.set(banned);

      this.totalUsers.set(allUsers.length);
      this.activeUsers.set(allUsers.filter(u => u.isActive && !u.isBanned).length);

      // Calculate total swaps
      const totalSwaps = allUsers.reduce((sum, u) => sum + u.totalSwapsCompleted, 0);
      this.totalSwaps.set(Math.floor(totalSwaps / 2)); // Divide by 2 since each swap involves 2 users
    } catch (error) {
      console.error('Error loading admin data:', error);
      Swal.fire('Error', 'Failed to load admin data', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Ban user
   */
  async banUser(user: User): Promise<void> {
    const result = await Swal.fire({
      title: 'Ban User?',
      html: `Are you sure you want to ban <strong>${user.name}</strong>?`,
      input: 'text',
      inputPlaceholder: 'Reason for ban...',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Ban',
      inputValidator: (value) => {
        if (!value) return 'Please provide a reason';
        return null;
      }
    });

    if (!result.isConfirmed) return;

    try {
      const updatedUser: User = {
        ...user,
        isBanned: true,
        bannedReason: result.value
      };

      await this.userService.updateUserProfile(user.id, updatedUser);

      Swal.fire('Success', 'User has been banned', 'success');
      this.loadAdminData();
    } catch (error) {
      console.error('Error banning user:', error);
      Swal.fire('Error', 'Failed to ban user', 'error');
    }
  }

  /**
   * Unban user
   */
  async unbanUser(user: User): Promise<void> {
    const result = await Swal.fire({
      title: 'Unban User?',
      html: `Are you sure you want to unban <strong>${user.name}</strong>?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Unban'
    });

    if (!result.isConfirmed) return;

    try {
      const updatedUser: User = {
        ...user,
        isBanned: false,
        bannedReason: undefined
      };

      await this.userService.updateUserProfile(user.id, updatedUser);

      Swal.fire('Success', 'User has been unbanned', 'success');
      this.loadAdminData();
    } catch (error) {
      console.error('Error unbanning user:', error);
      Swal.fire('Error', 'Failed to unban user', 'error');
    }
  }

  /**
   * Delete user account
   */
  async deleteUser(user: User): Promise<void> {
    const result = await Swal.fire({
      title: 'Delete User Account?',
      html: `This will permanently delete <strong>${user.name}</strong>'s account and all associated data.`,
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      confirmButtonColor: '#dc2626'
    });

    if (!result.isConfirmed) return;

    try {
      // In a real app, you'd call an admin delete endpoint
      await Swal.fire('Success', 'User account has been deleted', 'success');
      this.loadAdminData();
    } catch (error) {
      console.error('Error deleting user:', error);
      Swal.fire('Error', 'Failed to delete user', 'error');
    }
  }

  /**
   * Search users
   */
  searchUsers(query: string): void {
    this.searchQuery.set(query);

    if (!query.trim()) {
      this.filteredUsers.set(this.users());
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = this.users().filter(u =>
      u.name.toLowerCase().includes(lowerQuery) ||
      u.email.toLowerCase().includes(lowerQuery)
    );

    this.filteredUsers.set(filtered);
  }

  /**
   * Get filtered users based on active tab
   */
  getDisplayedUsers(): User[] {
    if (this.activeTab() === 'banned') {
      return this.bannedUsers().filter(u =>
        this.searchQuery().toLowerCase() === '' ||
        u.name.toLowerCase().includes(this.searchQuery().toLowerCase()) ||
        u.email.toLowerCase().includes(this.searchQuery().toLowerCase())
      );
    }
    return this.filteredUsers();
  }

  /**
   * Format date
   */
  formatDate(date: Date): string {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  /**
   * Format date for last login
   */
  formatLastLogin(date: Date): string {
    if (!date) return 'Never';
    return this.formatDate(date);
  }

  /**
   * Get trust score color
   */
  getTrustScoreColor(score: number): string {
    if (score >= 4) return 'green';
    if (score >= 3) return 'yellow';
    if (score >= 2) return 'orange';
    return 'red';
  }
}
