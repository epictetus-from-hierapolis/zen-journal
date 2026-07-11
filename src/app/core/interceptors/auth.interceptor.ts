import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { STORAGE_KEYS } from "@shared/constants/storage-keys";
import { SESSION_STORAGE } from "@shared/tokens";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const sessionStorage = inject(SESSION_STORAGE);
    const token = sessionStorage.getItem(STORAGE_KEYS.AUTH);
    if (!token) return next(req);
    const reqWithHeaders = req.clone({
        withCredentials: true,
        setHeaders: {
            'Authorization': `Bearer ${token}`
        }
    });
    return next(reqWithHeaders);
}