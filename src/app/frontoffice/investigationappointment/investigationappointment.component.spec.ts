import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestigationappointmentComponent } from './investigationappointment.component';

describe('InvestigationappointmentComponent', () => {
  let component: InvestigationappointmentComponent;
  let fixture: ComponentFixture<InvestigationappointmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvestigationappointmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvestigationappointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
