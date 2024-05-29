import { TestBed } from '@angular/core/testing';

import { EscalaService } from './escala.service';

describe('EscalaService', () => {
  let service: EscalaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EscalaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
