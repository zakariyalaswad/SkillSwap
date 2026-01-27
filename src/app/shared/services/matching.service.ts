/**
 * Matching Service
 * Implements the skill matching algorithm to find compatible users
 */

import { Injectable, inject } from '@angular/core';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';
import { User, Match, MatchStatus, Skill } from '../../models';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class MatchingService {
  private firestore = inject(Firestore);
  private userService = inject(UserService);
  
  /**
   * Find matches for a user based on skill compatibility
   * Match = User A teaches what User B wants AND User B teaches what User A wants
   */
  async findMatches(userId: string, excludeAlreadyMatched: boolean = true): Promise<User[]> {
    try {
      // Get current user
      const currentUser = await this.userService.getUserProfile(userId);
      if (!currentUser) {
        throw new Error('User not found');
      }
      
      // Get all other active users
      const allUsers = await this.userService.getAllActiveUsers();
      const otherUsers = allUsers.filter(
        u => u.id !== userId && u.isOnboardingComplete && !u.isBanned
      );
      
      // Find compatible matches
      const matches = otherUsers.filter(otherUser => {
        const currentTeaches = currentUser.skillsITeach.map(s => s.name.toLowerCase());
        const currentWants = currentUser.skillsIWantToLearn.map(s => s.name.toLowerCase());
        
        const otherTeaches = otherUser.skillsITeach.map(s => s.name.toLowerCase());
        const otherWants = otherUser.skillsIWantToLearn.map(s => s.name.toLowerCase());
        
        // Check if mutual match exists
        const currentHasWhatOtherWants = currentTeaches.some(skill => 
          otherWants.includes(skill)
        );
        
        const otherHasWhatCurrentWants = otherTeaches.some(skill =>
          currentWants.includes(skill)
        );
        
        // Check location preference
        const locationMatch = this.checkLocationPreference(currentUser, otherUser);
        
        return currentHasWhatOtherWants && otherHasWhatCurrentWants && locationMatch;
      });
      
      // Sort by match quality (more matching skills = better match)
      return matches.sort((a, b) => {
        const scoreA = this.calculateMatchScore(currentUser, a);
        const scoreB = this.calculateMatchScore(currentUser, b);
        return scoreB - scoreA;
      });
    } catch (error) {
      console.error('Error finding matches:', error);
      throw error;
    }
  }
  
  /**
   * Calculate match compatibility score
   */
  private calculateMatchScore(user1: User, user2: User): number {
    let score = 0;
    
    // Check multiple skill matches
    const user1Teaches = user1.skillsITeach.map(s => s.name.toLowerCase());
    const user1Wants = user1.skillsIWantToLearn.map(s => s.name.toLowerCase());
    
    const user2Teaches = user2.skillsITeach.map(s => s.name.toLowerCase());
    const user2Wants = user2.skillsIWantToLearn.map(s => s.name.toLowerCase());
    
    // Count matching skills
    const teachMatch = user1Teaches.filter(s => user2Wants.includes(s)).length;
    const learnMatch = user1Wants.filter(s => user2Teaches.includes(s)).length;
    
    score = teachMatch + learnMatch;
    
    // Boost score if both prefer online
    if (user1.preferOnline && user2.preferOnline) {
      score += 5;
    }
    
    // Boost score if both prefer offline
    if (user1.preferOffline && user2.preferOffline) {
      score += 3;
    }
    
    // Consider rating (higher rated users are more valuable matches)
    score += user2.averageRating;
    
    return score;
  }
  
  /**
   * Check if location preferences are compatible
   */
  private checkLocationPreference(user1: User, user2: User): boolean {
    // If both prefer online, they can connect
    if (user1.preferOnline && user2.preferOnline) {
      return true;
    }
    
    // If both prefer offline and have same location
    if (user1.preferOffline && user2.preferOffline) {
      return !!(user1.location && user2.location && user1.location.toLowerCase() === user2.location.toLowerCase());
    }
    
    // If one prefers online and other allows online
    if ((user1.preferOnline && user2.preferOnline) || (user1.preferOffline && user2.preferOffline)) {
      return true;
    }
    
    // If they have hybrid preferences
    return user1.preferOnline || user1.preferOffline;
  }
  
  /**
   * Get recommended users (better than random matching)
   */
  async getRecommendedUsers(userId: string, limit: number = 5): Promise<User[]> {
    try {
      const matches = await this.findMatches(userId);
      return matches.slice(0, limit);
    } catch (error) {
      console.error('Error getting recommended users:', error);
      throw error;
    }
  }
  
  /**
   * Get suggested users based on profile similarity (not strict mutual matches)
   */
  async getSuggestedUsers(userId: string, limit: number = 10): Promise<User[]> {
    try {
      const currentUser = await this.userService.getUserProfile(userId);
      if (!currentUser) {
        throw new Error('User not found');
      }
      
      const allUsers = await this.userService.getAllActiveUsers();
      const otherUsers = allUsers.filter(
        u => u.id !== userId && u.isOnboardingComplete && !u.isBanned
      );
      
      // Suggest users who either teach or want to learn similar skills
      const suggestions = otherUsers.filter(otherUser => {
        const currentWants = currentUser.skillsIWantToLearn.map(s => s.name.toLowerCase());
        const otherTeaches = otherUser.skillsITeach.map(s => s.name.toLowerCase());
        
        return otherTeaches.some(skill => currentWants.includes(skill));
      });
      
      // Sort by highest rated
      return suggestions
        .sort((a, b) => b.averageRating - a.averageRating)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting suggested users:', error);
      throw error;
    }
  }
}
