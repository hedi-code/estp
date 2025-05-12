import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FactureBc1Component } from './facture-bc1.component';

describe('FactureBc1Component', () => {
  let component: FactureBc1Component;
  let fixture: ComponentFixture<FactureBc1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FactureBc1Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FactureBc1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
