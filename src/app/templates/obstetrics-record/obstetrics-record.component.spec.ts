import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObstetricsRecordComponent } from './obstetrics-record.component';

describe('ObstetricsRecordComponent', () => {
  let component: ObstetricsRecordComponent;
  let fixture: ComponentFixture<ObstetricsRecordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ObstetricsRecordComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ObstetricsRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
