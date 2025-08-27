import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionBc2Component } from './gestion-bc2.component';

describe('GestionBc2Component', () => {
  let component: GestionBc2Component;
  let fixture: ComponentFixture<GestionBc2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GestionBc2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionBc2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
