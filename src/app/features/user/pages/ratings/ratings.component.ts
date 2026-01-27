/**
 * Ratings Component
 * View and manage user ratings and reviews
 */

import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RatingService } from '../../../../shared/services/rating.service';
import { UserService } from '../../../../shared/services/user.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { Rating, User } from '../../../../models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ratings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './ratings.html',
  styleUrls: ['./ratings.css']
})
export class RatingsComponent implements OnInit {
  private ratingService = inject(RatingService);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  // Expose Math for template
  protected Math = Math;

  // State
  protected receivedRatings = signal<Rating[]>([]);
  protected givenRatings = signal<Rating[]>([]);
  protected targetUser = signal<User | null>(null);
  protected isLoading = signal(false);
  protected currentUserId = signal<string>('');
  protected activeTab = signal<'received' | 'given'>('received');
  protected showRatingModal = signal(false);
  protected ratingForm!: FormGroup;
  protected selectedRating = signal<number>(0);

  ngOnInit(): void {
    try {
      const user = this.authService.getCurrentUser();
      if (!user?.id) {
        return;
      }

      this.currentUserId.set(user.id);
      this.initializeForm();

      // Check if viewing specific user
      this.route.queryParams.subscribe(params => {
        if (params['userId']) {
          this.loadUserWithRatings(params['userId']);
        } else {
          this.loadRatings();
        }
      });
    } catch (error) {
      console.error('Error initializing ratings:', error);
      Swal.fire('Error', 'Failed to initialize ratings', 'error');
    }
  }

  private initializeForm(): void {
    this.ratingForm = new FormGroup({
      rating: new FormControl(0, [Validators.required, Validators.min(1), Validators.max(5)]),
      review: new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(500)])
    });
  }

  /**
   * Load ratings for current user
   */
  async loadRatings(): Promise<void> {
    this.isLoading.set(true);
    try {
      // Get ratings received by current user
      const received = await this.ratingService.getUserRatings(this.currentUserId());
      this.receivedRatings.set(received);

      // Get ratings given by current user
      const given = await this.ratingService.getRatingsByUser(this.currentUserId());
      this.givenRatings.set(given);
    } catch (error) {
      console.error('Error loading ratings:', error);
      Swal.fire('Error', 'Failed to load ratings', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Load specific user with their ratings
   */
  async loadUserWithRatings(userId: string): Promise<void> {
    this.isLoading.set(true);
    try {
      const user = await this.userService.getUserProfile(userId);
      this.targetUser.set(user);

      const ratings = await this.ratingService.getUserRatings(userId);
      this.receivedRatings.set(ratings);
    } catch (error) {
      console.error('Error loading user ratings:', error);
      Swal.fire('Error', 'Failed to load user ratings', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Open rating modal
   */
  openRatingModal(targetUserId: string): void {
    this.showRatingModal.set(true);
    this.selectedRating.set(0);
    this.ratingForm.reset();
  }

  /**
   * Close rating modal
   */
  closeRatingModal(): void {
    this.showRatingModal.set(false);
    this.ratingForm.reset();
  }

  /**
   * Submit rating
   */
  async submitRating(targetUserId: string, targetUserName: string): Promise<void> {
    if (!this.ratingForm.valid || this.selectedRating() === 0) {
      Swal.fire('Error', 'Please provide a rating and review', 'error');
      return;
    }

    try {
      this.isLoading.set(true);

      const rating: Rating = {
        id: '',
        ratedById: this.currentUserId(),
        ratedByName: this.authService.getCurrentUser()?.name || 'Unknown',
        ratedUserId: targetUserId,
        ratedUserName: targetUserName,
        rating: this.selectedRating(),
        review: this.ratingForm.get('review')?.value,
        category: 'teaching' as any,
        createdAt: new Date()
      };

      await this.ratingService.createRating(rating);

      Swal.fire('Success', 'Thank you for your rating!', 'success');
      this.closeRatingModal();
      this.loadRatings();
    } catch (error) {
      console.error('Error submitting rating:', error);
      Swal.fire('Error', 'Failed to submit rating', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Set star rating
   */
  setRating(stars: number): void {
    this.selectedRating.set(stars);
    this.ratingForm.get('rating')?.setValue(stars);
  }

  /**
   * Get filtered ratings
   */
  getFilteredRatings(): Rating[] {
    return this.activeTab() === 'received' ? this.receivedRatings() : this.givenRatings();
  }

  /**
   * Calculate average rating
   */
  calculateAverageRating(ratings: Rating[]): number {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    return sum / ratings.length;
  }

  /**
   * Get rating stats
   */
  getRatingStats(): { [key: number]: number } {
    const received = this.receivedRatings();
    const stats: { [key: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    received.forEach(r => {
      stats[r.rating]++;
    });

    return stats;
  }

  /**
   * Get star array for rating
   */
  getStars(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  /**
   * Check if star is filled
   */
  isStarFilled(star: number, rating: number): boolean {
    return star <= rating;
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
   * Get rating color
   */
  getRatingColor(rating: number): string {
    if (rating >= 4.5) return 'green';
    if (rating >= 3.5) return 'yellow';
    if (rating >= 2.5) return 'orange';
    return 'red';
  }
}
