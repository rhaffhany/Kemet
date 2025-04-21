import { TestBed } from '@angular/core/testing';

import { LanguageAssistantService } from './language-assistant.service';

describe('LanguageAssistantService', () => {
  let service: LanguageAssistantService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LanguageAssistantService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
