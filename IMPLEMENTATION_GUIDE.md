## SkillSwap - Complete Setup Guide

SkillSwap is a modern skill exchange platform where users can teach and learn skills without involving money. This is a comprehensive implementation guide for the MVP.

### 🚀 Quick Start

#### Prerequisites
- Node.js 18+ and npm 9+
- Angular CLI 20+
- Firebase account

#### Installation

1. **Clone and install dependencies:**
```bash
cd /home/zakariya/SkillSwap
npm install
```

2. **Firebase Configuration:**
Firebase is already configured in `src/app/envirements/envirement.ts`. Ensure your Firebase project is set up with:
- Firestore Database
- Authentication (Email/Password)
- Cloud Storage (for images)

3. **Start Development Server:**
```bash
npm start
```
The application will be available at `http://localhost:4200`

### 📁 Project Structure

```
src/app/
├── models/                 # Data interfaces and types
│   ├── user.model.ts      # User, Skill definitions
│   ├── swap.model.ts      # Swap, Session, Match definitions
│   ├── chat.model.ts      # Chat, Message, Notification definitions
│   ├── admin.model.ts     # Admin-related definitions
│   └── index.ts           # Central exports
│
├── auth/                   # Authentication module
│   ├── services/
│   │   └── auth.service.ts     # Firebase auth integration
│   ├── guards/
│   │   └── auth.guard.ts       # Route protection
│   └── components/
│       ├── signin/
│       └── signup/
│
├── shared/                 # Shared services
│   └── services/
│       ├── user.service.ts          # User profile management
│       ├── swap.service.ts          # Swap request handling
│       ├── matching.service.ts      # Matching algorithm
│       ├── chat.service.ts          # Real-time messaging
│       ├── rating.service.ts        # Rating & reviews
│       ├── notification.service.ts  # Notifications
│       └── index.ts                 # Central exports
│
└── features/              # Feature modules
    ├── onboarding/        # First-time setup
    ├── user/
    │   └── pages/
    │       ├── home/      # User dashboard
    │       ├── matching/  # Skill matching UI
    │       ├── chat/      # Messaging
    │       ├── dashboard/ # Statistics & history
    │       ├── profil/    # User profile
    │       ├── settings/  # User settings
    │       ├── requests/  # Swap requests
    │       ├── suggestions/
    │       └── bestmatches/
    │
    ├── admin/             # Admin panel
    └── visiteur/          # Public pages
```

### 🔑 Core Features Implemented

#### 1. **Authentication & Users** ✅
- Email/password signup and signin
- JWT-based session management
- Auth guards for route protection
- User roles (user, admin)

#### 2. **Onboarding Flow** ✅
- 4-step wizard
- Skill management (teaching & learning)
- Session preferences (online/offline)
- Location and bio setup

#### 3. **Skill Matching** ✅
- Advanced matching algorithm
- Finds users with complementary skills
- Card-based UI (Tinder-style)
- One-click swap requests

#### 4. **Data Models** ✅
- Comprehensive TypeScript interfaces
- User profiles with stats
- Skills with categories and levels
- Swap requests and sessions
- Chat conversations and messages
- Ratings and reviews
- Admin tools and reports

#### 5. **Services** ✅
- **AuthService**: Registration, login, session management
- **UserService**: Profile management, skill handling
- **MatchingService**: Smart matching algorithm
- **SwapService**: Request and session management
- **ChatService**: Real-time messaging
- **RatingService**: Reviews and trust scoring
- **NotificationService**: In-app notifications

### 🔧 Firebase Collections Schema

```javascript
// users/
{
  id: string
  email: string
  name: string
  photoUrl: string (optional)
  bio: string (optional)
  role: 'user' | 'admin'
  preferOnline: boolean
  preferOffline: boolean
  location: string (optional)
  skillsITeach: Skill[]
  skillsIWantToLearn: Skill[]
  isOnboardingComplete: boolean
  averageRating: number
  totalReviews: number
  trustScore: number
  totalSwapsCompleted: number
  createdAt: date
  updatedAt: date
  isBanned: boolean
}

// swap_requests/
{
  senderId: string
  senderName: string
  recipientId: string
  recipientName: string
  skillOffered: Skill
  skillRequested: Skill
  message: string
  sessionType: 'Online' | 'Offline' | 'Hybrid'
  status: 'Pending' | 'Accepted' | 'Rejected'
  createdAt: date
}

// conversations/{conversationId}/messages/
{
  senderId: string
  senderName: string
  content: string
  isRead: boolean
  createdAt: date
}

// ratings/
{
  ratedById: string
  ratedUserId: string
  rating: number (1-5)
  review: string
  createdAt: date
}

// sessions/
{
  participantIds: string[]
  skillTopic: string
  sessionType: 'Online' | 'Offline' | 'Hybrid'
  scheduledAt: date
  duration: number
  meetingLink: string (optional)
  status: 'Scheduled' | 'Completed'
}
```

