import { Routes } from '@angular/router';
import { canAuthenticate } from './shared/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'notes',
        pathMatch: 'full'
    },
    {
        path: 'notes',
        loadComponent: () => import('./features/notes/notes.component').then(module => module.NotesComponent),
        canActivate: [canAuthenticate],
        children: [
            {
                path: '',
                loadComponent: () => import('./features/notes/note-placeholder.component').then(module => module.PlaceholderComponent)
            },
            {
                path: ':noteId',
                loadComponent: () => import('./features/notes/note-editor.component').then(module => module.NoteEditorComponent)
            }
        ]
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
