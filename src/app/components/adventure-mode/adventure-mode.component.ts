import { Component } from '@angular/core';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
  selector: 'app-adventure-mode',
  templateUrl: './adventure-mode.component.html',
  styleUrls: ['./adventure-mode.component.scss'],
})
export class AdventureModeComponent {
  logoImage: string = 'assets/logo/k.png';
  imageURLs: string = ''; 
  name: string = ''; 
  errorMessage: string = '';
  isSpinning: boolean = false;
  disableButton: boolean = false;
  errorImage: string = 'assets/img/retry.jpg'; 
  fallbackImage: string = 'assets/logo/logo.png';
  spinAngle: number = 0; 
  animationDuration: number = 3; 

  constructor(private profileService: ProfileService) {}

  fetchAdventureData(): void {
    this.isSpinning = true;
    this.disableButton = true;

    this.spinAngle = 360 * 5; // Spin 5 full rotations

    setTimeout(() => {
      this.profileService.getAdventureData().subscribe(
        (data) => {

          this.logoImage = data?.placeDto?.imageURLs?.$values[0] || this.fallbackImage;
          this.name = data?.placeDto?.name || '';
        },
        (error) => {
          // Set the error image in case of failure
          this.logoImage = this.errorImage;
          this.errorMessage = error;
        },
        () => {

          setTimeout(() => {
            this.isSpinning = false;
            this.disableButton = false;
            // Reset the spin angle to ensure it stays at 0 degree
            this.spinAngle = 0;
          }, 500); // Add a slight delay to reset and stop the spin
        }
      );
    }, this.animationDuration * 1000);
  }

  onButtonClick(): void {
    this.fetchAdventureData();
  }
}
