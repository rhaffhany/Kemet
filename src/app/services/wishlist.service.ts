import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private DeployUrl = 'https://kemet-server.runasp.net/api/Wishlist';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getWishlist(): Observable<any> {
    return this.http.get(this.DeployUrl, { headers: this.getHeaders() }).pipe(
      tap(response => console.log('Wishlist Response:', response)),
      catchError(this.handleError)
    );
  }

  addPlaceToWishlist(placeID: number): Observable<any> {
    return this.http.post(`${this.DeployUrl}/AddPlaceToWishlist?PlaceID=${placeID}`, {}, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  removeFromWishlist(itemId: number, itemType: string): Observable<any> {
    const url = `${this.DeployUrl}/RemoveFromWishlist?itemId=${itemId}&itemType=${itemType}`;
    const headers = this.getHeaders();

    console.log(`Removing item: ID=${itemId}, Type=${itemType}`); // Log the request
    return this.http.delete(url, { headers }).pipe(
      catchError(this.handleError) // Handle errors
    );
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      console.error('Authentication token is missing.');
      throw new Error('User is not authenticated.');
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 401:
          errorMessage = 'Unauthorized! Please log in again.';
          break;
        case 403:
          errorMessage = 'Forbidden! You do not have permission to perform this action.';
          break;
        case 404:
          errorMessage = 'Resource not found!';
          break;
        case 500:
          errorMessage = 'Internal server error. Please try again later.';
          break;
        default:
          errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }
    console.error('HTTP Error:', errorMessage); // Log the error for debugging
    return throwError(() => new Error(errorMessage));
  }
}