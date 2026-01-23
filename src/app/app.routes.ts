import { Routes } from '@angular/router';
import { Signin } from './auth/components/signin/signin';
import { Signup } from './auth/components/signup/signup';
import { Home } from './features/visiteur/home/home';
import { authGuard, noAuthGuard } from './auth/guards/guard-guard';
import { adminGuard } from './auth/guards/role-guard';

export const routes: Routes = [
    {
        path: 'signin',
        component: Signin,
        canActivate: [noAuthGuard]
    },
    {
        path: 'signup',
        component: Signup,
        canActivate: [noAuthGuard]
    },
    {
        path: '',
        component: Home
    },
    {
        path: 'home/:uid',
        loadComponent: () => import('./features/user/pages/home/home').then(m => m.Home),
        canActivate: [authGuard]
    },
    {
        path: 'admin',
        loadComponent: () => import('./features/admin/pages/dashbord/dashbord').then(m => m.Dashbord),
        canActivate: [authGuard, adminGuard]
    },
    {
        path: '**',
        pathMatch: 'full',
        redirectTo: ''
    }
];
