import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClinicalpathNormalNewbornComponent } from './clinicalpath-normal-newborn.component';

describe('ClinicalpathNormalNewbornComponent', () => {
  let component: ClinicalpathNormalNewbornComponent;
  let fixture: ComponentFixture<ClinicalpathNormalNewbornComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClinicalpathNormalNewbornComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClinicalpathNormalNewbornComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
