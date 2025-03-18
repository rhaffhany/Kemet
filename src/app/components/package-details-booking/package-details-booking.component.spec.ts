import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackageDetailsBookingComponent } from './package-details-booking.component';

describe('PackageDetailsBookingComponent', () => {
  let component: PackageDetailsBookingComponent;
  let fixture: ComponentFixture<PackageDetailsBookingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PackageDetailsBookingComponent]
    });
    fixture = TestBed.createComponent(PackageDetailsBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
