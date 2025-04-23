import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VotreEntrepriseComponent } from './votre-entreprise.component';

describe('VotreEntrepriseComponent', () => {
  let component: VotreEntrepriseComponent;
  let fixture: ComponentFixture<VotreEntrepriseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VotreEntrepriseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VotreEntrepriseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
