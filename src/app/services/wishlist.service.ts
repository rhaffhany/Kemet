import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, map } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
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
      tap(response => {
        console.log('Wishlist response:', response);
      }),
      catchError(this.handleError)
    );
  }

  addPlaceToWishlist(placeID: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.DeployUrl}/AddPlaceToWishlist?PlaceID=${placeID}`, {}, { headers }).pipe(
      tap(response => console.log('Add to wishlist response:', response)),
      catchError(this.handleError)
    );
  }

  removeFromWishlist(index: number): Observable<any> {
    const token = this.authService.getToken();
    if (!token) {
      console.error('No authentication token available');
      return throwError(() => new Error('User is not authenticated'));
    }

    const url = `${this.DeployUrl}/RemoveFromWishlist?itemId=${index}&itemType=place`;
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    console.log('Removing from wishlist:', { 
      url,
      index,
      token: token.substring(0, 10) + '...',
      headers: headers.keys()
    });
    
    return this.http.delete(url, { 
      headers,
      observe: 'response'
    }).pipe(
      tap(response => {
        console.log('Remove from wishlist response:', {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          body: response.body
        });
      }),
      map(response => response.body),
      catchError(error => {
        console.error('Error in removeFromWishlist:', {
          error,
          url,
          index,
          status: error.status,
          message: error.message,
          headers: headers.keys()
        });
        return throwError(() => error);
      })
    );
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      console.error('Authentication token is missing.');
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
          errorMessage = 'Resource not found!';
          break;
        case 500:
          errorMessage = 'Internal server error. Please try again later.';
          break;
        default:
          errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }
    console.error('HTTP Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}