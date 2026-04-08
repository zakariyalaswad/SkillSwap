/**
 * Skill Manager Component
 * Manage user's teaching and learning skills
 */

import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../../shared/services/user.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { Skill, SkillCategory, SkillLevel } from '../../../../models';
import Swal from 'sweetalert2';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-skill-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './skill-manager.html',
  styleUrl: './skill-manager.css'
})
export class SkillManagerComponent implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);

  protected currentUser = this.authService.getCurrentUser();
  protected teachingSkills = signal<Skill[]>([]);
  protected learningSkills = signal<Skill[]>([]);
  protected isLoading = signal(false);
  
  protected activeView = signal<'view' | 'addTeach' | 'addLearn'>('view');
  protected editingSkillId = signal<string | null>(null);
  protected editingSkillType = signal<'teach' | 'learn' | null>(null);
  
  // Available options
  protected skillCategories = Object.values(SkillCategory);
  protected skillLevels = Object.values(SkillLevel);
  
  // Add Teaching Skill Form
  protected addTeachingForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    category: new FormControl('', [Validators.required]),
    level: new FormControl('', [Validators.required]),
    description: new FormControl('')
  });

  // Add Learning Skill Form
  protected addLearningForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    category: new FormControl('', [Validators.required]),
    level: new FormControl('', [Validators.required]),
    description: new FormControl('')
  });

  async ngOnInit() {
    await this.loadUserSkills();
  }

  private normalizeDate(value: unknown): Date {
    if (value instanceof Date) {
      return value;
    }

    if (value && typeof value === 'object' && 'toDate' in value && typeof (value as { toDate: () => Date }).toDate === 'function') {
      return (value as { toDate: () => Date }).toDate();
    }

    const parsed = new Date(value as string | number | Date);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }

  private normalizeSkill(raw: Partial<Skill>): Skill {
    return {
      id: raw.id || uuidv4(),
      name: raw.name || '',
      category: (raw.category as SkillCategory) || SkillCategory.OTHER,
      level: (raw.level as SkillLevel) || SkillLevel.BEGINNER,
      description: raw.description || '',
      addedAt: this.normalizeDate(raw.addedAt)
    };
  }

  private normalizeSkills(skills: Partial<Skill>[] | undefined): Skill[] {
    return (skills || []).map(skill => this.normalizeSkill(skill));
  }

  /**
   * Load user's skills from the current user
   */
  protected async loadUserSkills() {
    if (!this.currentUser) return;
    
    try {
      const user = await this.userService.getUserProfile(this.currentUser.id);
      if (user) {
        const teaching = this.normalizeSkills((user.skillsITeach || []) as Partial<Skill>[]);
        const learning = this.normalizeSkills(
          ((user.skillsIWantToLearn || (user as any).skillsToLearn || (user as any).learningSkills || []) as Partial<Skill>[])
        );

        this.teachingSkills.set(teaching);
        this.learningSkills.set(learning);
      }
    } catch (error) {
      console.error('Error loading skills:', error);
      Swal.fire('Error', 'Failed to load skills', 'error');
    }
  }

  /**
   * Show add teaching skill form
   */
  protected showAddTeachingForm() {
    this.activeView.set('addTeach');
    this.editingSkillId.set(null);
    this.addTeachingForm.reset();
  }

  /**
   * Show add learning skill form
   */
  protected showAddLearningForm() {
    this.activeView.set('addLearn');
    this.editingSkillId.set(null);
    this.addLearningForm.reset();
  }

  /**
   * Cancel adding/editing
   */
  protected cancelAdd() {
    this.activeView.set('view');
    this.editingSkillId.set(null);
    this.editingSkillType.set(null);
    this.addTeachingForm.reset();
    this.addLearningForm.reset();
  }

  /**
   * Add new teaching skill
   */
  protected async addTeachingSkill() {
    if (!this.addTeachingForm.valid || !this.currentUser) {
      Swal.fire('Validation Error', 'Please fill in all required fields', 'warning');
      return;
    }

    this.isLoading.set(true);
    try {
      const formValue = this.addTeachingForm.value;
      const newSkill: Skill = {
        id: uuidv4(),
        name: formValue.name || '',
        category: formValue.category as SkillCategory,
        level: formValue.level as SkillLevel,
        description: formValue.description || '',
        addedAt: new Date()
      };

      await this.userService.addTeachingSkill(this.currentUser.id, newSkill);
      
      // Update local state
      this.teachingSkills.set([...this.teachingSkills(), newSkill]);
      this.addTeachingForm.reset();
      this.activeView.set('view');
      
      Swal.fire('Success', 'Teaching skill added successfully', 'success');
    } catch (error) {
      console.error('Error adding teaching skill:', error);
      Swal.fire('Error', 'Failed to add teaching skill', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Add new learning skill
   */
  protected async addLearningSkill() {
    if (!this.addLearningForm.valid || !this.currentUser) {
      Swal.fire('Validation Error', 'Please fill in all required fields', 'warning');
      return;
    }

    this.isLoading.set(true);
    try {
      const formValue = this.addLearningForm.value;
      const newSkill: Skill = {
        id: uuidv4(),
        name: formValue.name || '',
        category: formValue.category as SkillCategory,
        level: formValue.level as SkillLevel,
        description: formValue.description || '',
        addedAt: new Date()
      };

      await this.userService.addLearningSkill(this.currentUser.id, newSkill);
      
      // Update local state
      this.learningSkills.set([...this.learningSkills(), newSkill]);
      this.addLearningForm.reset();
      this.activeView.set('view');
      
      Swal.fire('Success', 'Learning skill added successfully', 'success');
    } catch (error) {
      console.error('Error adding learning skill:', error);
      Swal.fire('Error', 'Failed to add learning skill', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Edit teaching skill
   */
  protected editTeachingSkill(skill: Skill) {
    this.editingSkillId.set(skill.id);
    this.editingSkillType.set('teach');
    this.addTeachingForm.patchValue({
      name: skill.name,
      category: skill.category,
      level: skill.level,
      description: skill.description
    });
    this.activeView.set('addTeach');
  }

  /**
   * Edit learning skill
   */
  protected editLearningSkill(skill: Skill) {
    this.editingSkillId.set(skill.id);
    this.editingSkillType.set('learn');
    this.addLearningForm.patchValue({
      name: skill.name,
      category: skill.category,
      level: skill.level,
      description: skill.description
    });
    this.activeView.set('addLearn');
  }

  /**
   * Save edited teaching skill
   */
  protected async saveEditTeachingSkill() {
    if (!this.addTeachingForm.valid || !this.currentUser || !this.editingSkillId()) {
      Swal.fire('Validation Error', 'Please fill in all required fields', 'warning');
      return;
    }

    this.isLoading.set(true);
    try {
      const formValue = this.addTeachingForm.value;
      const updates: Partial<Skill> = {
        name: formValue.name || '',
        category: formValue.category as SkillCategory,
        level: formValue.level as SkillLevel,
        description: formValue.description || ''
      };

      await this.userService.updateTeachingSkill(this.currentUser.id, this.editingSkillId()!, updates);
      
      // Update local state
      const skillIndex = this.teachingSkills().findIndex(s => s.id === this.editingSkillId());
      if (skillIndex !== -1) {
        const updatedSkill = { ...this.teachingSkills()[skillIndex], ...updates };
        const updated = [...this.teachingSkills()];
        updated[skillIndex] = updatedSkill;
        this.teachingSkills.set(updated);
      }
      
      this.cancelAdd();
      Swal.fire('Success', 'Teaching skill updated successfully', 'success');
    } catch (error) {
      console.error('Error updating teaching skill:', error);
      Swal.fire('Error', 'Failed to update teaching skill', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Save edited learning skill
   */
  protected async saveEditLearningSkill() {
    if (!this.addLearningForm.valid || !this.currentUser || !this.editingSkillId()) {
      Swal.fire('Validation Error', 'Please fill in all required fields', 'warning');
      return;
    }

    this.isLoading.set(true);
    try {
      const formValue = this.addLearningForm.value;
      const updates: Partial<Skill> = {
        name: formValue.name || '',
        category: formValue.category as SkillCategory,
        level: formValue.level as SkillLevel,
        description: formValue.description || ''
      };

      await this.userService.updateLearningSkill(this.currentUser.id, this.editingSkillId()!, updates);
      
      // Update local state
      const skillIndex = this.learningSkills().findIndex(s => s.id === this.editingSkillId());
      if (skillIndex !== -1) {
        const updatedSkill = { ...this.learningSkills()[skillIndex], ...updates };
        const updated = [...this.learningSkills()];
        updated[skillIndex] = updatedSkill;
        this.learningSkills.set(updated);
      }
      
      this.cancelAdd();
      Swal.fire('Success', 'Learning skill updated successfully', 'success');
    } catch (error) {
      console.error('Error updating learning skill:', error);
      Swal.fire('Error', 'Failed to update learning skill', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Delete teaching skill
   */
  protected async deleteTeachingSkill(skillId: string) {
    const result = await Swal.fire({
      title: 'Delete Skill',
      text: 'Are you sure you want to remove this teaching skill?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it'
    });

    if (!result.isConfirmed || !this.currentUser) return;

    this.isLoading.set(true);
    try {
      await this.userService.removeTeachingSkill(this.currentUser.id, skillId);
      
      // Update local state
      this.teachingSkills.set(this.teachingSkills().filter(s => s.id !== skillId));
      Swal.fire('Success', 'Teaching skill removed', 'success');
    } catch (error) {
      console.error('Error deleting teaching skill:', error);
      Swal.fire('Error', 'Failed to delete teaching skill', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Delete learning skill
   */
  protected async deleteLearningSkill(skillId: string) {
    const result = await Swal.fire({
      title: 'Delete Skill',
      text: 'Are you sure you want to remove this learning skill?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it'
    });

    if (!result.isConfirmed || !this.currentUser) return;

    this.isLoading.set(true);
    try {
      await this.userService.removeLearningSkill(this.currentUser.id, skillId);
      
      // Update local state
      this.learningSkills.set(this.learningSkills().filter(s => s.id !== skillId));
      Swal.fire('Success', 'Learning skill removed', 'success');
    } catch (error) {
      console.error('Error deleting learning skill:', error);
      Swal.fire('Error', 'Failed to delete learning skill', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Check if currently editing a skill
   */
  protected isEditing(): boolean {
    return this.editingSkillId() !== null;
  }
}
