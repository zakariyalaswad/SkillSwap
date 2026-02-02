import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      @for (toast of toasts(); track toast.id) {
        <div 
          class="pointer-events-auto animate-slide-in-right bg-white rounded-xl shadow-2xl border overflow-hidden min-w-[320px] max-w-[400px]"
          [class]="getToastClasses(toast.type)">
          <div class="flex items-start gap-3 p-4">
            <div class="flex-shrink-0 mt-0.5">
              @if (toast.type === 'success') {
                <svg class="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
              } @else if (toast.type === 'error') {
                <svg class="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                </svg>
              } @else if (toast.type === 'warning') {
                <svg class="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                </svg>
              } @else {
                <svg class="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                </svg>
              }
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900">{{ toast.message }}</p>
            </div>
            <button 
              (click)="removeToast(toast.id)"
              class="flex-shrink-0 text-gray-400 hover:text-gray-600 transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div class="h-1 bg-gray-100">
            <div 
              class="h-full animate-progress"
              [class]="getProgressClasses(toast.type)"
              [style.animation-duration.ms]="toast.duration || 3000">
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slide-in-right {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes progress {
      from {
        width: 100%;
      }
      to {
        width: 0%;
      }
    }

    .animate-slide-in-right {
      animation: slide-in-right 0.3s ease-out;
    }

    .animate-progress {
      animation: progress linear forwards;
    }
  `]
})
export class ToastComponent {
  toasts = signal<Toast[]>([]);
  private toastIdCounter = 0;

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration = 3000) {
    const toast: Toast = {
      id: this.toastIdCounter++,
      message,
      type,
      duration
    };

    this.toasts.update(toasts => [...toasts, toast]);

    if (duration > 0) {
      setTimeout(() => {
        this.removeToast(toast.id);
      }, duration);
    }
  }

  removeToast(id: number) {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  getToastClasses(type: string): string {
    const baseClasses = 'border-l-4 ';
    switch (type) {
      case 'success':
        return baseClasses + 'border-green-500';
      case 'error':
        return baseClasses + 'border-red-500';
      case 'warning':
        return baseClasses + 'border-orange-500';
      case 'info':
        return baseClasses + 'border-blue-500';
      default:
        return baseClasses + 'border-gray-500';
    }
  }

  getProgressClasses(type: string): string {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-orange-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  }
}
