import { AuthService } from 'src/app/services/auth.service';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private DeployUrl = 'https://kemet-server.runasp.net/api/Wishlist'; 

  constructor(private http: HttpClient, private AuthService: AuthService) {}

  // Fetch Wishlist
  getWishlist(): Observable<any> {
    const token = this.AuthService.getToken();
    console.log('Using Token:', token); 
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    console.log('Fetching wishlist from:', this.DeployUrl); 

    return this.http.get(this.DeployUrl, { headers }).pipe(
      tap(response => console.log('Wishlist Response:', response)), 
      catchError(this.handleError) 
    );
  }

  // Handle Errors
  private handleError(error: HttpErrorResponse) {
    console.error('Error fetching wishlist:', error); 
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
  
removeFromWishlist(itemId: string, itemType: string): Observable<any> {
  const token = this.AuthService.getToken();
  if (!token) {
    console.error('No authentication token found.');
    return throwError(() => new Error('User is not authenticated.'));
  }

  const url = `${this.DeployUrl}/RemoveFromWishlist?itemId=${itemId}&itemType=${itemType}`;

  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  });

  console.log('Token:', token);
  console.log('Request URL:', url);
  console.log('Headers:', headers);

  return this.http.delete(url, { headers }).pipe(
    catchError((error) => {
      console.error('Error removing item from wishlist:', error);

      let errorMessage = 'Failed to remove item from wishlist.';
      if (error instanceof HttpErrorResponse) {
        switch (error.status) {
          case 401:
            errorMessage = 'Unauthorized. Please log in again.';
            break;
          case 403:
            errorMessage = 'Forbidden. You do not have permission to perform this action.';
            break;
          case 404:
            errorMessage = `Item with ID ${itemId} and type ${itemType} not found in wishlist.`;
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = `Error: ${error.message}`;
        }
      }

      return throwError(() => new Error(errorMessage));
    })
  );
}
}
