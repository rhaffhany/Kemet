import { SearchService } from './../../services/search.service';
import { Component } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';

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
    private SearchService: SearchService,
    private cdr: ChangeDetectorRef
  ) {}

  onSearchInput(): void {
    if (this.query.trim()) {
      this.SearchService.search(this.query).subscribe({
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