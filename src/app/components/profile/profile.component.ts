import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ProfileService } from 'src/app/services/profile.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {

  constructor(private _ProfileService:ProfileService){}

  
  // assets
  layoutPic:string = "/assets/img/sunset-5314319_640.png";
  profileImg: string = 'assets/img/default-profile.png';
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
  cameraIcon:string ="/assets/icons/Camera.png";
  editIcon:string = "/assets/icons/Edit Square.png";

  //images
  postImg:string = "/assets/img/Credits20Al20-The20Newspaper 1.png"
  backgroundEdit:string = "/assets/img/sunset-update.png"


  //Api

  months: string[] = [...Array(12).keys()].map(i => new Date(0, i).toLocaleString('en', { month: 'long' }));
  days: number[] = Array.from({ length: 31 }, (_, i) => i + 1); 
  years: number[] = Array.from({ length: 101 }, (_, i) => new Date().getFullYear() - i); 

  selectedMonth: string = '';
  selectedDay: number = 0;
  selectedYear: number = 0;

  usernameError: boolean = false;
    
  userData:any = {
    // "$id": " ",
    // "userName": " ",
    // "firstName": " ",
    // "lastName": " ",
    // "dateOfBirth": " ",
    // "ssn": " ",
    // "gender": " ",
    // "nationality": " ",
    // "profileImageURL": " ",
    // "backgroundImageURL": " ",
    // "interestCategoryIds": {
    //     "$id": " ",
    //     "$values": [' ']
    // },
    // "bio": " ",
    // "country": " ",
    // "city": " ",
    // "websiteLink": " ",
    // "creationDate": " "
  };

  updatedData:any = {...this.userData};


  ngOnInit(): void {
    this._ProfileService.getCurrentUserData().subscribe({
      next:(data)=>{
        this.userData = data;
        this.updatedData = { ...this.userData };

        this.selectedMonth = new Date(this.userData.dateOfBirth).toLocaleString('en', { month: 'long' });
        this.selectedDay = new Date(this.userData.dateOfBirth).getDate();
        this.selectedYear = new Date(this.userData.dateOfBirth).getFullYear();
        
        
        if (!this.userData.profileImageURL) {
          this.profileImg;
        }else{
          this.profileImg = this.userData.profileImageURL;
        }

        console.log("userData>>",data);

      },
      error: (err) => {
        console.error('Error fetching user data:', err);
      },

    });
  }

  updateCurrentData(): void {
    console.log("Request Data:", this.updatedData);

    this.usernameError = false;
    
    // if (!this.userData.profileImageURL) {
    //   this.profileImg;
    // }else{
    //   this.updatedData.filePath = this.userData.profileImageURL;
    // }

    this.updatedData.dateOfBirth = `${this.selectedYear}-${this.months.indexOf(this.selectedMonth) + 1}-${this.selectedDay}`;


    this._ProfileService.updateCurrentData(this.updatedData).subscribe({
      next:()=>{
        this.userData = {...this.updatedData};
        this.showEditSection = true;

        if (this.updatedData.userName !== this.userData.userName) {
          localStorage.setItem('userName', this.updatedData.userName);
        }

        Swal.fire({
          title: 'Success!',
          text: 'Your profile has been updated successfully.',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: 'var(--secondary-color)',
        });
      },
      error:(err)=>{
        this.showEditSection = true;

        if (err.error && typeof err.error === 'string' && err.error.includes('Username already exists')) {
          this.usernameError = true;
          document.getElementById('username')?.focus(); 
        }

        let errorMessage = 'There was an issue updating your profile. Please try again later.';
        
        Swal.fire({
          title: 'Error!',
          text: this.usernameError? 'The username is already in use. Please choose another one.' : errorMessage,
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#d33',
        });

        console.error('Error updating profile:', err);
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
        this.profileImg = `https://localhost:7051/${response.filePath}`;
        console.log(response);
      },
      error:(err)=>{
        console.error('Upload Error:', err);
      }
    });
  }
  



  // editBoxContainer

  showEditSection: boolean = true; 
  toggleEditBox(): void {
    this.showEditSection = !this.showEditSection; 
  }



}