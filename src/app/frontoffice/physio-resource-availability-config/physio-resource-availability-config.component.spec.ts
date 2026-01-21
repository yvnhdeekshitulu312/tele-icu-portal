import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhysioResourceAvailabilityConfigComponent } from './physio-resource-availability-config.component';

describe('PhysioResourceAvailabilityConfigComponent', () => {
  let component: PhysioResourceAvailabilityConfigComponent;
  let fixture: ComponentFixture<PhysioResourceAvailabilityConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PhysioResourceAvailabilityConfigComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhysioResourceAvailabilityConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
