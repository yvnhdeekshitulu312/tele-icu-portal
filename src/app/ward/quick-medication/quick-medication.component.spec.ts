import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickMedicationComponent } from './quick-medication.component';

describe('QuickMedicationComponent', () => {
  let component: QuickMedicationComponent;
  let fixture: ComponentFixture<QuickMedicationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuickMedicationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuickMedicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
