import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppLayoutComponent } from './layouts/app-layout/app-layout.component';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { ProfileComponent } from './components/profile/profile.component';
import { FooterComponent } from './components/footer/footer.component';
import { ThingsToDoComponent } from './components/things-to-do/things-to-do.component';
import { AdventureModeComponent } from './components/adventure-mode/adventure-mode.component';
import { PlanComponent } from './components/plan/plan.component';
import { WishlistComponent } from './components/wishlist/wishlist.component';
import { CommunityComponent } from './components/community/community.component';
import { NotfoundComponent } from './components/notfound/notfound.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { RegisterComponent } from './components/register/register.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { PlaceAdditionalContentComponent } from './components/place-additional-content/place-additional-content.component';

const routes: Routes = [
  {
    path: '', component: AuthLayoutComponent,children:[
      { path: '', redirectTo: '/home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent, title:'Home'},

      { path: 'login', component: LoginComponent, title:'Login' },
      { path: 'register', component: RegisterComponent, title:'Register'},
    ]
  },

  {  path: '', component: MainLayoutComponent,  children:[
    // { path: '', redirectTo: '/home', pathMatch: 'full' },
    // { path: 'home', component: HomeComponent, title:'Home'},
    { path: 'thingstodo', component: ThingsToDoComponent, title:'Things To Do'},
  ]},
  
  {path: '', component: AppLayoutComponent, children: [
    { path:'profile', component: ProfileComponent, title:'Profile'},
    { path:'places', component: PlaceAdditionalContentComponent, title:'Places'},
    { path: 'adventureMode', component: AdventureModeComponent, title:'Adventure Mode'},
    { path: 'plan', component: PlanComponent, title:'Plan'},
    { path: 'wishlist', component: WishlistComponent, title:'WhishList'},
    { path: 'community', component: CommunityComponent, title:'Community'},
]},


  {  path: '', component: AppLayoutComponent, children: [
      { path:'profile', component: ProfileComponent, title:'Profile'},
      { path:'places', component: PlaceAdditionalContentComponent, title:'Places'},
      { path: 'adventureMode', component: AdventureModeComponent, title:'Adventure Mode'},
      { path: 'plan', component: PlanComponent, title:'Plan'},
      { path: 'wishlist', component: WishlistComponent, title:'WhishList'},
      { path: 'community', component: CommunityComponent, title:'Community'},
  ]},


  { path: '**' , component: NotfoundComponent , title:"Not Found 404!" }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
