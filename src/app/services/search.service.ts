import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private apiUrl = 'https://localhost:7051/api/Search/Search';

  constructor(private http: HttpClient) { }

  search(query: string): Observable<any[]> {
    if (!query.trim()) {
      return of([]);
    }

    return this.http.get<any>(`${this.apiUrl}?text=${encodeURIComponent(query)}`).pipe(
      map(response => {
        return response.places?.$values.map((place: any) => ({
          placeId: place.placeId, // Ensure this matches the API response key
          name: place.name,
          description: place.description
        })) || [];
      }),
      catchError(error => {
        console.error('Search error:', error);
        throw 'Error fetching search results. Please try again later.';
      })
    );
  }
}