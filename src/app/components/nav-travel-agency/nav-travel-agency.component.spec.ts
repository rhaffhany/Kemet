import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavTravelAgencyComponent } from './nav-travel-agency.component';

describe('NavTravelAgencyComponent', () => {
  let component: NavTravelAgencyComponent;
  let fixture: ComponentFixture<NavTravelAgencyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NavTravelAgencyComponent]
    });
    fixture = TestBed.createComponent(NavTravelAgencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
