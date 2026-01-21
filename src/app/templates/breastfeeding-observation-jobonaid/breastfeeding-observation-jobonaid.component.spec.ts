import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BreastfeedingObservationJobonaidComponent } from './breastfeeding-observation-jobonaid.component';

describe('BreastfeedingObservationJobonaidComponent', () => {
  let component: BreastfeedingObservationJobonaidComponent;
  let fixture: ComponentFixture<BreastfeedingObservationJobonaidComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BreastfeedingObservationJobonaidComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BreastfeedingObservationJobonaidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
