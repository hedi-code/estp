import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  public loadingSubject = new BehaviorSubject<boolean>(false);
  private imageLoadingCount = 0;

  showLoader() {
    this.loadingSubject.next(true);
  }

  hideLoader() {
    this.loadingSubject.next(false);
  }

  trackImageLoading(isLoading: boolean) {
    if (isLoading) {
      this.imageLoadingCount++;
    } else {
      this.imageLoadingCount--;
    }

    if (this.imageLoadingCount > 0) {
      this.showLoader();
    } else {
      this.hideLoader();
    }
  }

}
