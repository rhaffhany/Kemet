import { UpdateLocationService } from './services/update-location.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'kemet';

  constructor(private _UpdateLocationService:UpdateLocationService){}

  locationData:any;
  

  ngOnInit(): void {

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.locationData = {
            address: `https://maps.google.com/?q=${position.coords.latitude},${position.coords.longitude}`,
            locationLink: `https://maps.google.com/?q=${position.coords.latitude},${position.coords.longitude}`,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };

          console.log("Getting Current location:", this.locationData.address);

          this._UpdateLocationService.updateLocation(this.locationData).subscribe({});

        }
      );
    }
  }

}
