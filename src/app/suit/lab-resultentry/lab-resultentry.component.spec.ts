import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabResultentryComponent } from './lab-resultentry.component';

describe('LabResultentryComponent', () => {
  let component: LabResultentryComponent;
  let fixture: ComponentFixture<LabResultentryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabResultentryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabResultentryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
