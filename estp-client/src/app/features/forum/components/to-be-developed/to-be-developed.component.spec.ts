import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToBeDevelopedComponent } from './to-be-developed.component';

describe('ToBeDevelopedComponent', () => {
  let component: ToBeDevelopedComponent;
  let fixture: ComponentFixture<ToBeDevelopedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ToBeDevelopedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToBeDevelopedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
