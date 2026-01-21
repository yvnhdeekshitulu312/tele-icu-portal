import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LongtermAdultcareunitComponent } from './longterm-adultcareunit.component';

describe('LongtermAdultcareunitComponent', () => {
  let component: LongtermAdultcareunitComponent;
  let fixture: ComponentFixture<LongtermAdultcareunitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LongtermAdultcareunitComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LongtermAdultcareunitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
