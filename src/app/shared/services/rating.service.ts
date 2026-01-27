/**
 * Rating Service
 * Handles user ratings and reviews
 */

import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, query, where } from '@angular/fire/firestore';
import { Rating, RatingCategory } from '../../models';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  private firestore = inject(Firestore);
  private userService = inject(UserService);
  
  /**
   * Create a rating/review
   */
  async createRating(rating: Rating): Promise<string> {
    try {
      const ratingsRef = collection(this.firestore, 'ratings');
      const docRef = await addDoc(ratingsRef, rating);
      
      // Update user's average rating
      await this.updateUserRating(rating.ratedUserId);
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating rating:', error);
      throw error;
    }
  }
  
  /**
   * Get ratings for a user
   */
  async getUserRatings(userId: string): Promise<Rating[]> {
    try {
      const ratingsRef = collection(this.firestore, 'ratings');
      const q = query(ratingsRef, where('ratedUserId', '==', userId));
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as Rating);
    } catch (error) {
      console.error('Error fetching user ratings:', error);
      throw error;
    }
  }
  
  /**
   * Get ratings given by a user
   */
  async getRatingsByUser(userId: string): Promise<Rating[]> {
    try {
      const ratingsRef = collection(this.firestore, 'ratings');
      const q = query(ratingsRef, where('ratedById', '==', userId));
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as Rating);
    } catch (error) {
      console.error('Error fetching ratings by user:', error);
      throw error;
    }
  }
  
  /**
   * Update user's average rating in user profile
   */
  private async updateUserRating(userId: string): Promise<void> {
    try {
      const ratings = await this.getUserRatings(userId);
      
      if (ratings.length === 0) {
        return;
      }
      
      const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
      
      await this.userService.updateUserStatistics(userId, {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: ratings.length,
        trustScore: Math.min(100, 50 + (averageRating * 10))
      });
    } catch (error) {
      console.error('Error updating user rating:', error);
      throw error;
    }
  }
  
  /**
   * Calculate average rating for display
   */
  calculateAverageRating(ratings: Rating[]): number {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / ratings.length) * 10) / 10;
  }
}
