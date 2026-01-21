import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DischargeInstCbahiPfrPostDischComponent } from './discharge-inst-cbahi-pfr-post-disch.component';

describe('DischargeInstCbahiPfrPostDischComponent', () => {
  let component: DischargeInstCbahiPfrPostDischComponent;
  let fixture: ComponentFixture<DischargeInstCbahiPfrPostDischComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DischargeInstCbahiPfrPostDischComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DischargeInstCbahiPfrPostDischComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
