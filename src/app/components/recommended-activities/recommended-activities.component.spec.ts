import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecommendedActivitiesComponent } from './recommended-activities.component';

describe('RecommendedActivitiesComponent', () => {
  let component: RecommendedActivitiesComponent;
  let fixture: ComponentFixture<RecommendedActivitiesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RecommendedActivitiesComponent]
    });
    fixture = TestBed.createComponent(RecommendedActivitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
