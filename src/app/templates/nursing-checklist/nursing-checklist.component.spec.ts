import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NursingChecklistComponent } from './nursing-checklist.component';

describe('NursingChecklistComponent', () => {
  let component: NursingChecklistComponent;
  let fixture: ComponentFixture<NursingChecklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NursingChecklistComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NursingChecklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
