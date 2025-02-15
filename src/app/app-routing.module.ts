import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppLayoutComponent } from './layouts/app-layout/app-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { HomeComponent } from './components/home/home.component';
import { ThingsToDoComponent } from './components/things-to-do/things-to-do.component';
import { PlaceDetailsComponent } from './components/place-details/place-details.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AdventureModeComponent } from './components/adventure-mode/adventure-mode.component';
import { PlanComponent } from './components/plan/plan.component';
import { WishlistComponent } from './components/wishlist/wishlist.component';
import { CommunityComponent } from './components/community/community.component';
import { NotfoundComponent } from './components/notfound/notfound.component';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'home', component: HomeComponent, title: 'Home' },
      { path: '', redirectTo: '/home', pathMatch: 'full' },
    ]
  },
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent, title: 'Login' },
      { path: 'register', component: RegisterComponent, title: 'Register' },
      { 
        path: 'places/:placeID', 
        component: PlaceDetailsComponent, 
        title: 'Places', 
        canActivate: [AuthGuard] 
      },
    ]
  },
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [AuthGuard], // Only logged-in users can access
    children: [
      { path: 'profile', component: ProfileComponent, title: 'Profile' },
      { path: 'thingstodo', component: ThingsToDoComponent, title: 'Things To Do' },

      { path: 'adventureMode', component: AdventureModeComponent, title: 'Adventure Mode' },
      { path: 'plan', component: PlanComponent, title: 'Plan' },
      { path: 'wishlist', component: WishlistComponent, title: 'WishList' },
      { path: 'community', component: CommunityComponent, title: 'Community' },
      { 
        path: 'app-places/:placeID', 
        component: PlaceDetailsComponent, 
        title: 'Places' 
      },
    ]
  },
  { path: '**', component: NotfoundComponent, title: 'Not Found 404!' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: "top" })],
  exports: [RouterModule],
})
export class AppRoutingModule { }
