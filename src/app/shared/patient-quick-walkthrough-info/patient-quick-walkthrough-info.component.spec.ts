import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientQuickWalkthroughInfoComponent } from './patient-quick-walkthrough-info.component';

describe('PatientQuickWalkthroughInfoComponent', () => {
  let component: PatientQuickWalkthroughInfoComponent;
  let fixture: ComponentFixture<PatientQuickWalkthroughInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientQuickWalkthroughInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientQuickWalkthroughInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
