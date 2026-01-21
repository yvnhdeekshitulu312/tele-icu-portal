import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NicuCriticalMonitoringSheetComponent } from './nicu-critical-monitoring-sheet.component';

describe('NicuCriticalMonitoringSheetComponent', () => {
  let component: NicuCriticalMonitoringSheetComponent;
  let fixture: ComponentFixture<NicuCriticalMonitoringSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NicuCriticalMonitoringSheetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NicuCriticalMonitoringSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
