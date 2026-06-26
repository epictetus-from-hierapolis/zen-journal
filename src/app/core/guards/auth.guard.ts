import { inject } from "@angular/core";
import { CanActivateFn, RedirectCommand, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";

export const canAuthenticate: CanActivateFn = () => {
    const router = inject(Router);
    const authService = inject(AuthService);

    if (!authService.isAuthenticated()) {
        const loginPath = router.parseUrl("/login");
        return new RedirectCommand(loginPath);
    }

    return true;
}