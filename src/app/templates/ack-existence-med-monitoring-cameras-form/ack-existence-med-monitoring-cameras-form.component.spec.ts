import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AckExistenceMedMonitoringCamerasFormComponent } from './ack-existence-med-monitoring-cameras-form.component';

describe('AckExistenceMedMonitoringCamerasFormComponent', () => {
  let component: AckExistenceMedMonitoringCamerasFormComponent;
  let fixture: ComponentFixture<AckExistenceMedMonitoringCamerasFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AckExistenceMedMonitoringCamerasFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AckExistenceMedMonitoringCamerasFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
