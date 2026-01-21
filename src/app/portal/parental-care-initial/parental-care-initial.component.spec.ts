import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParentalCareInitialComponent } from './parental-care-initial.component';

describe('ParentalCareInitialComponent', () => {
  let component: ParentalCareInitialComponent;
  let fixture: ComponentFixture<ParentalCareInitialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParentalCareInitialComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParentalCareInitialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
