import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, FormsModule],
  templateUrl: './footer.html',
})
export class Footer {
  email = signal('');
  isSubscribing = signal(false);
  subscribed = signal(false);
  currentYear = new Date().getFullYear();

  socialLinks = [
    { name: 'Twitter', icon: 'twitter', url: '#', color: 'hover:text-blue-400' },
    { name: 'Facebook', icon: 'facebook', url: '#', color: 'hover:text-blue-500' },
    { name: 'LinkedIn', icon: 'linkedin', url: '#', color: 'hover:text-blue-600' },
    { name: 'Instagram', icon: 'instagram', url: '#', color: 'hover:text-pink-500' },
  ];

  async subscribeNewsletter() {
    if (!this.email() || this.isSubscribing()) return;
    
    this.isSubscribing.set(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    this.subscribed.set(true);
    this.isSubscribing.set(false);
    
    // Reset after 3 seconds
    setTimeout(() => {
      this.subscribed.set(false);
      this.email.set('');
    }, 3000);
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
