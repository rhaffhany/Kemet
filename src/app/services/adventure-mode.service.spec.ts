import { TestBed } from '@angular/core/testing';

import { AdventureModeService } from './adventure-mode.service';

describe('AdventureModeService', () => {
  let service: AdventureModeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdventureModeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
