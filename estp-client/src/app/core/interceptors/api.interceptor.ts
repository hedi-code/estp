import { HttpInterceptorFn, HTTP_INTERCEPTORS, HttpRequest, HttpHandler } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

// Class-based interceptor to show/hide loader
@Injectable()
export class ApiInterceptor {
  constructor(private loadingService: LoadingService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // Show loader when an API call starts
    this.loadingService.showLoader();

    // Intercept the API requests
    return next.handle(req).pipe(
      finalize(() => {
        // Hide the loader after the API call completes
        this.loadingService.hideLoader();
      })
    );
  }

  // Observe images and manage loader based on their loading state
  observeImages() {
    const images = document.querySelectorAll('img');
    images.forEach((img: HTMLImageElement) => {
      // Track image load and error events
      img.addEventListener('load', () => this.loadingService.trackImageLoading(false));
      img.addEventListener('error', () => this.loadingService.trackImageLoading(false));

      // Track the start of image loading (if not already loaded)
      if (!img.complete) {
        this.loadingService.trackImageLoading(true);
      }
    });
  }
}

// Add the interceptor to your app's providers array in AppModule
export const apiInterceptorProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: ApiInterceptor,
  multi: true
};
