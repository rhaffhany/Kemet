import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelAgencyProfileComponent } from './travel-agency-profile.component';

describe('TravelAgencyProfileComponent', () => {
  let component: TravelAgencyProfileComponent;
  let fixture: ComponentFixture<TravelAgencyProfileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TravelAgencyProfileComponent]
    });
    fixture = TestBed.createComponent(TravelAgencyProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
