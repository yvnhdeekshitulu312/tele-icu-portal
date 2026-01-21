import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestraintsMonitoringSheetComponent } from './restraints-monitoring-sheet.component';

describe('RestraintsMonitoringSheetComponent', () => {
  let component: RestraintsMonitoringSheetComponent;
  let fixture: ComponentFixture<RestraintsMonitoringSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RestraintsMonitoringSheetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestraintsMonitoringSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
