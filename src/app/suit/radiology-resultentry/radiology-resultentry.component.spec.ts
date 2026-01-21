import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadiologyResultentryComponent } from './radiology-resultentry.component';

describe('RadiologyResultentryComponent', () => {
  let component: RadiologyResultentryComponent;
  let fixture: ComponentFixture<RadiologyResultentryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RadiologyResultentryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadiologyResultentryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
