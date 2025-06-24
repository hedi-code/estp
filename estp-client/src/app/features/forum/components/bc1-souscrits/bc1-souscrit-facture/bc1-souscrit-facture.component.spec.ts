import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Bc1SouscritFactureComponent } from './bc1-souscrit-facture.component';

describe('Bc1SouscritFactureComponent', () => {
  let component: Bc1SouscritFactureComponent;
  let fixture: ComponentFixture<Bc1SouscritFactureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Bc1SouscritFactureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Bc1SouscritFactureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
