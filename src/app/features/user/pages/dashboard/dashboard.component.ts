/**
 * Dashboard Component
 * Shows user statistics and swap history
 */

import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../auth/services/auth.service';
import { SwapService } from '../../../../shared/services/swap.service';
import { RatingService } from '../../../../shared/services/rating.service';
import { User, Swap, Rating } from '../../../../models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private swapService = inject(SwapService);
  private ratingService = inject(RatingService);
  
  protected currentUser = signal<User | null>(null);
  protected completedSwaps = signal<Swap[]>([]);
  protected userRatings = signal<Rating[]>([]);
  protected isLoading = signal(true);
  
  // Statistics
  protected totalSwaps = signal(0);
  protected totalSkillsTaught = signal(0);
  protected totalSkillsLearned = signal(0);
  protected averageRating = signal(0);
  protected trustScore = signal(0);
  
  async ngOnInit() {
    await this.loadData();
  }
  
  /**
   * Load user data and statistics
   */
  private async loadData() {
    this.isLoading.set(true);
    try {
      const user = this.authService.getCurrentUser();
      if (!user) {
        throw new Error('User not found');
      }
      
      this.currentUser.set(user);
      
      // Load completed swaps
      const swaps = await this.swapService.getCompletedSwaps(user.id);
      this.completedSwaps.set(swaps);
      
      // Load ratings
      const ratings = await this.ratingService.getUserRatings(user.id);
      this.userRatings.set(ratings);
      
      // Update statistics
      this.totalSwaps.set(user.totalSwapsCompleted);
      this.totalSkillsTaught.set(user.totalSkillsTaught);
      this.totalSkillsLearned.set(user.totalSkillsLearned);
      this.averageRating.set(user.averageRating);
      this.trustScore.set(user.trustScore);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      this.isLoading.set(false);
    }
  }
  
  /**
   * Get rating color based on value
   */
  getRatingColor(rating: number): string {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-blue-600';
    if (rating >= 2.5) return 'text-yellow-600';
    return 'text-red-600';
  }
  
  /**
   * Format date for display
   */
  formatDate(date: Date | { toDate?: () => Date }): string {
    let actualDate: Date;
    if (date instanceof Date) {
      actualDate = date;
    } else if (date && typeof date === 'object' && 'toDate' in date) {
      actualDate = (date as any).toDate();
    } else {
      return 'Unknown';
    }
    return actualDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
