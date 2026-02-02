import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Signin } from '../../../auth/components/signin/signin';
import { Signup } from '../../../auth/components/signup/signup';

@Component({
  selector: 'app-header',
  imports: [CommonModule, Signin, Signup],
  templateUrl: './header.html',
})
export class Header {
  mobileMenuOpen = signal(false);
  isScrolled = signal(false);
  showSigninModal = signal(false);
  showSignupModal = signal(false);

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => {
        this.isScrolled.set(window.scrollY > 50);
      });
    }
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.set(!this.mobileMenuOpen());
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }

  scrollToSection(sectionId: string) {
    this.closeMobileMenu();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  login() {
    this.closeMobileMenu();
    this.showSigninModal.set(true);
  }

  register() {
    this.closeMobileMenu();
    this.showSignupModal.set(true);
  }

  closeSignin() {
    this.showSigninModal.set(false);
  }

  closeSignup() {
    this.showSignupModal.set(false);
  }

  switchToSignup() {
    this.showSigninModal.set(false);
    this.showSignupModal.set(true);
  }

  switchToSignin() {
    this.showSignupModal.set(false);
    this.showSigninModal.set(true);
  }
}
