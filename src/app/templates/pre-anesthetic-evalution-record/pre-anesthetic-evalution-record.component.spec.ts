import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreAnestheticEvalutionRecordComponent } from './pre-anesthetic-evalution-record.component';

describe('PreAnestheticEvalutionRecordComponent', () => {
  let component: PreAnestheticEvalutionRecordComponent;
  let fixture: ComponentFixture<PreAnestheticEvalutionRecordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreAnestheticEvalutionRecordComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreAnestheticEvalutionRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
