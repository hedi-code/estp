import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Bc2Component } from './bc2.component';

describe('Bc2Component', () => {
  let component: Bc2Component;
  let fixture: ComponentFixture<Bc2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Bc2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Bc2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
