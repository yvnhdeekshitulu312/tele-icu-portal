import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhysiotherapyResultentryComponent } from './physiotherapy-resultentry.component';

describe('PhysiotherapyResultentryComponent', () => {
  let component: PhysiotherapyResultentryComponent;
  let fixture: ComponentFixture<PhysiotherapyResultentryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PhysiotherapyResultentryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhysiotherapyResultentryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
