import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadiologyWorklistComponent } from './radiology-worklist.component';

describe('RadiologyWorklistComponent', () => {
  let component: RadiologyWorklistComponent;
  let fixture: ComponentFixture<RadiologyWorklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RadiologyWorklistComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadiologyWorklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
