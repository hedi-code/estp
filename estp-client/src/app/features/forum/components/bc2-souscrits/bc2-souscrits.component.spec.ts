import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Bc2SouscritsComponent } from './bc2-souscrits.component';

describe('Bc2SouscritsComponent', () => {
  let component: Bc2SouscritsComponent;
  let fixture: ComponentFixture<Bc2SouscritsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Bc2SouscritsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Bc2SouscritsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
