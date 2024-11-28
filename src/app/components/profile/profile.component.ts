import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { ProfileService } from 'src/app/services/profile.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {

  constructor(private _ProfileService:ProfileService, private _ElementRef:ElementRef){}

  userData:any = {
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    ssn: "",
    gender: "",
    nationality: "",
    imageURL:"",
    interestCategoryIds: []
  }
  
  // assets
  layoutPic:string = "/assets/img/sunset-5314319_640.png";
  profileImg: string = 'assets/img/default-profile.png';
  userName:string = "@";

  locationIcon:string = "/assets/icons/Location.png";
  calendarIcon:string = "/assets/icons/Calendar.png";
  websiteIcon:string = "/assets/icons/Discovery.png";
  bioIcon:string = "/assets/icons/Edit.png"

  chatIcon:string = "/assets/icons/Chat.png";
  heartIcon:string = "/assets/icons/Heart.png";
  sendIcon:string = "/assets/icons/Send.png";

  lockIcon:string = "/assets/icons/Lock.png";
  cameraIcon:string ="/assets/icons/Camera.png";
  editIcon:string = "/assets/icons/Edit Square.png";

  postImg:string = "/assets/img/Credits20Al20-The20Newspaper 1.png"

  backgroundEdit:string = "/assets/img/sunset-update.png"


  //Api
  handleUploadImg(event:any){
    var file = event.target.files[0];
    const formData:FormData = new FormData();
    formData.append('profileImage',file);

    this._ProfileService.UploadProfileImg(formData).subscribe({
      next:(response)=>{
        console.log(response);
        this.profileImg = `https://localhost:7051/${response.filePath}`;
      },
      error:(err)=>{
        console.error('Upload Error:', err);
      }
    });
  }

  updatedData:any = {...this.userData};

  ngOnInit(): void {
    this._ProfileService.getCurrentUserData().subscribe({
      next:(data)=>{
        // console.log(data);
        this.userData = data;
        this.updatedData = { ...this.userData };
        if (!this.userData.profileImage) {
          this.userData.profileImage = '../../../../src/assets/img/default-profile.png';
        }
      },
      error: (err) => {
        console.error('Error fetching user data:', err);
      },

    });
  }
  
  updateCurrentData(): void {
    this.updatedData.profileImage = this.profileImg;
    this._ProfileService.updateCurrentData(this.updatedData).subscribe({
      next:(response)=>{
        console.log(response);
        this.userData = {...this.updatedData};
        this.showEditSection = true;
        Swal.fire({
          title: 'Success!',
          text: 'Your profile has been updated successfully.',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: 'var(--secondary-color)',
        });
      },
      error:(err)=>{
        Swal.fire({
          title: 'Error!',
          text: 'There was an issue updating your profile. Please try again later.',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#d33',
        });
      },
    });
  }
  
 



  // editBoxContainer
  months: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  days: number[] = Array.from({ length: 31 }, (_, i) => i + 1); 
  years: number[] = Array.from({ length: 101 }, (_, i) => new Date().getFullYear() - i); 

  selectedMonth: string = this.months[0];
  selectedDay: number = this.days[0];
  selectedYear: number = this.years[0];


  showEditSection: boolean = true; 
  toggleEditBox(): void {
    this.showEditSection = !this.showEditSection; 
  }



}