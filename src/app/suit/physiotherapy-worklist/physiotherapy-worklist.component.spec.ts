import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhysiotherapyWorklistComponent } from './physiotherapy-worklist.component';

describe('PhysiotherapyWorklistComponent', () => {
  let component: PhysiotherapyWorklistComponent;
  let fixture: ComponentFixture<PhysiotherapyWorklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PhysiotherapyWorklistComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhysiotherapyWorklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
