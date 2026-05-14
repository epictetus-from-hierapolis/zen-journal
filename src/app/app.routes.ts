import { Routes } from '@angular/router';
import { canAuthenticate } from './shared/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./features/notes/notes.component').then(module => module.NotesComponent),
        canActivate: [canAuthenticate],
    },
    {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings.component').then(module => module.SettingsComponent),
        canActivate: [canAuthenticate],
    },
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login.component').then(module => module.LoginComponent)
    }
];
