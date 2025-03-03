import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service'; 

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private DeployUrl = 'https://kemet-server.runasp.net';


  constructor(private http: HttpClient, private authService: AuthService) {}

  addPlaceToWishlist(placeID: number): Observable<any> {
    const token = this.authService.getToken();
    if (!token) {
      console.error('Authentication token is missing.');
      return throwError(() => new Error('User is not authenticated.'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http
      .post(`${this.DeployUrl}/AddPlaceToWishlist?PlaceID=${placeID}`, {}, { headers })
      .pipe(
        catchError((error) => {
          console.error('Error adding place to wishlist:', error);
          return throwError(() => new Error('Failed to add place to wishlist.'));
        })
      );
  }

  
  removeFromWishlist(placeID: number): Observable<any> {
    const token = this.authService.getToken();
    if (!token) {
      console.error('Authentication token is missing.');
      return throwError(() => new Error('User is not authenticated.'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http
      .delete(`${this.DeployUrl}/RemovePlaceFromWishlist?PlaceID=${placeID}`, { headers })
      .pipe(
        catchError((error) => {
          console.error('Error removing place from wishlist:', error);
          return throwError(() => new Error('Failed to remove place from wishlist.'));
        })
      );
  }
}

