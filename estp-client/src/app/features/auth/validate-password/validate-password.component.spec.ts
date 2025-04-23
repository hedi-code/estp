import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidatePasswordComponent } from './validate-password.component';

describe('ValidatePasswordComponent', () => {
  let component: ValidatePasswordComponent;
  let fixture: ComponentFixture<ValidatePasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ValidatePasswordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValidatePasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
