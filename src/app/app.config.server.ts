import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { provideZonelessChangeDetection, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';

// Mock Firebase services for SSR (actual services will be used in browser)
class MockAuth {}
class MockFirestore {}

// Server-only config without real Firebase (Firebase client SDK doesn't work in SSR)
const serverConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideServerRendering(withRoutes(serverRoutes)),
    { provide: Auth, useClass: MockAuth },
    { provide: Firestore, useClass: MockFirestore }
  ]
};

export const config = serverConfig;
