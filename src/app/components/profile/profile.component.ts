import { Component, ElementRef, NgZone } from '@angular/core';
import { ProfileService } from 'src/app/services/profile.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})


export class ProfileComponent {

  constructor(private _ProfileService:ProfileService, private ngZone: NgZone, private eRef:ElementRef){}

  // assets
  layoutPic:string = "/assets/img/sunset-5314319_640.png";
  postImg:string = "/assets/img/Credits20Al20-The20Newspaper 1.png"

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
  cameraIcon:string ="/assets/icons/Camera.png";
  editIcon:string = "/assets/icons/Edit Square.png";



  //Api
  months: string[] = [...Array(12).keys()].map(i => new Date(0, i).toLocaleString('en', { month: 'long' }));
  days: number[] = Array.from({ length: 31 }, (_, i) => i + 1); 
  years: number[] = Array.from({ length: 101 }, (_, i) => new Date().getFullYear() - i); 

  selectedMonth: string = '';
  selectedDay: number = 0;
  selectedYear: number = 0;

  usernameError: boolean = false;
  isUsernameEditable: boolean = false;

  isEdited = false;
  isLoading = false;


  onEdit(): void {
    this.isEdited = true;
  }  
    
  userData:any = {
      "$id": "",
      "userName": "",
      "firstName": "",
      "lastName": "",
      "dateOfBirth": "",
      "ssn": "",
      "gender": "",
      "nationality": "",
      "profileImageURL": "",
      "backgroundImageURL": "",
      "interestCategoryIds": {
          "$id": "",
          "$values": [  ]
      },
      "bio": "",
      "country": "",
      "city": "",
      "websiteLink": "",
      "creationDate": ""
  };
  updatedData:any = {...this.userData};


  ngOnInit(): void {
    this._ProfileService.getCurrentUserData().subscribe({
      next:(data)=>{
        this.userData = data;
        this.updatedData = { ...this.userData };

        const dob = new Date(this.userData.dateOfBirth);
        this.selectedMonth = this.months[dob.getMonth()];  
        this.selectedDay = dob.getDate();                  
        this.selectedYear = dob.getFullYear(); 
        
        this.onMonthChange();
        this.onYearChange();
    
        if (!this.userData.profileImageURL) {
          this.profileImg;
        }else{
          this.profileImg = this.userData.profileImageURL;
        }

        // if (!this.updatedData.userName) {
        //   this.updatedData.userName = this.userData.userName;
        // }

        // console.log("userData>>",data);

      },
      error: (err) => {
        console.error('Error fetching user data:', err);
      },
    });

    if (this.updatedData.country) {
      this.onCountryChange();
    }

  }

  updateCurrentData(): void {

    if (!this.isEdited) return;
    this.isLoading = true;

    // Ensure dateOfBirth is correctly formatted
    if (this.selectedMonth && this.selectedDay && this.selectedYear) {
      const monthIndex = this.months.indexOf(this.selectedMonth) + 1; 
      const day = this.selectedDay;
      const year = this.selectedYear;
      this.updatedData.dateOfBirth = `${year}-${monthIndex.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    }

    // Ensure interestCategoryIds is an array
    if (this.updatedData.interestCategoryIds?.$values) {
      this.updatedData.interestCategoryIds = [...this.updatedData.interestCategoryIds.$values];
    }

    if (this.updatedData.websiteLink && !this.updatedData.websiteLink.startsWith('http')) {
      this.updatedData.websiteLink = `https://${this.updatedData.websiteLink}`;
    }

    if (!this.isUsernameEditable) {
      delete this.updatedData.userName;
    }

    // Remove extra properties
    delete this.updatedData.$id;

    // API
    this._ProfileService.updateCurrentData(this.updatedData).subscribe({
      next: (response) => {

        if (this.updatedData.userName) {
          localStorage.setItem('userName', this.updatedData.userName);
        }

        console.log("update data:", this.updatedData);
        

        this.userData = {...this.updatedData};
        this.updatedData = response;
        this.showEditSection = true;
        this.isEdited = false;
        
        Swal.fire({
          title: 'Success!',
          text: 'Your profile has been updated successfully.',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: 'var(--secondary-color)',
        });

        this.ngZone.runOutsideAngular(() => {
          setTimeout(() => {
            location.reload();
          }, 1500); 
        });
        
      },
      error: (err) => {
        console.error('Error in updating profile:', err);

        this.showEditSection = true;
        this.isUsernameEditable = false;

        if (err.status === 400 && err.error.includes('Username already exists')) {
          Swal.fire({
            title: 'Error!',
            text: 'The username is already taken. Please choose another.',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#d33',
          });
        } else {
          Swal.fire({
            title: 'Error!',
            text: 'There was an issue updating your profile. Please try again later.',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#d33',
          });
        }
      },
      complete: () =>{
        this.isLoading = false;
      }
      
    });
  }

