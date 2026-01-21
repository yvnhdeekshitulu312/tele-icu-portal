import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TriageVitalsComponent } from './triage-vitals.component';

describe('TriageVitalsComponent', () => {
  let component: TriageVitalsComponent;
  let fixture: ComponentFixture<TriageVitalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TriageVitalsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TriageVitalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
