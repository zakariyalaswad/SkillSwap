import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../auth/services/auth.service';
import { UserService } from '../../../../shared/services/user.service';
import { SwapService } from '../../../../shared/services/swap.service';
import { User, Skill, SwapRequest, SwapRequestStatus, SessionType } from '../../../../models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-suggestions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './suggestions.html',
})
export class Suggestions implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private swapService = inject(SwapService);
  private router = inject(Router);

  protected isLoading = signal(false);
  protected suggestions = signal<User[]>([]);
  protected currentUser = signal<User | null>(null);

  // Swipe card state
  protected currentCardIndex = signal(0);
  protected swipeDirection = signal<'left' | 'right' | null>(null);
  protected isAnimating = signal(false);

  async ngOnInit(): Promise<void> {
    this.isLoading.set(true);
    try {
      const user = this.authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      this.currentUser.set(user);

      // Load active users and filter by those who can teach what current user wants to learn
      const users = await this.userService.getAllActiveUsers();
      const filtered = users
        .filter(u => u.id !== user.id)
        .filter(u => this.getMatchingTeachSkills(u).length > 0);
      this.suggestions.set(filtered);
    } catch (error) {
      console.error('Error loading suggestions:', error);
      Swal.fire('Error', 'Failed to load suggestions', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  // Skills this user can teach that I want to learn
  protected getMatchingTeachSkills(other: User): Skill[] {
    const me = this.currentUser();
    if (!me) return [];
    const wantNames = (me.skillsIWantToLearn || []).map(s => s.name.toLowerCase());
    return (other.skillsITeach || []).filter(s => wantNames.includes(s.name.toLowerCase()));
  }

  // Pick a skill I can offer (fallback to first teaching skill)
  protected pickOfferedSkill(): Skill | null {
    const me = this.currentUser();
    if (!me || !me.skillsITeach || me.skillsITeach.length === 0) return null;
    return me.skillsITeach[0];
  }

  async sendSwapRequest(toUser: User): Promise<void> {
    const me = this.currentUser();
    if (!me) return;

    const requested = this.getMatchingTeachSkills(toUser)[0];
    const offered = this.pickOfferedSkill();

    if (!requested) {
      Swal.fire('Info', 'No matching skill found to request from this user.', 'info');
      return;
    }
    if (!offered) {
      Swal.fire('Info', 'Please add at least one skill you can teach before sending a request.', 'info');
      return;
    }

    try {
      const swapRequest: SwapRequest = {
        id: '',
        senderId: me.id,
        senderName: me.name,
        recipientId: toUser.id,
        recipientName: toUser.name,
        skillOffered: offered,
        skillRequested: requested,
        message: `Hi ${toUser.name}, I'd love to learn ${requested.name}! I can teach ${offered.name}.`,
        sessionType: (me.preferOnline ? 'Online' : (me.preferOffline ? 'Offline' : 'Hybrid')) as SessionType,
        status: SwapRequestStatus.PENDING,
        createdAt: new Date()
      };

      await this.swapService.createSwapRequest(swapRequest);
      Swal.fire('Success', 'Swap request sent!', 'success');
    } catch (error) {
      console.error('Error sending swap request:', error);
      Swal.fire('Error', 'Failed to send swap request', 'error');
    }
  }

  // Navigate to the public profile page
  viewProfile(user: User): void {
    this.router.navigate(['/home/profil', user.id]);
  }

  /**
   * Handle card swipe left (pass)
   */
  swipeLeft(): void {
    if (this.isAnimating()) return;
    const users = this.suggestions();
    if (this.currentCardIndex() >= users.length) return;

    this.isAnimating.set(true);
    this.swipeDirection.set('left');

    setTimeout(() => {
      this.currentCardIndex.update(i => i + 1);
      this.swipeDirection.set(null);
      this.isAnimating.set(false);
    }, 300);
  }

  /**
   * Handle card swipe right (like/request)
   */
  swipeRight(): void {
    if (this.isAnimating()) return;
    const users = this.suggestions();
    const index = this.currentCardIndex();
    if (index >= users.length) return;

    const user = users[index];
    this.isAnimating.set(true);
    this.swipeDirection.set('right');

    setTimeout(async () => {
      await this.sendSwapRequest(user);
      this.currentCardIndex.update(i => i + 1);
      this.swipeDirection.set(null);
      this.isAnimating.set(false);
    }, 300);
  }

  /**
   * Reset to first card
   */
  resetCards(): void {
    this.currentCardIndex.set(0);
    this.swipeDirection.set(null);
    this.isAnimating.set(false);
  }

  /**
   * Get current card
   */
  getCurrentCard(): User | null {
    const users = this.suggestions();
    const index = this.currentCardIndex();
    return index < users.length ? users[index] : null;
  }

  /**
   * Get next cards for preview (up to 2)
   */
  getNextCards(): User[] {
    const users = this.suggestions();
    const index = this.currentCardIndex();
    return users.slice(index + 1, index + 3);
  }
}
