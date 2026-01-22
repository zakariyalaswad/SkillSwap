import { Routes } from '@angular/router';
import { Signin } from './auth/components/signin/signin';
import { Signup } from './auth/components/signup/signup';
import { Home } from './features/visiteur/home/home';

export const routes: Routes = [
    {
        path:'signin',
        component:Signin
    },
    {
        path:'signup',
        component:Signup
    },
    {
        path:'',
        component:Home
    },
    {
        path:'**',
        pathMatch:'full',
        redirectTo:''

    }
];
