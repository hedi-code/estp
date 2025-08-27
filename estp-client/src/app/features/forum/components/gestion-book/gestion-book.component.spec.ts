import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionBookComponent } from './gestion-book.component';

describe('GestionBookComponent', () => {
  let component: GestionBookComponent;
  let fixture: ComponentFixture<GestionBookComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GestionBookComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionBookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
