import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NursingFeedingChartComponent } from './nursing-feeding-chart.component';

describe('NursingFeedingChartComponent', () => {
  let component: NursingFeedingChartComponent;
  let fixture: ComponentFixture<NursingFeedingChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NursingFeedingChartComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NursingFeedingChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
