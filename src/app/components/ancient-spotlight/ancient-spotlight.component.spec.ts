import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AncientSpotlightComponent } from './ancient-spotlight.component';

describe('AncientSpotlightComponent', () => {
  let component: AncientSpotlightComponent;
  let fixture: ComponentFixture<AncientSpotlightComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AncientSpotlightComponent]
    });
    fixture = TestBed.createComponent(AncientSpotlightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
