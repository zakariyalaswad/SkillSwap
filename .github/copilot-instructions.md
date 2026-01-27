# Copilot Instructions for SkillSwap

## Project Overview
SkillSwap is a modern Angular-based skill exchange platform (Angular 20+, standalone components) with Firebase backend (Auth + Firestore), Tailwind CSS, and a service-oriented architecture. The MVP is 85% complete, focusing on authentication, onboarding, skill matching, and user management.

## Architecture & Key Patterns
- **Standalone Angular Components:** No NgModules; use signals for state management.
- **Service Layer:** All business logic is centralized in services under `src/app/shared/services/` and feature-specific service folders.
- **Data Models:** TypeScript interfaces in `src/app/models/` for users, swaps, chats, ratings, notifications, and admin.
- **Routing & Guards:** Route protection via guards (`auth.guard.ts`, onboarding, guest) in `src/app/auth/guards/`. See `app.routes.ts` for navigation structure.
- **UI/UX:** Card-based matching, onboarding wizard, dashboard, and settings. Tailwind CSS for styling.
- **Firebase Integration:** All data and auth handled via Firestore and Firebase Auth. Config in `src/app/envirements/envirement.ts`.

## Developer Workflows
- **Start Dev Server:** `npm start` (or `ng serve`)
- **Build:** `ng build`
- **Unit Tests:** `ng test` (Karma)
- **Format Code:** `npm run format`
- **Install Dependencies:** `npm install`

## Conventions & Patterns
- **Async Service Methods:** All service calls are async and return Promises. Use try/catch for error handling.
- **Component Structure:** Features are organized by domain (auth, onboarding, user, admin, visiteur). Pages and components are nested by function.
- **State Management:** Use Angular signals for reactive UI updates.
- **Styling:** Use Tailwind CSS classes in templates and `styles.css`.
- **Error Handling:** User-facing error messages and loading states are required for all forms and async actions.
- **Route Guards:** Always check onboarding completion and authentication before allowing access to protected routes.

## Integration Points
- **Firebase:** All CRUD operations and authentication use Firebase SDK via AngularFire. Collections: `users`, `swap_requests`, `conversations/{id}/messages`, `ratings`, `sessions`.
- **Notifications:** Use SweetAlert2 for alerts and notifications.
- **Icons:** Lucide Icons for UI elements.

## Key Files & Directories
- `src/app/models/` — Data models/interfaces
- `src/app/shared/services/` — Core business logic
- `src/app/auth/guards/` — Route protection
- `src/app/app.routes.ts` — Route definitions
- `src/app/envirements/envirement.ts` — Firebase config
- `src/styles.css` — Tailwind CSS imports
- `features/` — Main user/admin/public features

## Examples
- **Service Method:**
  ```typescript
  async getUserProfile(userId): Promise<User> {
    try {
      return await firestore.getUser(userId);
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
  ```
- **Route Guard Usage:**
  ```typescript
  canActivate(route, state) {
    return authService.isAuthenticated() && user.isOnboardingComplete;
  }
  ```

## Troubleshooting
- **Firebase errors:** Check `envirement.ts` config and Firestore setup.
- **Auth issues:** Ensure onboarding is complete and localStorage is valid.
- **Matching issues:** Both users must have completed onboarding and have matching skills.

## Last Updated
January 26, 2026

---

**Feedback:** If any section is unclear or missing, please specify which workflows, conventions, or architectural details need further documentation.
