import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, map } from 'rxjs';
import { catchError, tap, mergeMap } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private DeployUrl = 'https://kemet-server.runasp.net/api/Wishlist';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getWishlist(): Observable<any> {
    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => new Error('No authentication token available'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get(`${this.DeployUrl}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  addPlaceToWishlist(placeID: number): Observable<any> {
    return this.getWishlist().pipe(
      map(response => {
        // Check if place already exists in wishlist
        const places = response?.places?.$values || [];
        const isDuplicate = places.some((place: any) => place.placeID === placeID);
        
        if (isDuplicate) {
          throw new Error('This place is already in your wishlist');
        }
        
        // If not a duplicate, add to wishlist
        const headers = this.getHeaders();
        return this.http.post(`${this.DeployUrl}/AddPlaceToWishlist?PlaceID=${placeID}`, {}, { headers }).pipe(
          catchError(this.handleError)
        );
      }),
      catchError(error => {
        if (error.message === 'This place is already in your wishlist') {
          return throwError(() => error);
        }
        return this.handleError(error);
      })
    ).pipe(
      // Flatten the nested Observable
      mergeMap(observable => observable)
    );
  }

  addActivityToWishlist(activityId: number): Observable<any> {
    return this.getWishlist().pipe(
      map(response => {
        // Check if activity already exists in wishlist
        const activities = response?.activities?.$values || [];
        const isDuplicate = activities.some((activity: any) => activity.activityId === activityId);
        
        if (isDuplicate) {
          throw new Error('This activity is already in your wishlist');
        }
        
        // If not a duplicate, add to wishlist
        const headers = this.getHeaders();
        return this.http.post(`${this.DeployUrl}/AddActivityToWishlist?ActivityID=${activityId}`, {}, { headers }).pipe(
          catchError(this.handleError)
        );
      }),
      catchError(error => {
        if (error.message === 'This activity is already in your wishlist') {
          return throwError(() => error);
        }
        return this.handleError(error);
      })
    ).pipe(
      // Flatten the nested Observable
      mergeMap(observable => observable)
    );
  }

  addPlanToWishlist(planId: number): Observable<any> {
    return this.getWishlist().pipe(
      map(response => {
        // Check if plan already exists in wishlist
        const plans = response?.plans?.$values || [];
        const isDuplicate = plans.some((plan: any) => 
          (plan.planId === planId || plan.planID === planId)
        );
        
        if (isDuplicate) {
          throw new Error('This plan is already in your wishlist');
        }
        
        // If not a duplicate, add to wishlist
        const headers = this.getHeaders();
        return this.http.post(`${this.DeployUrl}/AddPlaneToWishlist?PlanID=${planId}`, {}, { headers }).pipe(
          catchError(error => {
            if (error.status === 401) {
              throw new Error('Please log in to add items to your wishlist');
            }
            return this.handleError(error);
          })
        );
      }),
      catchError(error => {
        if (error.message === 'This plan is already in your wishlist' || 
            error.message === 'Please log in to add items to your wishlist') {
          return throwError(() => error);
        }
        return this.handleError(error);
      })
    ).pipe(
      mergeMap(observable => observable)
    );
  }

  removeFromWishlist(itemId: number, itemType: string = 'place'): Observable<any> {
    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => new Error('Please log in to remove items from your wishlist'));
    }

    const url = `${this.DeployUrl}/RemoveFromWishlist`;
    const params = `?itemId=${itemId}&itemType=${itemType.toLowerCase()}`;
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    
    return this.http.delete(url + params, { headers }).pipe(
      catchError(error => {
        if (error.status === 401) {
          return throwError(() => new Error('Please log in to remove items from your wishlist'));
        }
        if (error.status === 404) {
          return throwError(() => new Error('Item not found in wishlist'));
        }
        return this.handleError(error);
      })
    );
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('User is not authenticated.');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 401:
          errorMessage = 'Unauthorized! Please log in again.';
          break;
        case 403:
          errorMessage = 'Forbidden! You do not have permission to perform this action.';
          break;
        case 404:
          errorMessage = 'The requested resource was not found.';
          break;
        case 409:
          errorMessage = 'This item already exists in your wishlist.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }
    return throwError(() => new Error(errorMessage));
  }
}