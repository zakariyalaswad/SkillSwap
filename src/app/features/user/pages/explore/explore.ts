/**
 * Explore Page Component
 * Discovery module for finding compatible skill exchange partners
 */

import { Component, OnInit, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../../shared/services/user.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { User, Skill, SkillLevel, SkillCategory } from '../../../../models';
import { LucideAngularModule, Search, Filter, X, Star, MapPin, Wifi, Users, Heart, MessageCircle } from 'lucide-angular';
import Swal from 'sweetalert2';

// Compatibility levels
export enum CompatibilityLevel {
  FULL = 'full',      // Both users teach what the other wants
  PARTIAL = 'partial', // Some overlap
  NONE = 'none'       // No match
}

export interface ExploreUserCard {
  user: User;
  compatibilityLevel: CompatibilityLevel;
  matchedSkills: string[];
}

export interface ExploreFilters {
  skillTaught?: string;
  skillWanted?: string;
  skillLevel?: SkillLevel | '';
  availability?: 'online' | 'offline' | '';
  location?: string;
  minRating: number;
}

@Component({
  selector: 'app-explore',
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './explore.html',
  standalone: true
})
export class Explore implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Lucide icons
  protected readonly Search = Search;
  protected readonly Filter = Filter;
  protected readonly X = X;
  protected readonly Star = Star;
  protected readonly MapPin = MapPin;
  protected readonly Wifi = Wifi;
  protected readonly Users = Users;
  protected readonly Heart = Heart;
  protected readonly MessageCircle = MessageCircle;

  // Enums for template
  protected readonly CompatibilityLevel = CompatibilityLevel;
  protected readonly SkillLevel = SkillLevel;
  protected readonly SkillCategories = Object.values(SkillCategory);

  // State
  protected currentUser = signal<User | null>(null);
  protected allUsers = signal<User[]>([]);
  protected isLoading = signal(true);
  protected showFilters = signal(false);
  protected searchQuery = signal('');
  protected filters = signal<ExploreFilters>({
    skillTaught: '',
    skillWanted: '',
    skillLevel: '',
    availability: '',
    location: '',
    minRating: 0
  });

  // Swipe card state
  protected currentCardIndex = signal(0);
  protected swipeDirection = signal<'left' | 'right' | null>(null);
  protected isAnimating = signal(false);

  // Debounce timer
  private searchDebounceTimer?: NodeJS.Timeout;

  // Computed: Filter and sort users
  protected displayedUsers = computed(() => {
    const users = this.allUsers();
    const current = this.currentUser();
    const query = this.searchQuery().toLowerCase().trim();
    const filterValues = this.filters();

    if (!current) return [];

    // Exclude current user
    let filtered = users.filter(u => u.id !== current.id);

    // Search filter
    if (query) {
      filtered = filtered.filter(u => {
        const nameMatch = u.name.toLowerCase().includes(query);
        const skillTeachMatch = u.skillsITeach.some(s => s.name.toLowerCase().includes(query));
        const skillLearnMatch = u.skillsIWantToLearn.some(s => s.name.toLowerCase().includes(query));
        return nameMatch || skillTeachMatch || skillLearnMatch;
      });
    }

    // Skill taught filter
    if (filterValues.skillTaught) {
      filtered = filtered.filter(u =>
        u.skillsITeach.some(s => s.name.toLowerCase().includes(filterValues.skillTaught!.toLowerCase()))
      );
    }

    // Skill wanted filter
    if (filterValues.skillWanted) {
      filtered = filtered.filter(u =>
        u.skillsIWantToLearn.some(s => s.name.toLowerCase().includes(filterValues.skillWanted!.toLowerCase()))
      );
    }

    // Skill level filter
    if (filterValues.skillLevel) {
      filtered = filtered.filter(u =>
        u.skillsITeach.some(s => s.level === filterValues.skillLevel)
      );
    }

    // Availability filter
    if (filterValues.availability === 'online') {
      filtered = filtered.filter(u => u.preferOnline);
    } else if (filterValues.availability === 'offline') {
      filtered = filtered.filter(u => u.preferOffline);
    }

    // Location filter
    if (filterValues.location) {
      filtered = filtered.filter(u =>
        u.location?.toLowerCase().includes(filterValues.location!.toLowerCase())
      );
    }

    // Minimum rating filter
    if (filterValues.minRating > 0) {
      filtered = filtered.filter(u => u.averageRating >= filterValues.minRating);
    }

    // Calculate compatibility and create cards
    const cards: ExploreUserCard[] = filtered.map(user => {
      const { level, matchedSkills } = this.calculateCompatibility(current, user);
      return {
        user,
        compatibilityLevel: level,
        matchedSkills
      };
    });

    // Sort by compatibility (full > partial > none) and then by rating
    return cards.sort((a, b) => {
      const compatibilityOrder = { full: 0, partial: 1, none: 2 };
      const compatDiff = compatibilityOrder[a.compatibilityLevel] - compatibilityOrder[b.compatibilityLevel];
      if (compatDiff !== 0) return compatDiff;
      return b.user.averageRating - a.user.averageRating;
    });
  });

  // Computed: Active filters count
  protected activeFiltersCount = computed(() => {
    const f = this.filters();
    let count = 0;
    if (f.skillTaught) count++;
    if (f.skillWanted) count++;
    if (f.skillLevel) count++;
    if (f.availability) count++;
    if (f.location) count++;
    if (f.minRating > 0) count++;
    return count;
  });

  ngOnInit(): void {
    this.loadData();
  }

  /**
   * Load initial data
   */
  async loadData(): Promise<void> {
    this.isLoading.set(true);
    try {
      const current = this.authService.getCurrentUser();
      if (!current) {
        this.router.navigate(['/signin']);
        return;
      }

      // Refresh current user data
      const updatedUser = await this.userService.getUserProfile(current.id);
      if (updatedUser) {
        this.currentUser.set(updatedUser);
      } else {
        this.currentUser.set(current);
      }

      // Load all active users (excluding banned)
      const users = await this.userService.getAllActiveUsers();
      this.allUsers.set(users);
    } catch (error) {
      console.error('Error loading explore data:', error);
      Swal.fire('Error', 'Failed to load users', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Handle search with debounce
   */
  onSearchChange(value: string): void {
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }

    this.searchDebounceTimer = setTimeout(() => {
      this.searchQuery.set(value);
    }, 300);
  }

  /**
   * Toggle filters panel
   */
  toggleFilters(): void {
    this.showFilters.set(!this.showFilters());
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.filters.set({
      skillTaught: '',
      skillWanted: '',
      skillLevel: '',
      availability: '',
      location: '',
      minRating: 0
    });
  }

  /**
   * Update specific filter
   */
  updateFilter(key: keyof ExploreFilters, value: any): void {
    this.filters.update(f => ({ ...f, [key]: value }));
  }

  /**
   * Calculate compatibility between current user and target user
   */
  private calculateCompatibility(currentUser: User, targetUser: User): {
    level: CompatibilityLevel;
    matchedSkills: string[];
  } {
    const matchedSkills: string[] = [];

    // Check if current user teaches what target wants
    const currentTeachesTargetWants = targetUser.skillsIWantToLearn.filter(targetWant =>
      currentUser.skillsITeach.some(currentTeach =>
        currentTeach.name.toLowerCase() === targetWant.name.toLowerCase()
      )
    );

    // Check if target teaches what current wants
    const targetTeachesCurrentWants = currentUser.skillsIWantToLearn.filter(currentWant =>
      targetUser.skillsITeach.some(targetTeach =>
        targetTeach.name.toLowerCase() === currentWant.name.toLowerCase()
      )
    );

    // Add to matched skills
    currentTeachesTargetWants.forEach(s => matchedSkills.push(s.name));
    targetTeachesCurrentWants.forEach(s => {
      if (!matchedSkills.includes(s.name)) {
        matchedSkills.push(s.name);
      }
    });

    // Determine compatibility level
    if (currentTeachesTargetWants.length > 0 && targetTeachesCurrentWants.length > 0) {
      return { level: CompatibilityLevel.FULL, matchedSkills };
    } else if (currentTeachesTargetWants.length > 0 || targetTeachesCurrentWants.length > 0) {
      return { level: CompatibilityLevel.PARTIAL, matchedSkills };
    } else {
      return { level: CompatibilityLevel.NONE, matchedSkills: [] };
    }
  }

  /**
   * View user profile
   */
  viewProfile(userId: string): void {
    this.router.navigate(['/profile', userId]);
  }

  /**
   * Request swap (only if compatible)
   */
  requestSwap(card: ExploreUserCard): void {
    if (card.compatibilityLevel === CompatibilityLevel.NONE) {
      Swal.fire({
        title: 'No Match',
        text: 'You need matching skills to request a swap. Consider adding skills to your learning list!',
        icon: 'info',
        confirmButtonText: 'Go to Settings'
      }).then(result => {
        if (result.isConfirmed) {
          this.router.navigate(['/settings']);
        }
      });
      return;
    }

    this.router.navigate(['/matching'], {
      queryParams: { userId: card.user.id }
    });
  }

  /**
   * Get compatibility badge config
   */
  getCompatibilityBadge(level: CompatibilityLevel): { text: string; class: string; icon: string } {
    switch (level) {
      case CompatibilityLevel.FULL:
        return {
          text: 'Perfect Match',
          class: 'bg-green-100 text-green-800 border-green-200',
          icon: '✨'
        };
      case CompatibilityLevel.PARTIAL:
        return {
          text: 'Partial Match',
          class: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: '🟡'
        };
      case CompatibilityLevel.NONE:
        return {
          text: 'No Match',
          class: 'bg-gray-100 text-gray-600 border-gray-200',
          icon: '⚪'
        };
    }
  }

  /**
   * Get array for star rating display
   */
  getStars(rating: number): boolean[] {
    return Array(5).fill(false).map((_, i) => i < Math.round(rating));
  }

  /**
   * Handle card swipe left (pass)
   */
  swipeLeft(): void {
    if (this.isAnimating()) return;
    const users = this.displayedUsers();
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
    const users = this.displayedUsers();
    const index = this.currentCardIndex();
    if (index >= users.length) return;

    const card = users[index];
    this.isAnimating.set(true);
    this.swipeDirection.set('right');

    setTimeout(() => {
      this.requestSwap(card);
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
  getCurrentCard(): ExploreUserCard | null {
    const users = this.displayedUsers();
    const index = this.currentCardIndex();
    return index < users.length ? users[index] : null;
  }

  /**
   * Get next cards for preview (up to 2)
   */
  getNextCards(): ExploreUserCard[] {
    const users = this.displayedUsers();
    const index = this.currentCardIndex();
    return users.slice(index + 1, index + 3);
  }
}
