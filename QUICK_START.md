# SkillSwap - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Prerequisites
- Node.js 18+ and npm 9+
- Angular CLI installed globally
- A Firebase project (already configured!)

### Step 1: Install Dependencies
```bash
cd /home/zakariya/SkillSwap
npm install
```

### Step 2: Start Development Server
```bash
npm start
```

The app will be available at `http://localhost:4200`

### Step 3: Create Your Account

1. Visit `http://localhost:4200/signup`
2. Enter your email, name, and password
3. You'll be redirected to the onboarding flow
4. Complete the 4-step onboarding:
   - Select session preferences (online/offline)
   - Add skills you can teach
   - Add skills you want to learn
   - Set location and bio

### Step 4: Find Matches

After onboarding, you'll be redirected to `/home/matches` where you can:
- Browse user profiles
- See skills they can teach vs. what they want to learn
- Send swap requests with messages

### Step 5: Explore Your Dashboard

Visit `/home/dashboard` to see:
- Your statistics (swaps, skills, ratings)
- Trust score
- Recent swap history
- Reviews from other users

---

## 📱 Key Features to Try

### 1. **Authentication**
- Sign up: `/signup`
- Sign in: `/signin`
- Auto-logout and session management

### 2. **Onboarding**
- 4-step wizard with progress tracking
- Add/remove skills dynamically
- Select location and preferences

### 3. **Skill Matching**
- Browse potential matches (card-based UI)
- See skill compatibility
- Send swap requests
- Skip to next match

### 4. **User Settings**
- Update profile information
- Change password (security tab)
- Manage privacy settings
- Configure notifications
- Delete account (danger zone)

### 5. **Dashboard**
- View your statistics
- Check trust score
- See swap history
- Read user reviews

---

## 🔐 Test Accounts

Since authentication is Firebase-based, you can create as many test accounts as you want:

**Example Test Account:**
- Email: `user1@example.com`
- Password: `password123`

**Create another to test matching:**
- Email: `user2@example.com`
- Password: `password123`

Then complete onboarding for both with different skills to see matches work!

---

## 📂 File Structure Overview

```
src/app/
├── models/                 # TypeScript interfaces
├── auth/                   # Sign in/up & guards
├── shared/services/        # Core business logic
└── features/
    ├── onboarding/        # Setup wizard
    └── user/pages/
        ├── matching/      # Tinder-style matching
        ├── dashboard/     # Stats & history
        └── settings/      # User preferences
```

---

## 🔧 Common Tasks

### Change Firebase Config
Edit `src/app/envirements/envirement.ts`

### Add New Route
Edit `src/app/app.routes.ts`

### Create New Service
```typescript
// src/app/shared/services/new-feature.service.ts
import { Injectable, inject } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class NewFeatureService {
  private firestore = inject(Firestore);
  // Add your methods here
}
```

### Add New Component
```bash
ng generate component features/user/pages/new-component
```

Or manually create:
```
src/app/features/user/pages/new-component/
├── new-component.component.ts
├── new-component.html
└── new-component.css
```

---

## 🎨 Tailwind Classes Used

Common classes throughout the app:
- `bg-gradient-to-br from-indigo-600 to-blue-600` - Gradient backgrounds
- `rounded-2xl` - Rounded corners
- `shadow-lg` - Card shadows
- `p-6` - Padding
- `text-indigo-600` - Primary color
- `hover:bg-indigo-700` - Hover effects
- `transition` - Smooth transitions

---

## 🐛 Debugging Tips

### Check Browser Console
Open DevTools (F12) and check the Console tab for any errors

### Firebase Connection
If you see auth errors:
1. Check `envirement.ts` has correct config
2. Verify Firestore Database is enabled
3. Check Firebase Console permissions

### Routes Not Loading
- Ensure component imports are correct
- Check lazy loading paths
- Verify route guards are not blocking

### Data Not Saving
- Check Firestore rules allow reads/writes
- Inspect Network tab in DevTools
- Check user is authenticated

---

## 📊 Database Structure

The app uses these main Firestore collections:

- **users/** - User profiles and data
- **swap_requests/** - Skill exchange requests
- **conversations/{id}/messages/** - Chat messages
- **sessions/** - Scheduled sessions
- **ratings/** - User reviews
- **notifications/** - User notifications

---

## ⚡ Performance Tips

1. **Clear Browser Cache** - If styles aren't loading
2. **Restart Dev Server** - If routes stop working
3. **Check Network Tab** - To see Firebase calls
4. **Use Chrome DevTools** - For debugging Firestore

---

## 🎓 Learning Resources

### Angular
- [Angular Documentation](https://angular.io/docs)
- [Angular Signals](https://angular.io/guide/signals)
- [Standalone Components](https://angular.io/guide/standalone-components)

### Firebase
- [Firebase Console](https://console.firebase.google.com)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)

### Tailwind CSS
- [Tailwind Docs](https://tailwindcss.com/docs)
- [Color Reference](https://tailwindcss.com/docs/customizing-colors)

---

## 📝 Development Checklist

When adding new features:
- [ ] Create TypeScript interface in models/
- [ ] Create service in shared/services/ if needed
- [ ] Add route in app.routes.ts
- [ ] Create component with standalone: true
- [ ] Use Tailwind for styling
- [ ] Add error handling
- [ ] Test with multiple users
- [ ] Check mobile responsiveness

---

## 🚀 Next Steps

1. **Try Creating Multiple Users** - Test the matching system
2. **Send Swap Requests** - Explore the messaging flow
3. **Check Your Dashboard** - See stats in real-time
4. **Explore Settings** - Change your preferences
5. **Read the Code** - Understand the architecture

---

## 💡 Pro Tips

- **Use Incognito Tabs** - To test with multiple users simultaneously
- **Check Firestore** - Firebase Console > Firestore > Collections to see real data
- **Browser Extensions** - Install JSON Formatter for easier debugging
- **Keyboard Shortcuts** - F12 for DevTools, Cmd+Shift+I on Mac

---

## 🆘 Need Help?

1. **Check IMPLEMENTATION_GUIDE.md** - For detailed architecture
2. **Check PROJECT_SUMMARY.md** - For complete feature list
3. **Read inline comments** - Code has helpful comments
4. **Use DevTools** - Browser tools are your best friend

---

## 📞 Common Questions

**Q: How do I reset my password?**
A: Use Firebase Console > Authentication > Reset Password

**Q: Where is my data stored?**
A: Firebase Firestore (https://console.firebase.google.com)

**Q: Can I add more skills?**
A: Yes! Go to /home/settings and edit your profile

**Q: How does matching work?**
A: App finds users with complementary skills (you teach what they want to learn, and vice versa)

**Q: Can I message other users?**
A: Chat functionality is being implemented (coming soon)

---

**Happy Coding! 🎉**

Version 1.0 | January 24, 2026
