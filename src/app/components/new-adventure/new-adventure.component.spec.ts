import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewAdventureComponent } from './new-adventure.component';

describe('NewAdventureComponent', () => {
  let component: NewAdventureComponent;
  let fixture: ComponentFixture<NewAdventureComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NewAdventureComponent]
    });
    fixture = TestBed.createComponent(NewAdventureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
