import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyAcccountComponent } from './verify-acccount.component';

describe('VerifyAcccountComponent', () => {
  let component: VerifyAcccountComponent;
  let fixture: ComponentFixture<VerifyAcccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VerifyAcccountComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerifyAcccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
