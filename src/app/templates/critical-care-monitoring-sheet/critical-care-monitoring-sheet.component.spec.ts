import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CriticalCareMonitoringSheetComponent } from './critical-care-monitoring-sheet.component';

describe('CriticalCareMonitoringSheetComponent', () => {
  let component: CriticalCareMonitoringSheetComponent;
  let fixture: ComponentFixture<CriticalCareMonitoringSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CriticalCareMonitoringSheetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CriticalCareMonitoringSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
