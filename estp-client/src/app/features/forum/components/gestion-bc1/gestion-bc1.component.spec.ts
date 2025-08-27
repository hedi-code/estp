import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionBc1Component } from './gestion-bc1.component';

describe('GestionBc1Component', () => {
  let component: GestionBc1Component;
  let fixture: ComponentFixture<GestionBc1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GestionBc1Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionBc1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
