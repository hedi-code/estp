import { TestBed } from '@angular/core/testing';

import { Option1Service } from './option1.service';

describe('Option1Service', () => {
  let service: Option1Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Option1Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
