import { HomeService } from 'src/app/services/home.service';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { Component, OnInit, ViewChild } from '@angular/core';
import { CarouselComponent } from 'ngx-owl-carousel-o';

interface Place {
  placeID: number;
  name: string;
  imageURLs?: {
    $values: string[];
  };
  categoryName?: string;
}

@Component({
  selector: 'app-recommended',
  templateUrl: './recommended.component.html',
  styleUrls: ['./recommended.component.scss']
})
export class RecommendedComponent implements OnInit {
  @ViewChild('owlCarousel') owlCarousel: CarouselComponent | undefined;
  places: Place[] = [];
  leftArrowSrc: string = '../../../assets/icons/arrow-left-circle.svg';
  rightArrowSrc: string = '../../../assets/icons/arrow-right-circle.svg';
  carouselReady: boolean = false;

  constructor(private _HomeService: HomeService) {}

  ngOnInit() {
    this._HomeService.fetchPlaces().subscribe(
      data => {
        if (data && Array.isArray(data.$values)) {
          this.places = data.$values;
          this.carouselReady = true;
          
          // Fetch category for each place
          this.places.forEach((place: Place) => {
            this._HomeService.fetchPlaceCategory(place.placeID).subscribe(
              categoryData => {
                if (categoryData && categoryData.categoryName) {
                  place.categoryName = categoryData.categoryName;
                }
              },
              error => {
                console.error(`Error fetching category for place ${place.placeID}:`, error);
              }
            );
          });
        } else {
          console.error('Expected $values array, but received:', data);
        }
      },
      error => {
        console.error('Error fetching places:', error);
      }
    );
  }

  customOptions: OwlOptions = {
    loop: true,
    margin: 10,
    nav: false,
    dots: false,
    autoplay: true,
    autoplayTimeout: 3000,
    autoplayHoverPause: false,
    responsive: {
      0: {
        items: 1.2
      },
      768: {
        items: 3
      },
      1024: {
        items: 4
      }
    }
  };

  onPrev() {
    if (this.owlCarousel) {
      this.owlCarousel.prev();
    }
  }

  onNext() {
    if (this.owlCarousel) {
      this.owlCarousel.next();
    }
  }
}
