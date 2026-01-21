import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DischargereconciliationComponent } from './dischargereconciliation.component';

describe('DischargereconciliationComponent', () => {
  let component: DischargereconciliationComponent;
  let fixture: ComponentFixture<DischargereconciliationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DischargereconciliationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DischargereconciliationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
