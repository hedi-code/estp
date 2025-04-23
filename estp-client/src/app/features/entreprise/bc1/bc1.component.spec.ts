import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Bc1Component } from './bc1.component';

describe('Bc1Component', () => {
  let component: Bc1Component;
  let fixture: ComponentFixture<Bc1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Bc1Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Bc1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
