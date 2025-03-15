import { userData } from 'src/app/interfaces/user-data';
import { ProfileService } from './../../services/profile.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-travel-agency-profile',
  templateUrl: './travel-agency-profile.component.html',
  styleUrls: ['./travel-agency-profile.component.scss']
})
export class TravelAgencyProfileComponent implements OnInit {

  constructor(private _ProfileService:ProfileService){}
  
  layoutPic:string = "/assets/img/sunset-5314319_640.png";
  profileImg: string = 'assets/img/default-profile.png';
  backgroundEdit:string = "/assets/img/sunset-update.png"
  user:string = "@";

  //icons
  locationIcon:string = "/assets/icons/Location.png";
  calendarIcon:string = "/assets/icons/Calendar.png";
  websiteIcon:string = "/assets/icons/Discovery.png";
  bioIcon:string = "/assets/icons/Edit.png"
  chatIcon:string = "/assets/icons/Chat.png";
  heartIcon:string = "/assets/icons/Heart.png";
  sendIcon:string = "/assets/icons/Send.png";
  lockIcon:string = "/assets/icons/Lock.png";
  editIcon:string = "/assets/icons/Edit Square.png";

  userData:userData = {} as userData;
  updatedData:any = {...this.userData};

  ngOnInit(): void {
    this._ProfileService.getCurrentUserData().subscribe({
      next:(data)=>{
        this.userData = data;
        this.updatedData = { ...this.userData };
        if (!this.userData.profileImageURL) {
          this.profileImg;
        }else{
          this.profileImg = this.userData.profileImageURL;
        }
      },
      error: (err) => {
        console.error('Error fetching user data:', err);
      },
    });

  }
}
