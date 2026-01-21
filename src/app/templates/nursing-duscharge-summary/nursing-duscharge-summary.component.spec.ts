import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NursingDuschargeSummaryComponent } from './nursing-duscharge-summary.component';

describe('NursingDuschargeSummaryComponent', () => {
  let component: NursingDuschargeSummaryComponent;
  let fixture: ComponentFixture<NursingDuschargeSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NursingDuschargeSummaryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NursingDuschargeSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
