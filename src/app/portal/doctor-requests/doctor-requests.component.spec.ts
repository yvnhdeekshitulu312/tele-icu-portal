import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorRequestsComponent } from './doctor-requests.component';

describe('DoctorRequestsComponent', () => {
  let component: DoctorRequestsComponent;
  let fixture: ComponentFixture<DoctorRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DoctorRequestsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
