import { TestBed } from '@angular/core/testing';

import { ReviewState } from './review-state';

describe('ReviewState', () => {
  let service: ReviewState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReviewState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
