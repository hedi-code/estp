import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntrepriseSouscritesComponent } from './entreprise-souscrites.component';

describe('EntrepriseSouscritesComponent', () => {
  let component: EntrepriseSouscritesComponent;
  let fixture: ComponentFixture<EntrepriseSouscritesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EntrepriseSouscritesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntrepriseSouscritesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
