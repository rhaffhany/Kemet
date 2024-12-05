import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent {
  searchIcon:string = "/assets/icons/Search.png"
  query: string = '';  
  searchResults: any[] = [];  
  errorMessage: string = ''; 
  constructor(private http: HttpClient) {}

  onSearchInput() {
    const query = this.query.trim();

    if (query.length === 0) {
      this.clearResults();
      return;
    }

    this.fetchSearchResults(query);
  }

  fetchSearchResults(query: string) {
    console.log(`Searching for: ${query}`);  

    this.http.get(`https://localhost:7051/api/Search/Search?query=${encodeURIComponent(query)}`)
      .subscribe(
        (data: any) => {

          this.updateResults(data);
          this.errorMessage = '';  
        },
        (error) => {
          console.error('Error fetching search results:', error);
          
          if (error.error) {
            console.error('API Error response:', error.error);
          } else {
            console.error('Unknown error:', error);
          }

          this.errorMessage = 'Failed to fetch search results. Please try again later.';
          this.clearResults();
        }
      );
  }

  updateResults(data: any) {
    console.log('Search results received:', data);  
    this.searchResults = data.places || [];  
  }

  clearResults() {
    this.searchResults = [];
  }
}
