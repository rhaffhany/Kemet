import { Component } from '@angular/core';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
  selector: 'app-nav-app',
  templateUrl: './nav-app.component.html',
  styleUrls: ['./nav-app.component.scss']
})
export class NavAppComponent {
  
  constructor(private _ProfileService:ProfileService){}

  logo:string = "/assets/logo/logo.png";
  searchIcon:string = "/assets/icons/Search.png"
  profilePic:string = "/assets/icons/profile-pic.svg"

  userData:any = {};

  updatedData:any = {...this.userData};


  ngOnInit(): void {
    this._ProfileService.getCurrentUserData().subscribe({
      next:(data)=>{
        this.userData = data;
        this.updatedData = { ...this.userData };

        if (!this.userData.imageURL) {
          this.profilePic;
        }else{
          this.profilePic = this.userData.filePath;
        }
      },
      error: (err) => {
        console.error('Error fetching user data:', err);
      },

    });
  }

  uploadProfileImg(event:any){
    const file = event.target.files[0];
    if (!file) {
      console.error('No file selected!');
      return;
    }
    const formData:FormData = new FormData();
    formData.append('profileImage',file);

    this._ProfileService.uploadProfileImg(formData).subscribe({
      next:(response)=>{
        console.log(response);
        this.profilePic = `https://localhost:7051/${response.filePath}`;
      },
      error:(err)=>{
        console.error('Upload Error:', err);
      }
    });
  }

  updateCurrentData(): void {
    
    if (!this.userData.imageURL) {
      this.profilePic;
    }else{
      this.updatedData.imageURL = this.userData.filePath;
    }

    this._ProfileService.updateCurrentData(this.updatedData).subscribe({
      next:(response)=>{
        this.userData = {...this.updatedData};
      },
      error:(err)=>{
      },
    });
  }


  
}
