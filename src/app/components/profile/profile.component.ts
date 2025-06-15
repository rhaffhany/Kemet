import { Component, ElementRef, NgZone } from '@angular/core';
import { ProfileService } from 'src/app/services/profile.service';
import Swal from 'sweetalert2';
import { InterestsService, Interest } from '../../services/interests.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})


export class ProfileComponent {

  constructor(private _ProfileService:ProfileService, private ngZone: NgZone, private eRef:ElementRef, private interestsService: InterestsService){}

  // assets
  defaultLayoutPic:string = "/assets/img/sunset-5314319_640.png";
  defaultBackgroundEdit:string = "/assets/img/sunset-update.png";
  postImg:string = "/assets/img/Credits20Al20-The20Newspaper 1.png"

  profileImg: string = 'assets/img/default-profile.png';
  layoutPic:string = "/assets/img/sunset-5314319_640.png";
  backgroundEdit:string = "/assets/img/sunset-update.png";
  
  // Temporary storage for uploaded images before saving
  tempBackgroundUrl: string = '';
  tempProfileUrl: string = '';

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
  profileImgLoading = false;

  isEdited = false;
  isLoading = false;

  // Travel Interests properties
  isEditingInterests = false;
  userInterests: Interest[] = [];
  editableInterests: string[] = [];
  originalInterests: string[] = [];

  // Interests properties
  isLoadingInterests = false;
  interestsError: string | null = null;
  showInterestsForm = false;

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
    
        // Set profile image - use uploaded image or default
        if (this.userData.profileImageURL) {
          this.profileImg = this.userData.profileImageURL;
        } else {
          this.profileImg = 'assets/img/default-profile.png';
        }

        // Set background images - use uploaded image or default
        if (this.userData.backgroundImageURL) {
          this.layoutPic = this.userData.backgroundImageURL;
          this.backgroundEdit = this.userData.backgroundImageURL;
        } else {
          this.layoutPic = this.defaultLayoutPic;
          this.backgroundEdit = this.defaultBackgroundEdit;
        }

