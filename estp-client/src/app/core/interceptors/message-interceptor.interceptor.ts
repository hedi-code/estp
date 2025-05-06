import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { AuthCookieService } from '../services/auth-cookie.service';
import { tap } from 'rxjs';
import { inject } from '@angular/core';

interface ApiResponse {
  message?: string;
  error?: string;
}
export const messageInterceptorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);  // Inject MessageService

  return next(req).pipe(
    tap({
      next: (event) => {
        if (event instanceof HttpResponse && event.body) {
          const body = event.body as ApiResponse;  // Cast the body to ApiResponse

          // Check if the response contains "message"
          if (body.message) {
            messageService.add({
              severity: 'success',  // 'success' for positive messages
              summary: 'Success',
              detail: body.message,
              life: 20000
            });
          }

          // Check if the response contains "error"
          if (body.error) {
            messageService.add({
              severity: 'error',  // 'error' for failure messages
              summary: '',
              detail: body.error,
              life: 20000
            });
          }
        }
      },
      error: (error: HttpErrorResponse) => {
        // Show error toast if the request fails
        const detail = error.error?.message || error.error?.error || 'An unexpected error occurred';
        messageService.add({
          severity: 'error',
          life: 20000,
          summary: '',
          detail
        });
      }
    })
  );
}
