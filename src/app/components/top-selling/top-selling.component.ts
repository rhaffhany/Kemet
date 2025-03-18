import { HomeService } from 'src/app/services/home.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-top-selling',
  templateUrl: './top-selling.component.html',
  styleUrls: ['./top-selling.component.scss']
})
export class TopSellingComponent implements OnInit {
  packages: any[] = []; // Initialize the packages array

  constructor(private HomeService: HomeService) {}

  ngOnInit(): void {
    this.loadPackages();
  }

  loadPackages(): void {
    this.HomeService.fetchTravelAgencyPlan().subscribe((data: any) => {
      this.packages = data.$values.slice(0, 3); // Get the first 3 packages
    });
  }
  
}
