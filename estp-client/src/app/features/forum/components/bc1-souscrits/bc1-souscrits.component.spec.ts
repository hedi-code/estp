import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Bc1SouscritsComponent } from './bc1-souscrits.component';

describe('Bc1SouscritsComponent', () => {
  let component: Bc1SouscritsComponent;
  let fixture: ComponentFixture<Bc1SouscritsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Bc1SouscritsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Bc1SouscritsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
