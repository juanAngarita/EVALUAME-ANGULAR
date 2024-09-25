import { TestBed } from '@angular/core/testing';

import { NormalizeService } from './normalize.service';

describe('NormalizeService', () => {
  let service: NormalizeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NormalizeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
