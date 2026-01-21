import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChiDischargesummaryComponent } from './chi-dischargesummary.component';

describe('ChiDischargesummaryComponent', () => {
  let component: ChiDischargesummaryComponent;
  let fixture: ComponentFixture<ChiDischargesummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChiDischargesummaryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChiDischargesummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
