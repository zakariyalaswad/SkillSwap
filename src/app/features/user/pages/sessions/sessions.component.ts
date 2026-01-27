/**
 * Sessions Component
 * Manage and schedule skill-swapping sessions
 */

import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SwapService } from '../../../../shared/services/swap.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { Session, SessionStatus } from '../../../../models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sessions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sessions.html',
  styleUrls: ['./sessions.css']
})
export class SessionsComponent implements OnInit {
  private swapService = inject(SwapService);
  private authService = inject(AuthService);

  // State
  protected sessions = signal<Session[]>([]);
  protected upcomingSessions = signal<Session[]>([]);
  protected completedSessions = signal<Session[]>([]);
  protected isLoading = signal(false);
  protected currentUserId = signal<string>('');
  protected activeTab = signal<'upcoming' | 'completed'>('upcoming');

  ngOnInit(): void {
    try {
      const user = this.authService.getCurrentUser();
      if (!user?.id) {
        return;
      }

      this.currentUserId.set(user.id);
      this.loadSessions();
    } catch (error) {
      console.error('Error initializing sessions:', error);
      Swal.fire('Error', 'Failed to initialize sessions', 'error');
    }
  }

  /**
   * Load all sessions for current user
   */
  async loadSessions(): Promise<void> {
    this.isLoading.set(true);
    try {
      // Get completed swaps which contain sessions
      const swaps = await this.swapService.getCompletedSwaps(this.currentUserId());
      const allSessions: Session[] = [];

      // Extract sessions
      for (const swap of swaps) {
        if (swap.session) {
          allSessions.push(swap.session);
        }
      }

      this.sessions.set(allSessions);
      this.categorizeSessions(allSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
      Swal.fire('Error', 'Failed to load sessions', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Categorize sessions by status
   */
  private categorizeSessions(sessions: Session[]): void {
    const now = new Date();

    const upcoming = sessions
      .filter(s => s.status === SessionStatus.SCHEDULED && new Date(s.scheduledAt) > now)
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

    const completed = sessions
      .filter(s => s.status === SessionStatus.COMPLETED)
      .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime());

    this.upcomingSessions.set(upcoming);
    this.completedSessions.set(completed);
  }

  /**
   * Complete a session
   */
  async completeSession(session: Session): Promise<void> {
    const result = await Swal.fire({
      title: 'Mark as Complete?',
      text: 'You will then be able to rate this session.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Complete'
    });

    if (!result.isConfirmed) return;

    try {
      // Update session status
      const updatedSession: Session = {
        ...session,
        status: SessionStatus.COMPLETED,
        completedAt: new Date()
      };

      // Save in Firebase (placeholder - would need backend update method)
      await Swal.fire('Success', 'Session completed! You can now leave a rating.', 'success');
      this.loadSessions();
    } catch (error) {
      console.error('Error completing session:', error);
      Swal.fire('Error', 'Failed to complete session', 'error');
    }
  }

  /**
   * Cancel a session
   */
  async cancelSession(session: Session): Promise<void> {
    const result = await Swal.fire({
      title: 'Cancel Session?',
      text: 'The other participant will be notified.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Cancel'
    });

    if (!result.isConfirmed) return;

    try {
      // Update session status
      const updatedSession: Session = {
        ...session,
        status: SessionStatus.CANCELLED
      };

      await Swal.fire('Info', 'Session cancelled.', 'info');
      this.loadSessions();
    } catch (error) {
      console.error('Error cancelling session:', error);
      Swal.fire('Error', 'Failed to cancel session', 'error');
    }
  }

  /**
   * Join session
   */
  joinSession(session: Session): void {
    if (session.meetingLink) {
      window.open(session.meetingLink, '_blank');
    } else {
      Swal.fire('Info', 'Meeting link not available', 'info');
    }
  }

  /**
   * Get filtered sessions
   */
  getFilteredSessions(): Session[] {
    return this.activeTab() === 'upcoming' ? this.upcomingSessions() : this.completedSessions();
  }

  /**
   * Get status color
   */
  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      [SessionStatus.SCHEDULED]: 'blue',
      [SessionStatus.ONGOING]: 'yellow',
      [SessionStatus.COMPLETED]: 'green',
      [SessionStatus.CANCELLED]: 'red'
    };
    return colors[status] || 'gray';
  }

  /**
   * Format date for display
   */
  formatDate(date: Date): string {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Check if session is upcoming
   */
  isUpcoming(session: Session): boolean {
    return session.status === SessionStatus.SCHEDULED && new Date(session.scheduledAt) > new Date();
  }

  /**
   * Check if can join (within 15 minutes)
   */
  canJoinSession(session: Session): boolean {
    if (session.status !== SessionStatus.SCHEDULED) return false;

    const now = new Date();
    const sessionTime = new Date(session.scheduledAt);
    const diffMinutes = (sessionTime.getTime() - now.getTime()) / (1000 * 60);

    return diffMinutes <= 15 && diffMinutes >= -session.duration;
  }
}
