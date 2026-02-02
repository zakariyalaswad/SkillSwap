import { Injectable, signal, ComponentRef, ApplicationRef, createComponent, EnvironmentInjector, inject } from '@angular/core';
import { ToastComponent } from '../components/toast/toast.component';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastComponentRef: ComponentRef<ToastComponent> | null = null;
  private appRef = inject(ApplicationRef);
  private injector = inject(EnvironmentInjector);

  private ensureToastComponent() {
    if (!this.toastComponentRef) {
      this.toastComponentRef = createComponent(ToastComponent, {
        environmentInjector: this.injector
      });

      this.appRef.attachView(this.toastComponentRef.hostView);
      const domElem = (this.toastComponentRef.hostView as any).rootNodes[0] as HTMLElement;
      document.body.appendChild(domElem);
    }
    return this.toastComponentRef.instance;
  }

  success(message: string, duration = 3000) {
    const toast = this.ensureToastComponent();
    toast.show(message, 'success', duration);
  }

  error(message: string, duration = 4000) {
    const toast = this.ensureToastComponent();
    toast.show(message, 'error', duration);
  }

  info(message: string, duration = 3000) {
    const toast = this.ensureToastComponent();
    toast.show(message, 'info', duration);
  }

  warning(message: string, duration = 3000) {
    const toast = this.ensureToastComponent();
    toast.show(message, 'warning', duration);
  }
}
