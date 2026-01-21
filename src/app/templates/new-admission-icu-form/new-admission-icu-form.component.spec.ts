import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewAdmissionIcuFormComponent } from './new-admission-icu-form.component';

describe('NewAdmissionIcuFormComponent', () => {
  let component: NewAdmissionIcuFormComponent;
  let fixture: ComponentFixture<NewAdmissionIcuFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewAdmissionIcuFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewAdmissionIcuFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
