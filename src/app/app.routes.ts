import { Routes } from '@angular/router';
import { Signin } from './auth/components/signin/signin';
import { Signup } from './auth/components/signup/signup';
import { Home } from './features/visiteur/home/home';


export const routes: Routes = [
    {
        path: 'signin',
        component: Signin,
    },
    {
        path: 'signup',
        component: Signup,
    },
    {
        path: '',
        component: Home
    },
    {
        path: 'home',
        loadComponent: () => import('./features/user/pages/home/home').then(m => m.Home),
        children: [
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
                path:'bestmatches',
                loadComponent:()=>import('./features/user/pages/bestmatches/bestmatches').then(m=>m.Bestmatches)
            },
            {
                path:'chat',
                loadComponent:()=>import('./features/user/pages/chat/chat').then(m=>m.Chat)

            }
        ]
    },
    {
        path: 'admin',
        loadComponent: () => import('./features/admin/pages/dashbord/dashbord').then(m => m.Dashbord),
    },
    {
        path: '**',
        pathMatch: 'full',
        redirectTo: ''
    }
];
