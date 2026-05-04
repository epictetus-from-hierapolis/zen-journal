import { HttpInterceptorFn } from "@angular/common/http";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const token = localStorage.getItem('zen-auth');
    if (!token) return next(req);
    const reqWithHeaders = req.clone({
        withCredentials: true,
        setHeaders: {
            'Authorization': `Bearer ${token}`
        }
    });
    return next(reqWithHeaders);
}