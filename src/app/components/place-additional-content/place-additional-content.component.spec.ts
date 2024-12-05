import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaceAdditionalContentComponent } from './place-additional-content.component';

describe('PlaceAdditionalContentComponent', () => {
  let component: PlaceAdditionalContentComponent;
  let fixture: ComponentFixture<PlaceAdditionalContentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PlaceAdditionalContentComponent]
    });
    fixture = TestBed.createComponent(PlaceAdditionalContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