  get displayWebsiteLink(): string {
    return this.updatedData.websiteLink?.replace(/^https?:\/\//, '') || '';
  }
  
  onMonthChange() {
    // Update the days based on the selected month
    const monthIndex = this.months.indexOf(this.selectedMonth);
    const daysInMonth = new Date(this.selectedYear, monthIndex + 1, 0).getDate();
    this.days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    if (this.selectedDay > daysInMonth) {
      this.selectedDay = daysInMonth; // Ensure the selected day is valid
    }
  }

  onYearChange() {
    // Optionally, adjust the available days based on the selected year (e.g., leap year handling)
    if (this.selectedMonth === 'February') {
      const isLeapYear = new Date(this.selectedYear, 1, 29).getMonth() === 1;
      if (!isLeapYear && this.selectedDay === 29) {
        this.selectedDay = 28; // Adjust day for non-leap year
      }
    }
  }

  countryCities: { [key: string]: string[] } = {
    "Egypt": ["Cairo", "Alexandria", "Borsaid", "Giza", "Luxor", "Aswan", "Mansoura", "Tanta", "Ismailia"],
    "USA": ["New York", "Los Angeles", "Chicago", "Houston", "Miami"],
    "UK": ["London", "Manchester", "Birmingham", "Liverpool"],
    "France": ["Paris", "Marseille", "Lyon", "Toulouse"]
  };

  get countryList(): string[] {
    return Object.keys(this.countryCities);
  }
  

  filteredCities: string[] = [];

  onCountryChange() {
    this.filteredCities = this.countryCities[this.updatedData.country] || [];
    this.updatedData.city = "";
    this.isEdited = true;
  }

  uploadProfileImg(event:any):void{
    const file = event.target.files[0];
    if (!file) {
      console.error('No file selected!');
      return;
    }
    const formData:FormData = new FormData();
    formData.append('model',file);

    this._ProfileService.uploadProfileImg(formData).subscribe({
      next:(response)=>{
        this.profileImg = `https://localhost:7051/${response.filePath}`;
        this.isEdited = true;
        Swal.fire({
          title: 'Success!',
          text: 'Your profile photo has been updated successfully.',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: 'var(--secondary-color)',
        });
      },
      error:(err)=>{
        console.error('Upload Error:', err);
      }
    });
  }

  uploadBackgroundImg(event: any): void {
    const file = event.target.files[0];

    if (!file) {
      console.error('No file selected!');
      return;
    }
    const _FormData: FormData = new FormData();
    _FormData.append('model', file);
  
    this._ProfileService.uploadBackgroundImg(_FormData).subscribe({
      next: (response) => {
        this.backgroundEdit = `https://localhost:7051/${response.filePath}`;
        console.log(response);
      },
      error: (err) => {
        console.error('Upload Error:', err);
      }
    });
  }
  
  removeBackground():void{
    // this.backgroundEdit = '/assets/img/sunset-update.png';
    // this.layoutPic= "/assets/img/sunset-5314319_640.png";
    this.updatedData.filePath = this.backgroundEdit || this.layoutPic;

  }

  toggleUsernameEdit(): void {
    this.isUsernameEditable = !this.isUsernameEditable; 
  }

  // editBoxContainer
  showEditSection: boolean = true; 
  toggleEditBox(): void {
    this.showEditSection = !this.showEditSection; 
  }




}