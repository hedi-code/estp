import { TestBed } from '@angular/core/testing';

import { Pack1Service } from './pack1.service';

describe('Pack1Service', () => {
  let service: Pack1Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Pack1Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
