import { Component } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { AdventureModeService } from 'src/app/services/adventure-mode.service';

@Component({
  selector: 'app-adventure-mode',
  templateUrl: './adventure-mode.component.html',
  styleUrls: ['./adventure-mode.component.scss'],
})
export class AdventureModeComponent {

  logoImage: string = 'assets/logo/K.PNG';
  errorImage: string = 'assets/img/retry.jpg'; 
  // fallbackImage: string = 'assets/logo/logo.png';

  name: string = ''; 
  description: string = '';
  errorMessage: string = '';
  isSpinning: boolean = false;
  disableButton: boolean = false;

  spinAngle: number = 0; 
  animationDuration: number = 0;
  
  constructor(private _AdventureModeService: AdventureModeService) {}

  fetchAdventureData(): void {
    this.isSpinning = true;
    this.disableButton = true;
    this.errorMessage = ''; 
    
    const rotations = 5 + Math.random() * 2;
    this.spinAngle += 360 * rotations; 
    this.animationDuration = 3  + Math.random() * 1.5;
    
    this._AdventureModeService.getAdventureMode().pipe(
      finalize(() => {
        this.isSpinning = false;
        this.disableButton = false;
      })
    ).subscribe({
      next: (res)=>{
        console.log(res);
        const imageUrls = res.placeDto.imageURLs?.$values;
        this.name = res.placeDto.name;
        this.description = res.placeDto.description;
        if (imageUrls && imageUrls.length > 1 && imageUrls[1]) {
          this.logoImage = imageUrls[1];
        } else {
          this.logoImage = this.errorImage;
        }

        setTimeout(() => {
          this.isSpinning = false;
          this.disableButton = false;
        }, this.animationDuration * 3000);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to fetch adventure data. Please try again.';
        this.logoImage = this.errorImage; 

        setTimeout(() => {
          this.isSpinning = false;
          this.disableButton = false;
        }, this.animationDuration * 3000);
      }
    });

  }

  onButtonClick(): void {
    this.fetchAdventureData();
  }
}