import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppLayoutComponent } from './layouts/app-layout/app-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthGuard } from './auth.guard';

// components
import { HomeComponent } from './components/home/home.component';
import { ThingsToDoComponent } from './components/things-to-do/things-to-do.component';
import { PlaceDetailsComponent } from './components/place-details/place-details.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AdventureModeComponent } from './components/adventure-mode/adventure-mode.component';
import { PlanComponent } from './components/plan/plan.component';
import { WishlistComponent } from './components/wishlist/wishlist.component';
import { NotfoundComponent } from './components/notfound/notfound.component';
import { ReviewComponent } from './components/review/review.component';
import { ReviewContentComponent } from './components/review-content/review-content.component';
import { ActivityDetailsComponent } from './components/activity-details/activity-details.component';
import { AgencyLayoutComponent } from './layouts/agency-layout/agency-layout.component';

import { TravelAgencyProfileComponent } from './components/travel-agency-profile/travel-agency-profile.component';
import { PackageDetailsBookingComponent } from './components/package-details-booking/package-details-booking.component';

import { PersonalizedPlanComponent } from './components/personalized-plan/personalized-plan.component';
import { PaymentHistoryComponent } from './components/payment-history/payment-history.component';
import { SearchResultsComponent } from './components/search-results/search-results.component';

import { PaymentComponent } from './components/payment/payment.component';

const routes: Routes = [

  { 
    path: '',component: MainLayoutComponent, children: [
      { path: 'home', component: HomeComponent, title: 'Home' },
      { path: '', redirectTo: '/home', pathMatch: 'full' },
    ]
  },

  {
    path: '',component: AuthLayoutComponent, children: [
      { path: 'login', component: LoginComponent, title: 'Login' },
      { path: 'register', component: RegisterComponent, title: 'Register' },
      { path: 'places/:placeID', component: PlaceDetailsComponent, title: 'Places', canActivate: [AuthGuard] },
      { path: 'activities/:activityID', component: ActivityDetailsComponent, title: 'Activities', canActivate: [AuthGuard] },

    ]
  },

  // Only logged-in users can access
  {
    path: '',component: AppLayoutComponent, canActivate: [AuthGuard], children: [
      { path: 'profile', component: ProfileComponent, title: 'Profile' },
      { path: 'thingstodo', component: ThingsToDoComponent, title: 'Things To Do' },
      { path: 'adventureMode', component: AdventureModeComponent, title: 'Adventure Mode' },
      { path: 'plan', component: PlanComponent, title: 'Plan' },
      { path: 'personalized-plan', component: PersonalizedPlanComponent, title: 'personalizedPlan' },
      { path: 'wishlist', component: WishlistComponent, title: 'WishList' },
      { path: 'payment-history', component: PaymentHistoryComponent, title: 'Payment History' },
      { path: 'app-places/:placeID', component: PlaceDetailsComponent, title: 'Places'},
      { path: 'app-activities/:activityID', component: ActivityDetailsComponent, title: 'Activities'},
      { path: 'review', component: ReviewComponent, title: 'Review' },
      { path: 'write-review', component: ReviewContentComponent, title: 'Review Your Booking' },
      { path: 'write-review/place/:placeID', component: ReviewContentComponent, title: 'Review-Place' },
      { path: 'write-review/activity/:activityID', component: ReviewContentComponent, title: 'Review-Activity' },
      { path: 'search-results', component: SearchResultsComponent, title: 'results' },
      
    ]
  },
  {
    path: '',component: AgencyLayoutComponent, canActivate: [AuthGuard], children: [
      { path: 'travelAgency-profile', component: TravelAgencyProfileComponent, title: 'TravelAgency-profile' },
      { path: 'Package-details/:planID', component: PackageDetailsBookingComponent, title: 'Package Details' },
      { path: 'payment/:bookingID/:planID', component: PaymentComponent, title: 'Payment' },
    ]
  },

  { path: '**', component: NotfoundComponent, title: 'Not Found 404!' }
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes , {scrollPositionRestoration: 'top'})],
  exports: [RouterModule],
})
export class AppRoutingModule { }
