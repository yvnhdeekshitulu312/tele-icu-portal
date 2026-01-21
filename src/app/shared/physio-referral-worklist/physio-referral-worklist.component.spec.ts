import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhysioReferralWorklistComponent } from './physio-referral-worklist.component';

describe('PhysioReferralWorklistComponent', () => {
  let component: PhysioReferralWorklistComponent;
  let fixture: ComponentFixture<PhysioReferralWorklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PhysioReferralWorklistComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhysioReferralWorklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
