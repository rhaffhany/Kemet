import { UpdateLocationService } from './services/update-location.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'kemet';
  locationData: any;

  constructor(private _UpdateLocationService: UpdateLocationService) {}

  // Move geolocation request to a user action method
  requestLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.locationData = {
            address: `https://maps.google.com/?q=${position.coords.latitude},${position.coords.longitude}`,
            locationLink: `https://maps.google.com/?q=${position.coords.latitude},${position.coords.longitude}`,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };

          this._UpdateLocationService.updateLocation(this.locationData).subscribe();
        },
        (error) => {
          // Handle geolocation error
          const defaultLat = 30.0444; // Cairo coordinates
          const defaultLng = 31.2357;
          this.locationData = {
            address: `https://maps.google.com/?q=${defaultLat},${defaultLng}`,
            locationLink: `https://maps.google.com/?q=${defaultLat},${defaultLng}`,
            latitude: defaultLat,
            longitude: defaultLng
          };
          this._UpdateLocationService.updateLocation(this.locationData).subscribe();
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    }
  }
}
