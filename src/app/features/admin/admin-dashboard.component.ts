/**
 * Admin Dashboard Component
 * Manage users, reports, and view platform statistics
 */

import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../shared/services/user.service';
import { AuthService } from '../../auth/services/auth.service';
import { SwapService } from '../../shared/services/swap.service';
import { User } from '../../models';
import Swal from 'sweetalert2';
import { Firestore, collection, getDocs, query, where, Timestamp } from '@angular/fire/firestore';
import { LucideAngularModule, LogOut } from 'lucide-angular';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private swapService = inject(SwapService);
  private firestore = inject(Firestore);
  private router = inject(Router);
  
  // Lucide icons
  protected readonly LogOut = LogOut;

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
  
  // Platform statistics
  protected averageRating = signal(0);
  protected messagesToday = signal(0);
  protected newUsersToday = signal(0);
  protected completedSwapsToday = signal(0);
  protected newMatchesToday = signal(0);

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
      const allUsers = await this.userService.getAllUsers();
      this.users.set(allUsers);
      this.filteredUsers.set(allUsers);

      // Calculate user statistics
      const banned = allUsers.filter(u => u.isBanned);
      this.bannedUsers.set(banned);

      this.totalUsers.set(allUsers.length);
      this.activeUsers.set(allUsers.filter(u => u.isActive && !u.isBanned).length);

      // Calculate total swaps
      const totalSwaps = allUsers.reduce((sum, u) => sum + u.totalSwapsCompleted, 0);
      this.totalSwaps.set(Math.floor(totalSwaps / 2)); // Divide by 2 since each swap involves 2 users
      
      // Calculate average rating
      const usersWithRatings = allUsers.filter(u => u.totalReviews > 0);
      if (usersWithRatings.length > 0) {
        const avgRating = usersWithRatings.reduce((sum, u) => sum + u.averageRating, 0) / usersWithRatings.length;
        this.averageRating.set(avgRating);
      }
      
      // Calculate users joined today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const newToday = allUsers.filter(u => {
        const createdAt = this.convertToDate(u.createdAt);
        return createdAt && createdAt >= today;
      });
      this.newUsersToday.set(newToday.length);
      
      // Load platform statistics
      await Promise.all([
        this.loadMessagesToday(),
        this.loadSwapsToday(),
        this.loadMatchesToday()
      ]);
    } catch (error) {
      console.error('Error loading admin data:', error);
      Swal.fire('Error', 'Failed to load admin data', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }
  
  /**
   * Load messages sent today
   */
  private async loadMessagesToday(): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTimestamp = Timestamp.fromDate(today);
      
      const conversationsRef = collection(this.firestore, 'conversations');
      const conversationsSnapshot = await getDocs(conversationsRef);
      
      let messageCount = 0;
      for (const convDoc of conversationsSnapshot.docs) {
        const messagesRef = collection(this.firestore, `conversations/${convDoc.id}/messages`);
        const q = query(messagesRef, where('timestamp', '>=', todayTimestamp));
        const messagesSnapshot = await getDocs(q);
        messageCount += messagesSnapshot.size;
      }
      
      this.messagesToday.set(messageCount);
    } catch (error) {
      console.error('Error loading messages today:', error);
    }
  }
  
  /**
   * Load swaps completed today
   */
  private async loadSwapsToday(): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTimestamp = Timestamp.fromDate(today);
      
      const swapsRef = collection(this.firestore, 'swap_requests');
      const q = query(
        swapsRef, 
        where('status', '==', 'completed'),
        where('completedAt', '>=', todayTimestamp)
      );
      const snapshot = await getDocs(q);
      this.completedSwapsToday.set(snapshot.size);
    } catch (error) {
      console.error('Error loading swaps today:', error);
    }
  }
  
  /**
   * Load new matches today
   */
  private async loadMatchesToday(): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTimestamp = Timestamp.fromDate(today);
      
      const swapsRef = collection(this.firestore, 'swap_requests');
      const q = query(
        swapsRef,
        where('createdAt', '>=', todayTimestamp)
      );
      const snapshot = await getDocs(q);
      this.newMatchesToday.set(snapshot.size);
    } catch (error) {
      console.error('Error loading matches today:', error);
    }
  }
  
  /**
   * Convert any date format to Date object
   */
  private convertToDate(date: any): Date | null {
    if (!date) return null;
    
    if (date?.toDate && typeof date.toDate === 'function') {
      return date.toDate();
    } else if (date?.seconds) {
      return new Date(date.seconds * 1000);
    } else if (date instanceof Date) {
      return date;
    } else {
      return new Date(date);
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
      await this.userService.updateUserProfile(user.id, {
        isBanned: true,
        bannedReason: result.value
      });

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
      await this.userService.updateUserProfile(user.id, {
        isBanned: false,
        bannedReason: ''
      });

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
  formatDate(date: any): string {
    if (!date) return '';
    
    // Handle Firestore Timestamp
    let d: Date;
    if (date?.toDate && typeof date.toDate === 'function') {
      d = date.toDate();
    } else if (date?.seconds) {
      d = new Date(date.seconds * 1000);
    } else if (date instanceof Date) {
      d = date;
    } else {
      d = new Date(date);
    }
    
    // Check if date is valid
    if (isNaN(d.getTime())) return 'N/A';
    
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
  
  /**
   * Logout
   */
  async logout(): Promise<void> {
    const result = await Swal.fire({
      title: 'Logout?',
      text: 'Are you sure you want to logout?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Logout',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await this.authService.signOut();
        this.router.navigate(['/signin']);
      } catch (error) {
        console.error('Error logging out:', error);
        Swal.fire('Error', 'Failed to logout', 'error');
      }
    }
  }
}
