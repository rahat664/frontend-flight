import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'sign-in',
        title: 'Sign In',
        loadComponent: () => import('./core/auth/components/sign-in/sign-in.component').then(c => c.SignInComponent)
    },
    {
        path: 'home',
        title: 'Home',
        loadComponent: () => import('./Pages/components/home/home.component').then(c => c.HomeComponent)
    },
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: 'home',
        pathMatch: 'full'
    }
];
