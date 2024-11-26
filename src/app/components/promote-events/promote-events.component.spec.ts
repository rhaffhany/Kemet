import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromoteEventsComponent } from './promote-events.component';

describe('PromoteEventsComponent', () => {
  let component: PromoteEventsComponent;
  let fixture: ComponentFixture<PromoteEventsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PromoteEventsComponent]
    });
    fixture = TestBed.createComponent(PromoteEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
