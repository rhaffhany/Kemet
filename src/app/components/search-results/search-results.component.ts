import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchService } from '../../services/search.service';

type ResultType = 'place' | 'activity';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit {
  query: string = '';
  searchResults: any[] = [];
  filteredResults: any[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  notFoundImg: string = "/assets/img/not found.jpg";
  
  // Filter properties
  availableCategories: string[] = [];
  selectedCategories: Set<string> = new Set();
  typeFilters = {
    place: false,
    activity: false
  };
  
  isFiltersVisible: boolean = false;
  
  constructor(
    private searchService: SearchService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get query parameter from URL
    this.route.queryParams.subscribe(params => {
      this.query = params['q'] || '';
      if (this.query) {
        this.performSearch();
      }
    });
  }

  performSearch(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.searchService.search(this.query).subscribe({
      next: (results) => {
        this.searchResults = results;
        
        // Extract all unique categories from results
        this.extractCategories();
        
        // Show all results initially
        this.filteredResults = this.searchResults;
        
        this.isLoading = false;
        if (results.length === 0) {
          this.errorMessage = 'No results found for "' + this.query + '"';
        }
      },
      error: (error) => {
        console.error("Search error:", error);
        this.errorMessage = 'An error occurred while searching. Please try again.';
        this.searchResults = [];
        this.filteredResults = [];
        this.isLoading = false;
      }
    });
  }

  extractCategories(): void {
    // Extract unique categories from search results
    const uniqueCategories = new Set<string>();
    
    this.searchResults.forEach(result => {
      if (result.category) {
        uniqueCategories.add(result.category.toLowerCase());
      }
    });
    
    this.availableCategories = Array.from(uniqueCategories).sort();
  }

  isCategorySelected(category: string): boolean {
    return this.selectedCategories.has(category);
  }

  toggleCategory(category: string): void {
    if (this.selectedCategories.has(category)) {
      this.selectedCategories.delete(category);
    } else {
      this.selectedCategories.add(category);
    }
    this.applyFilters();
  }

  applyFilters(): void {
    // If no filters are selected, show all results
    const noTypeFiltersSelected = !this.typeFilters.place && !this.typeFilters.activity;
    const noCategoriesSelected = this.selectedCategories.size === 0;

    if (noTypeFiltersSelected && noCategoriesSelected) {
      this.filteredResults = this.searchResults;
      return;
    }

    // Filter results based on selected types and categories
    this.filteredResults = this.searchResults.filter(result => {
      // If no type filters are selected, don't filter by type
      const typeMatches = noTypeFiltersSelected || this.typeFilters[result.type as ResultType];
      
      // If no categories are selected, don't filter by category
      const categoryMatches = noCategoriesSelected || this.selectedCategories.has(result.category.toLowerCase());
      
      return typeMatches && categoryMatches;
    });
  }
  
  resetFilters(): void {
    // Reset type filters to false (no selection)
    this.typeFilters.place = false;
    this.typeFilters.activity = false;
    
    // Reset category filters to empty
    this.selectedCategories.clear();
    
    // Show all results
    this.filteredResults = this.searchResults;
  }

  goToDetails(result: any): void {
    if (result.type === 'place') {
      this.router.navigate(['/app-places', result.id]);
    } else if (result.type === 'activity') {
      this.router.navigate(['/app-activities', result.id]);
    }
  }

  onSearchSubmit(): void {
    // Update URL with new query parameter without reloading the page
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: this.query },
      queryParamsHandling: 'merge',
    });
    
    this.performSearch();
  }

  toggleFilters() {
    this.isFiltersVisible = !this.isFiltersVisible;
  }
}
