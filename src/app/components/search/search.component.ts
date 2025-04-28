import { Component } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
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
  notFoundImg: string = "/assets/img/not found.jpg";
  showDropdown: boolean = false;

  constructor(
    private searchService: SearchService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  goToDetails(result: any) {
    // Close dropdown after selection
    this.showDropdown = false;
    
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
          this.showDropdown = true;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error("Search error:", error);
          this.errorMessage = error;
          this.searchResults = [];
          this.showDropdown = true;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.searchResults = [];
      this.errorMessage = '';
      this.showDropdown = false;
      this.cdr.detectChanges();
    }
  }
  
  // Method for submitting search - triggered by Enter key or arrow button
  onSearchSubmit(): void {
    if (this.query.trim()) {
      // Close dropdown and navigate to search page
      this.showDropdown = false;
      this.router.navigate(['/search-results'], { queryParams: { q: this.query } });
    }
  }
  
  // Close dropdown when clicking outside
  onClickOutside(): void {
    this.showDropdown = false;
  }
}