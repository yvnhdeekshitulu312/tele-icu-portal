import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmrHodWorklistComponent } from './emr-hod-worklist.component';

describe('EmrHodWorklistComponent', () => {
  let component: EmrHodWorklistComponent;
  let fixture: ComponentFixture<EmrHodWorklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmrHodWorklistComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmrHodWorklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
