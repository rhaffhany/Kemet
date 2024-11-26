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

const routes: Routes = [
  
  {
    path: '', component: AuthLayoutComponent,children:[
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'login', component: LoginComponent },
      { path: 'home', component: HomeComponent},
    ]
  },

  {  path: '', component: AppLayoutComponent, 
    children: [
      { path:'profile', component: ProfileComponent, title:'Profile'},
      { path:'footer', component: FooterComponent, title:'footer'},
      { path: 'thingstodo', component: ThingsToDoComponent},
      { path: 'adventureMode', component: AdventureModeComponent},
      { path: 'plan', component: PlanComponent},
      { path: 'wishlist', component: WishlistComponent},
      { path: 'community', component: CommunityComponent},
  
    ]},
   
    { path: '**' , component: NotfoundComponent , title:"Not Found 404!" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
