import { Routes } from '@angular/router';
import { Signin } from './auth/components/signin/signin';
import { Signup } from './auth/components/signup/signup';
import { Home } from './features/visiteur/home/home';
import { authGuard, onboardingGuard, guestGuard } from './auth/guards/auth.guard';


export const routes: Routes = [
    {
        path: 'signin',
        component: Signin,
        canActivate: [guestGuard]
    },  
    {
        path: 'signup',
        component: Signup,
        canActivate: [guestGuard]
    },
    {
        path:'onboarding',
        loadComponent:()=>import('./features/onboarding/onboarding.component').then(m=>m.OnboardingComponent),
        canActivate: [authGuard]
    },
    {
        path: '',
        component: Home
    },
    {
        path: 'home',
        loadComponent: () => import('./features/user/pages/home/home').then(m => m.Home),
        canActivate: [authGuard, onboardingGuard],
        children: [
            {
                path: '',
                loadComponent: () => import('./features/user/pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
            },
            {
                path: 'profil',
                loadComponent: () => import('./features/user/pages/profil/profil').then(m => m.Profil),
            },
            {
                path: 'requests',
                loadComponent: () => import('./features/user/pages/requests/requests').then(m => m.Requests)
            },
            {
                path:'suggestions',
                loadComponent:()=>import('./features/user/pages/suggestions/suggestions').then(m=>m.Suggestions)

            },
            {
                path:'matches',
                loadComponent:()=>import('./features/user/pages/matching/matching.component').then(m=>m.MatchingComponent)
            },
            {
                path:'chat',
                loadComponent:()=>import('./features/user/pages/chat/chat').then(m=>m.Chat)

            },
            {
                path:'session',
                loadComponent:()=>import('./features/user/pages/sessions/sessions.component').then(m=>m.SessionsComponent)
            },
            {
                path:'setting',
                loadComponent:()=>import('./features/user/pages/settings/settings.component').then(m=>m.SettingsComponent)
            }
        ]
    },
    {
        path: 'admin',
        loadComponent: () => import('./features/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent),
        canActivate: [authGuard]
    },
    {
        path: '**',
        pathMatch: 'full',
        redirectTo: ''
    }
];
