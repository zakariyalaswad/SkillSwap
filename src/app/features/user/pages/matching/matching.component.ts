import { Component, inject, signal, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatchingService } from '../../../../shared/services/matching.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { SwapService } from '../../../../shared/services/swap.service';
import { User, SwapRequest, SwapRequestStatus, SessionType } from '../../../../models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-matching',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './matching.html',
  styleUrl: './matching.css'
})
export class MatchingComponent implements OnInit {
  private matchingService = inject(MatchingService);
  private authService = inject(AuthService);
  private swapService = inject(SwapService);
  
  @ViewChild('card') cardElement?: ElementRef;
  
  protected matches = signal<User[]>([]);
  protected currentMatchIndex = signal(0);
  protected isLoading = signal(true);
  protected noMoreMatches = signal(false);
  protected swapMessage = signal('');
  protected showSwapRequestModal = signal(false);
  protected selectedSessionType = signal<SessionType>('Online' as SessionType);
  
  // Constants for template
  protected readonly SessionType = SessionType;
  
  private currentUser = this.authService.getCurrentUser();
  
  async ngOnInit() {
    await this.loadMatches();
  }

  /**
   * Set session type with proper casting
   */
  setSessionType(value: string): void {
    this.selectedSessionType.set(value as SessionType);
  }

  /**
   * Set swap message
   */
  setSwapMessage(value: string): void {
    this.swapMessage.set(value);
  }
  
  /**
   * Load matches for the current user
   */
  private async loadMatches() {
    this.isLoading.set(true);
    try {
      if (!this.currentUser) {
        throw new Error('User not found');
      }
      
      const userMatches = await this.matchingService.findMatches(this.currentUser.id);
      this.matches.set(userMatches);
      this.noMoreMatches.set(userMatches.length === 0);
    } catch (error) {
      console.error('Error loading matches:', error);
      Swal.fire('Error', 'Failed to load matches. Please try again.', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }
  
  /**
   * Get current match being viewed
   */
  get currentMatch(): User | null {
    const matches = this.matches();
    if (this.currentMatchIndex() < matches.length) {
      return matches[this.currentMatchIndex()];
    }
    return null;
  }
  
  /**
   * Get common skills between current user and match
   */
  get commonTeachingSkills() {
    if (!this.currentMatch || !this.currentUser) return [];
    
    const currentTeaches = this.currentUser.skillsITeach.map(s => s.name.toLowerCase());
    return this.currentMatch.skillsIWantToLearn.filter(skill => 
      currentTeaches.includes(skill.name.toLowerCase())
    );
  }
  
  /**
   * Get skills we can learn from the match
   */
  get skillsCanLearnFromMatch() {
    if (!this.currentMatch || !this.currentUser) return [];
    
    const currentWants = this.currentUser.skillsIWantToLearn.map(s => s.name.toLowerCase());
    return this.currentMatch.skillsITeach.filter(skill => 
      currentWants.includes(skill.name.toLowerCase())
    );
  }
  
  /**
   * Skip this match and go to next
   */
  skip() {
    if (this.currentMatchIndex() < this.matches().length - 1) {
      this.currentMatchIndex.set(this.currentMatchIndex() + 1);
    } else {
      this.noMoreMatches.set(true);
    }
  }
  
  /**
   * Open swap request modal
   */
  openSwapRequestModal() {
    this.showSwapRequestModal.set(true);
  }
  
  /**
   * Close swap request modal
   */
  closeSwapRequestModal() {
    this.showSwapRequestModal.set(false);
    this.swapMessage.set('');
  }
  
  /**
   * Send swap request
   */
  async sendSwapRequest() {
    if (!this.currentMatch || !this.currentUser) return;
    
    if (this.commonTeachingSkills.length === 0 || this.skillsCanLearnFromMatch.length === 0) {
      Swal.fire('Error', 'No mutual skills found for this match', 'error');
      return;
    }
    
    try {
      const swapRequest: SwapRequest = {
        id: '', // Will be generated
        senderId: this.currentUser.id,
        senderName: this.currentUser.name,
        recipientId: this.currentMatch.id,
        recipientName: this.currentMatch.name,
        skillOffered: this.commonTeachingSkills[0],
        skillRequested: this.skillsCanLearnFromMatch[0],
        message: this.swapMessage(),
        sessionType: this.selectedSessionType(),
        status: SwapRequestStatus.PENDING,
        createdAt: new Date()
      };
      
      await this.swapService.createSwapRequest(swapRequest);
      
      Swal.fire('Success', `Swap request sent to ${this.currentMatch.name}!`, 'success');
      this.closeSwapRequestModal();
      this.skip();
    } catch (error) {
      console.error('Error sending swap request:', error);
      Swal.fire('Error', 'Failed to send swap request. Please try again.', 'error');
    }
  }
  
  /**
   * View full profile
   */
  viewProfile() {
    if (this.currentMatch) {
      // Navigate to user profile view
      console.log('View profile:', this.currentMatch.id);
    }
  }
  
  /**
   * Reload matches
   */
  async reloadMatches() {
    this.currentMatchIndex.set(0);
    this.noMoreMatches.set(false);
    await this.loadMatches();
  }
  
  /**
   * Calculate rating color
   */
  getRatingColor(rating: number): string {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-blue-600';
    if (rating >= 2.5) return 'text-yellow-600';
    return 'text-red-600';
  }
}