        console.log("userData loaded:", data);
        console.log("Background URL:", this.userData.backgroundImageURL);
        console.log("Using layoutPic:", this.layoutPic);
        console.log("Bio data:", this.userData.bio);
        console.log("Updated bio data:", this.updatedData.bio);

      },
      error: (err) => {
        console.error('Error fetching user data:', err);
        // Set defaults on error
        this.layoutPic = this.defaultLayoutPic;
        this.backgroundEdit = this.defaultBackgroundEdit;
        this.profileImg = 'assets/img/default-profile.png';
      },
    });

    if (this.updatedData.country) {
      this.onCountryChange();
    }

    this.loadUserInterests();

    // Subscribe to interests refresh events
    this.interestsService.refreshInterests$.subscribe(() => {
      this.loadUserInterests();
    });
  }

  updateCurrentData(): void {

    if (!this.isEdited) return;
    this.isLoading = true;

    // Apply temporary background image if uploaded
    if (this.tempBackgroundUrl) {
      this.updatedData.backgroundImageURL = this.tempBackgroundUrl;
    }

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
        
        // Apply temporary background image to main profile
        if (this.tempBackgroundUrl) {
          this.layoutPic = this.tempBackgroundUrl;
          this.tempBackgroundUrl = ''; // Clear temporary storage
        }

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

    this.profileImgLoading = true;

    const formData:FormData = new FormData();
    formData.append('model',file);

    this._ProfileService.uploadProfileImg(formData).subscribe({
      next:(response)=>{
        this.profileImg = `http://kemet-server.runasp.net/${response.filePath}`;
        this.isEdited = true;
        setTimeout(() => {
          this.profileImg = URL.createObjectURL(file);
          this.profileImgLoading = false; 
        }, 2000);
        Swal.fire({
          title: 'Success!',
          text: 'Your profile photo has been updated successfully.',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: 'var(--secondaryColor)',
        });
      },
      error:(err)=>{
        this.profileImgLoading = false; 
      }
    });
  }

  uploadBackgroundImg(event: any): void {
    const file = event.target.files[0];

    if (!file) {
      console.error('No file selected!');
      return;
    }
    
    // Show immediate preview in edit modal only
    const localImageUrl = URL.createObjectURL(file);
    this.backgroundEdit = localImageUrl;
    
    const _FormData: FormData = new FormData();
    _FormData.append('model', file);
  
    this._ProfileService.uploadBackgroundImg(_FormData).subscribe({
      next: (response) => {
        // Store server URL temporarily, don't update main background yet
        const serverImageUrl = `http://kemet-server.runasp.net/${response.filePath}`;
        this.tempBackgroundUrl = serverImageUrl;
        this.backgroundEdit = serverImageUrl;
        
        // Clean up the local URL
        URL.revokeObjectURL(localImageUrl);
        
        // Mark as edited to enable save button
        this.onEdit();
        
        console.log('Background image uploaded successfully:', response);
        console.log('Temporary background URL:', serverImageUrl);
        
        Swal.fire({
          title: 'Image Uploaded!',
          text: 'Your cover photo will be updated when you save your profile.',
          icon: 'info',
          confirmButtonText: 'OK',
          confirmButtonColor: 'var(--secondary-color)',
        });
      },
      error: (err) => {
        // Revert to current background in edit modal
        if (this.userData.backgroundImageURL) {
          this.backgroundEdit = this.userData.backgroundImageURL;
        } else {
          this.backgroundEdit = this.defaultBackgroundEdit;
        }
        URL.revokeObjectURL(localImageUrl);
        
        console.error('Upload Error:', err);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to upload cover photo. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#d33',
        });
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
    
    // If closing edit mode, revert any temporary changes
    if (this.showEditSection) {
      this.revertTemporaryChanges();
    }
  }

  revertTemporaryChanges(): void {
    // Revert background image to current saved version
    if (this.tempBackgroundUrl) {
      if (this.userData.backgroundImageURL) {
        this.backgroundEdit = this.userData.backgroundImageURL;
      } else {
        this.backgroundEdit = this.defaultBackgroundEdit;
      }
      this.tempBackgroundUrl = ''; // Clear temporary storage
    }
  }

  editInterests() {
    this.interestsService.showInterestsForm();
  }

  toggleEditInterests(): void {
    this.isEditingInterests = true;
    this.originalInterests = [...this.userInterests.map(interest => interest.name)];
    this.editableInterests = [...this.userInterests.map(interest => interest.name)];
  }

  saveInterests(): void {
    // Filter out empty interests
    this.editableInterests = this.editableInterests.filter(interest => interest.trim() !== '');
    
    if (this.editableInterests.length === 0) {
      Swal.fire({
        title: 'Error!',
        text: 'Please add at least one interest.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#d33',
      });
      return;
    }

    // Map interest names to their IDs
    const allInterests = this.interestsService.getAllInterests();
    const selectedIds = this.editableInterests
      .map(name => allInterests.find(interest => interest.name === name)?.id)
      .filter((id): id is number => id !== undefined);

    // Save to backend
    this.isLoadingInterests = true;
    this.interestsService.setSelectedInterests(selectedIds).subscribe({
      next: () => {
        // Update local state
        this.userInterests = this.editableInterests
          .map(name => allInterests.find(interest => interest.name === name))
          .filter((interest): interest is Interest => interest !== undefined);
        
        this.isEditingInterests = false;
        this.isLoadingInterests = false;
        this.onEdit(); // Mark as edited for profile update

        Swal.fire({
          title: 'Success!',
          text: 'Your travel interests have been updated.',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: 'var(--secondary-color)',
        }).then(() => {
          // Reload interests to ensure we have the latest data
          this.loadUserInterests();
        });
      },
      error: (error) => {
        console.error('Error updating interests:', error);
        this.isLoadingInterests = false;
        
        if (error.message === 'Your session has expired. Please log in again.') {
          Swal.fire({
            title: 'Session Expired',
            text: 'Your session has expired. Please log in again.',
            icon: 'error',
            confirmButtonText: 'Go to Login',
            confirmButtonColor: '#d33',
          }).then(() => {
            window.location.href = '/login';
          });
        } else {
          Swal.fire({
            title: 'Error!',
            text: 'Failed to update your interests. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#d33',
          });
        }
      }
    });
  }

  cancelEditInterests(): void {
    this.isEditingInterests = false;
    this.editableInterests = [];
    this.userInterests = [...this.originalInterests.map(name => this.interestsService.getAllInterests().find(interest => interest.name === name) as Interest)];
  }

  addNewInterest(): void {
    if (this.editableInterests.length < 10) {
      this.editableInterests.push('');
    }
  }

  removeInterest(index: number): void {
    if (this.editableInterests.length > 1) {
      this.editableInterests.splice(index, 1);
    }
  }

  onInterestEdit(): void {
    // Mark as edited when interests are modified
    this.onEdit();
  }

  getInterestIcon(interestName: string): string {
    // Updated icon mapping based on the actual category names
    const iconMap: { [key: string]: string } = {
      'Historical': 'fas fa-landmark',
      'Resorts and Beaches': 'fas fa-umbrella-beach',
      'Nature Spots': 'fas fa-tree',
      'Museums': 'fas fa-museum',
      'Religious': 'fas fa-place-of-worship',
      'Nile River Destinations': 'fas fa-water',
      'Desert Landscape': 'fas fa-mountain',
      'Entertainment': 'fas fa-theater-masks',
      'Diving Snorkeling': 'fas fa-swimming-pool',
      'Hiking': 'fas fa-hiking',
      'Water Sports and Nile Activities': 'fas fa-ship',
      'Cultural Experience': 'fas fa-users',
      'Adventure Activity': 'fas fa-compass',
      'Relaxation and Wellness': 'fas fa-spa',
      'Safari': 'fas fa-paw',
      'Fancy Cafe': 'fas fa-coffee',
      'Fancy Restaurant': 'fas fa-utensils',
      'Hidden Gems': 'fas fa-gem'
    };
    
    return iconMap[interestName] || 'fas fa-heart';
  }

  getCompletionPercentage(): number {
    const maxInterests = 10;
    const percentage = Math.round((this.userInterests.length / maxInterests) * 100);
    return Math.min(percentage, 100);
  }

  loadUserInterests() {
    this.isLoadingInterests = true;
    this.interestsError = null;

    this.interestsService.getUserInterests().subscribe({
      next: (response: { $values: number[] }) => {
        console.log('Raw API response:', response);
        
        // Extract the interest IDs from the response
        const interestIds = response.$values || [];
        console.log('Interest IDs from API:', interestIds);
        
        // Get all available interests for mapping
        const allInterests = this.interestsService.getAllInterests();
        
        // Map IDs to full interest objects
        this.userInterests = interestIds
          .map((id: number) => {
            const interest = allInterests.find(item => item.id === id);
            if (!interest) {
              console.warn(`No matching interest found for ID: ${id}`);
            }
            return interest;
          })
          .filter((interest: Interest | undefined): interest is Interest => interest !== undefined);
        
        console.log('Mapped user interests:', this.userInterests);
        this.isLoadingInterests = false;
      },
      error: (error) => {
        console.error('Error loading interests:', error);
        
        if (error.message === 'Your session has expired. Please log in again.') {
          // Handle expired session
          this.interestsError = 'Your session has expired. Please log in again.';
          // Redirect to login page
          window.location.href = '/login';
        } else {
          this.interestsError = 'Failed to load interests. Please try again.';
        }
        
        this.isLoadingInterests = false;
      }
    });
  }

  getPlaces(): Interest[] {
    return this.userInterests.filter(interest => interest.type === 'Place');
  }

  getActivities(): Interest[] {
    return this.userInterests.filter(interest => interest.type === 'Activity');
  }

}