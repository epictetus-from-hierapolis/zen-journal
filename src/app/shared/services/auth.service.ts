import { Injectable, signal } from "@angular/core";
import { HandleError } from "../decorators/handle-error.decorator";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    public isAuthenticated = signal<boolean>(
        !!localStorage.getItem('zen-auth')
    );

    @HandleError
    public async login(userName: string, password: string): Promise<boolean> {
        if (userName && password) {
            localStorage.setItem('zen-auth', 'true');
            this.isAuthenticated.set(true);
            return true;
        }
        return false;
    }

    @HandleError
    public async logout(): Promise<void> {
        localStorage.removeItem('zen-auth');
        this.isAuthenticated.set(false);
    }
}