### 🎨 UI/UX Components Created

1. **Authentication Pages**
   - Modern signin/signup with validation
   - Password visibility toggle
   - Form error messages
   - Loading states

2. **Onboarding Wizard**
   - 4-step progressive form
   - Progress indicator
   - Skill management with add/remove
   - Session preference selection
   - Location and bio collection

3. **Matching Interface**
   - Card-based layout (Tinder-style)
   - User profile preview
   - Rating display
   - Skill compatibility badges
   - Quick swap request modal
   - Skip/Like actions

4. **Tailwind CSS Styling**
   - Responsive grid system
   - Modern color gradients
   - Smooth transitions
   - Mobile-first design
   - Accessible form components

### 📝 Available Routes

```
/                    # Public home page
/signin              # Sign in page
/signup              # Sign up page
/onboarding          # Onboarding wizard (protected)
/home                # User dashboard (protected)
  /home/matches      # Skill matching (protected)
  /home/chat         # Messaging (protected)
  /home/profil       # User profile (protected)
  /home/dashboard    # Statistics (protected)
  /home/settings     # User settings (protected)
  /home/requests     # Swap requests (protected)
/admin               # Admin dashboard (protected, admin only)
```

### 🔐 Security Features

- Route guards prevent unauthorized access
- Onboarding guard ensures profile completion
- Guest guards prevent authenticated users from revisiting auth pages
- Firebase security rules (to be configured in Firestore)
- Input validation on all forms
- Secure password handling

### 📦 Dependencies

Key packages used:
- `@angular/*` - Core Angular framework
- `@angular/fire` - Firebase integration
- `firebase` - Firebase SDK
- `tailwindcss` - Utility-first CSS
- `sweetalert2` - Beautiful alerts
- `rxjs` - Reactive programming
- `uuid` - Unique ID generation

### 🚦 Next Steps to Complete MVP

1. **Implement remaining user pages:**
   - Dashboard component
   - Settings component
   - Profile view/edit
   - Chat interface
   - Request management

2. **Admin Panel:**
   - User management
   - Report handling
   - Statistics dashboard
   - Ban/warning system

3. **Notifications:**
   - Real-time notifications
   - Notification bell UI
   - Notification center

4. **Session Management:**
   - Session scheduling
   - Meeting link integration
   - Session completion & rating

5. **Enhancements:**
   - Image upload for profiles
   - Search and filtering
   - User discovery improvements
   - Email notifications

### 📞 Support & Debugging

**Common Issues:**

1. **Firebase Connection Error:**
   - Check Firebase config in `envirement.ts`
   - Ensure Firestore Database is enabled
   - Check CORS settings in Firebase console

2. **Auth Guard Redirects:**
   - Ensure user completes onboarding
   - Check browser localStorage for auth token

3. **Matching Not Working:**
   - Verify both users have completed onboarding
   - Ensure skills match between users
   - Check Firestore has user data

### 📊 Development Commands

```bash
# Start development server
npm start

# Build for production
npm build

# Run tests
npm test

# Format code
npm run format
```

### 🎯 Key Design Decisions

1. **Signal-based State Management:** Angular signals for reactive UI updates
2. **Standalone Components:** Modern Angular approach without NgModules
3. **Firestore Collections:** Document-based for flexibility and scalability
4. **Service Layer:** Centralized business logic in services
5. **Guards:** Route-based protection for authentication and authorization
6. **Tailwind CSS:** Utility-first approach for rapid development

### 📄 License

This project is part of SkillSwap MVP - a skill exchange platform.

---

**Last Updated:** January 24, 2026
**Version:** 1.0 MVP
