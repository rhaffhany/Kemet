import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError, switchMap } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

export interface Interest {
  id: number;
  name: string;
  type: 'Place' | 'Activity';
}

@Injectable({
  providedIn: 'root'
})
export class InterestsService {
  private apiUrl = 'https://kemet-server.runasp.net';
  private showInterestsFormSubject = new BehaviorSubject<boolean>(false);
  showInterestsForm$ = this.showInterestsFormSubject.asObservable();

  private refreshInterestsSubject = new BehaviorSubject<void>(undefined);
  refreshInterests$ = this.refreshInterestsSubject.asObservable();

  private selectedInterests: number[] = [];

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  showInterestsForm() {
    this.showInterestsFormSubject.next(true);
  }

  hideInterestsForm() {
    this.showInterestsFormSubject.next(false);
    this.refreshInterestsSubject.next();
  }

  setSelectedInterests(interests: number[]): Observable<any> {
    const headers = this.getAuthHeaders();
    
    // First try PUT to update existing interests
    return this.http.put(`${this.apiUrl}/Api/CustomerInterests/UpdateInterests`, {
      categoryIds: interests
    }, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        // If PUT fails with 404 (Not Found), try POST to create new interests
        if (error.status === 404) {
          return this.http.post(`${this.apiUrl}/Api/CustomerInterests/AddInterests`, {
            categoryIds: interests
          }, { headers });
        }
        // For other errors, propagate them
        console.error('Error setting interests:', error);
        if (error.status === 401) {
          return throwError(() => new Error('Your session has expired. Please log in again.'));
        }
        return throwError(() => new Error('Failed to save interests. Please try again.'));
      })
    );
  }

  getUserInterests(): Observable<any> {
    const headers = this.getAuthHeaders();
    
    return this.http.get(`${this.apiUrl}/Api/CustomerInterests/GetInterests`, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error getting interests:', error);
        if (error.status === 401) {
          return throwError(() => new Error('Your session has expired. Please log in again.'));
        }
        return throwError(() => new Error('Failed to load interests. Please try again.'));
      })
    );
  }

  getSelectedInterests(): number[] {
    return this.selectedInterests;
  }

  getAllInterests(): Interest[] {
    return [
      { id: 1, name: 'Historical', type: 'Place' },
      { id: 2, name: 'Resorts and Beaches', type: 'Place' },
      { id: 3, name: 'Nature Spots', type: 'Place' },
      { id: 4, name: 'Museums', type: 'Place' },
      { id: 5, name: 'Religious', type: 'Place' },
      { id: 6, name: 'Nile River Destinations', type: 'Place' },
      { id: 7, name: 'Desert Landscape', type: 'Place' },
      { id: 8, name: 'Entertainment', type: 'Place' },
      { id: 9, name: 'Diving Snorkeling', type: 'Activity' },
      { id: 10, name: 'Hiking', type: 'Activity' },
      { id: 11, name: 'Water Sports and Nile Activities', type: 'Activity' },
      { id: 12, name: 'Cultural Experience', type: 'Activity' },
      { id: 13, name: 'Adventure Activity', type: 'Activity' },
      { id: 14, name: 'Relaxation and Wellness', type: 'Activity' },
      { id: 15, name: 'Entertainment', type: 'Activity' },
      { id: 16, name: 'Safari', type: 'Activity' },
      { id: 17, name: 'Fancy Cafe', type: 'Activity' },
      { id: 18, name: 'Fancy Restaurant', type: 'Activity' },
      { id: 19, name: 'Hidden Gems', type: 'Place' },
      { id: 20, name: 'Hidden Gems', type: 'Activity' }
    ];
  }
} 