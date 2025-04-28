import { Component, OnInit } from '@angular/core';
import { ProfileService } from 'src/app/services/profile.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-adventure-mode',
  templateUrl: './adventure-mode.component.html',
  styleUrls: ['./adventure-mode.component.scss'],
})
export class AdventureModeComponent implements OnInit {
  logoImage: string = 'assets/logo/K.PNG';
  name: string = ''; 
  errorMessage: string = '';
  isSpinning: boolean = false;
  disableButton: boolean = false;
  errorImage: string = 'assets/img/retry.jpg'; 
  fallbackImage: string = 'assets/logo/logo.png';
  spinAngle: number = 0; 
  animationDuration: number = 3;
  
  constructor(private profileService: ProfileService) {}
  
  ngOnInit(): void {
  }

  fetchAdventureData(): void {
    this.isSpinning = true;
    this.disableButton = true;
    this.errorMessage = ''; 
    
    const rotations = 5 + Math.random() * 2;
    this.spinAngle = 360 * rotations;

    setTimeout(() => {
      this.profileService.getAdventureData()
        .pipe(
          finalize(() => {
            setTimeout(() => {
              this.isSpinning = false;
              this.disableButton = false;
              this.spinAngle = 0;
            }, 500);
          })
        )
        .subscribe({
          next: (data) => {
            if (data?.place?.imageURLs?.$values?.length > 0) {
              this.logoImage = data.place.imageURLs.$values[0];
            } else {
              this.logoImage = this.fallbackImage;
            }
            this.name = data?.place?.name || 'Adventure Awaits';
          },
          error: (error) => {
            this.logoImage = this.errorImage;
            this.errorMessage = 'Unable to fetch adventure. Try again!';
            this.name = 'Oops! Try Again';
          }
        });
    }, 500); 
  }

  onButtonClick(): void {
    this.fetchAdventureData();
  }
}