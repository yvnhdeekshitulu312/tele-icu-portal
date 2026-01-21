import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FutureAppointmentsWorklistComponent } from './future-appointments-worklist.component';

describe('FutureAppointmentsWorklistComponent', () => {
  let component: FutureAppointmentsWorklistComponent;
  let fixture: ComponentFixture<FutureAppointmentsWorklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FutureAppointmentsWorklistComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FutureAppointmentsWorklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
