import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { DetailsService } from './details.service';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private DeployUrl = 'https://kemet-server.runasp.net';
  private defaultImage = 'assets/img/k.png'; // Default image if none exists

  constructor(private http: HttpClient, private detailsService: DetailsService) {}

  search(query: string): Observable<any[]> {
    if (!query.trim()) {
      return of([]);
    }

    const params = new HttpParams().set('text', query);

    return this.http.get<any>(`${this.DeployUrl}/api/Search/Search`, { params }).pipe(
      switchMap(response => {
        if (!response) {
          return of([]);
        }

        // Extract places and activities, ensuring both are arrays
        const places = response.places?.$values?.map((place: any) => ({
          id: place.id,
          name: place.name,
          description: place.description || 'No description available',
          type: 'place'
        })) || [];

        const activities = response.activities?.$values?.map((activity: any) => ({
          id: activity.id,
          name: activity.name,
          description: activity.description || 'No description available',
          type: 'activity'
        })) || [];

        // If no places or activities are found, return an empty array
        if (places.length === 0 && activities.length === 0) {
          return of([]);
        }

        // Fetch detailed data for each place
        const placeRequests: Observable<any>[] = places.map((place: { id: any; }) =>
          this.detailsService.getDetailedPlace(place.id).pipe(
            map(details => ({
              ...place,
              category: details.categoryName || 'Uncategorized', // Include category
              image: details.imageURLs?.$values?.[0] || this.defaultImage
            })),
            catchError(() => of({ ...place, category: 'Uncategorized', image: this.defaultImage })) // Fallback in case of error
          )
        );

        // Fetch detailed data for each activity
        const activityRequests: Observable<any>[] = activities.map((activity: { id: any; }) =>
          this.detailsService.getDetailedActivity(activity.id).pipe(
            map(details => ({
              ...activity,
              category: details.categoryName || 'Uncategorized', // Include category
              image: details.imageURLs?.$values?.[0] || this.defaultImage
            })),
            catchError(() => of({ ...activity, category: 'Uncategorized', image: this.defaultImage })) // Fallback in case of error
          )
        );

        // Execute both requests in parallel
        return forkJoin([...placeRequests, ...activityRequests]) as Observable<any[]>;
      }),
      catchError(error => {
        console.error('Search API error:', error);
        return of([]); // Ensure the function always returns an array
      })
    );
  }
}
