import { TestBed } from '@angular/core/testing';

import { KeypointsService } from './keypoints.service';

describe('KeypointsService', () => {
  let service: KeypointsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KeypointsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
