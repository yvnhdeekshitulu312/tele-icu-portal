import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalEmergencyEventsComponent } from './medical-emergency-events.component';

describe('MedicalEmergencyEventsComponent', () => {
  let component: MedicalEmergencyEventsComponent;
  let fixture: ComponentFixture<MedicalEmergencyEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicalEmergencyEventsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalEmergencyEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
