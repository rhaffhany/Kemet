import { AuthService } from 'src/app/services/auth.service';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private DeployUrl = 'https://kemet-server.runasp.net/api/Wishlist'; // Base API URL

  constructor(private http: HttpClient, private AuthService: AuthService) {}

  // Fetch Wishlist
  getWishlist(): Observable<any> {
    const token = this.AuthService.getToken(); // Get Token from AuthService
    console.log('Using Token:', token); // Debugging

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    console.log('Fetching wishlist from:', this.DeployUrl); // Debugging Log

    return this.http.get(this.DeployUrl, { headers }).pipe(
      tap(response => console.log('Wishlist Response:', response)), // Log response
      catchError(this.handleError) // Error handling
    );
  }

  // Handle Errors
  private handleError(error: HttpErrorResponse) {
    console.error('Error fetching wishlist:', error); // Log error
    let errorMessage = 'Unknown error!';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 401:
          errorMessage = 'Unauthorized! Please log in again.';
          break;
        case 403:
          errorMessage = 'Forbidden! You don’t have permission.';
          break;
        case 404:
          errorMessage = 'Wishlist not found!';
          break;
        default:
          errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }

    return throwError(() => new Error(errorMessage));
  }

  

  private getHeaders(): HttpHeaders {
    const token = this.AuthService.getToken();
    if (!token) {
      console.error('Authentication token is missing.');
      throw new Error('User is not authenticated.');
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }


  addPlaceToWishlist(placeID: number): Observable<any> {
    return this.http.post(`${this.DeployUrl}/AddPlaceToWishlist?PlaceID=${placeID}`, {}, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error adding place to wishlist:', error);
        return throwError(() => new Error('Failed to add place to wishlist.'));
      })
    );
  }
  
  // Remove a place from the wishlist
  removeFromWishlist(placeID: number): Observable<any> {
    return this.http.delete(`${this.DeployUrl}/Remove?PlaceID=${placeID}`, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error removing place from wishlist:', error);
        return throwError(() => new Error('Failed to remove place from wishlist.'));
      })
    );
  }
}
