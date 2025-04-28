import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
  selector: 'app-nav-main',
  templateUrl: './nav-main.component.html',
  styleUrls: ['./nav-main.component.scss']
})
export class NavMainComponent {

  isCollapsed = true;
  closeCollapse(){
    this.isCollapsed = true;
  }

  constructor(private _ProfileService:ProfileService,
              private _AuthService:AuthService,
              private _Router:Router
            ){}

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

        if (!this.userData.profileImageURL) {
          this.profilePic;
        }else{
          this.profilePic = this.userData.profileImageURL;
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
    formData.append('ProfileImage',file);

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


  logout(): void {
    this._AuthService.logout();
    this._Router.navigate(['/login']);
  }

}
