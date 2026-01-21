import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmissionrequestsComponent } from './admissionrequests.component';

describe('AdmissionrequestsComponent', () => {
  let component: AdmissionrequestsComponent;
  let fixture: ComponentFixture<AdmissionrequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdmissionrequestsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdmissionrequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
