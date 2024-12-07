import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { ThingsToDoComponent } from './components/things-to-do/things-to-do.component';
import { AdventureModeComponent } from './components/adventure-mode/adventure-mode.component';
import { CommunityComponent } from './components/community/community.component';
import { FooterComponent } from './components/footer/footer.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { PlanComponent } from './components/plan/plan.component';
import { WishlistComponent } from './components/wishlist/wishlist.component';
import { SearchComponent } from './components/search/search.component';
import { AncientSpotlightComponent } from './components/ancient-spotlight/ancient-spotlight.component';
import { PromoteEventsComponent } from './components/promote-events/promote-events.component';
import { RecommendedComponent } from './components/recommended/recommended.component';
import { TopSellingComponent } from './components/top-selling/top-selling.component';
import { NewAdventureComponent } from './components/new-adventure/new-adventure.component';
import { NavAppComponent } from './components/nav-app/nav-app.component';
import { NavAuthComponent } from './components/nav-auth/nav-auth.component';
import { NotfoundComponent } from './components/notfound/notfound.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AppLayoutComponent } from './layouts/app-layout/app-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChangePipe } from './pipe/change.pipe';
import { NgOtpInputModule } from 'ng-otp-input';
import { InterestsFormComponent } from './components/interests-form/interests-form.component';
import { NgbCollapseModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NavMainComponent } from './components/nav-main/nav-main.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { FaqComponent } from './components/faq/faq.component';
import { PlaceAdditionalContentComponent } from './components/place-additional-content/place-additional-content.component';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';



@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ThingsToDoComponent,
    AdventureModeComponent,
    CommunityComponent,
    FooterComponent,
    LoginComponent,
    RegisterComponent,
    PlanComponent,
    WishlistComponent,
    SearchComponent,
    AncientSpotlightComponent,
    PromoteEventsComponent,
    RecommendedComponent,
    TopSellingComponent,
    NewAdventureComponent,
    NavAppComponent,
    NavAuthComponent,
    NotfoundComponent,
    ProfileComponent,
    AppLayoutComponent,
    AuthLayoutComponent,
    ChangePipe,
    InterestsFormComponent,
    NavMainComponent,
    MainLayoutComponent,
    FaqComponent,
    PlaceAdditionalContentComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgOtpInputModule,
    NgbModule,
    NgbCollapseModule,
    BrowserModule,
    BrowserAnimationsModule,
    CarouselModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
