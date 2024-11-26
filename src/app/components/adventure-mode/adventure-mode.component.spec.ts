import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdventureModeComponent } from './adventure-mode.component';

describe('AdventureModeComponent', () => {
  let component: AdventureModeComponent;
  let fixture: ComponentFixture<AdventureModeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdventureModeComponent]
    });
    fixture = TestBed.createComponent(AdventureModeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
