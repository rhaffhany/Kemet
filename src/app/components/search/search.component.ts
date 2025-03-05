import { Component } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router'; // Import Router
import { SearchService } from './../../services/search.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent {
  searchIcon = "/assets/icons/Search.png";
  query = '';
  searchResults: any[] = [];
  errorMessage = '';

  constructor(
    private searchService: SearchService,
    private cdr: ChangeDetectorRef,
    private router: Router 
  ) {}

  goToDetails(result: any) {
    console.log('Navigating to:', result);

    // Navigate based on result type
    if (result.type === 'place') {
      this.router.navigate(['/app-places', result.id]); 
    } else if (result.type === 'activity') {
      this.router.navigate(['/app-activities', result.id]); 
    }
  }

  onSearchInput(): void {
    if (this.query.trim()) {
      this.searchService.search(this.query).subscribe({
        next: (results) => {
          this.searchResults = results;
          this.errorMessage = results.length === 0 ? 'No results found' : '';
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error("Search error:", error);
          this.errorMessage = error;
          this.searchResults = [];
          this.cdr.detectChanges();
        }
      });
    } else {
      this.searchResults = [];
      this.errorMessage = '';
      this.cdr.detectChanges();
    }
  }
}
