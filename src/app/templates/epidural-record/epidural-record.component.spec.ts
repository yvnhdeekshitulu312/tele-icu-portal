import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpiduralRecordComponent } from './epidural-record.component';

describe('EpiduralRecordComponent', () => {
  let component: EpiduralRecordComponent;
  let fixture: ComponentFixture<EpiduralRecordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EpiduralRecordComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EpiduralRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
