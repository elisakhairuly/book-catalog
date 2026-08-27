import { TestBed } from '@angular/core/testing';

import { HomeSearch } from './home-search';

describe('HomeSearch', () => {
  let service: HomeSearch;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HomeSearch);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
