import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, EMPTY, Observable, throwError } from "rxjs";

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const routerService = inject(Router);
    return next(req).pipe(
        catchError((error) => {
            switch (error.status) {
                case 401:
                    console.error(error.message);
                    routerService.navigate(['/login']);
                    return EMPTY;
                case 500:
                    console.error(error.message);
                    return EMPTY;
                default:
                    return throwError(() => error);
            }
        })
    );
}