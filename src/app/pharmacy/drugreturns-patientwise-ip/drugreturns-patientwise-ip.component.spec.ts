import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrugreturnsPatientwiseIpComponent } from './drugreturns-patientwise-ip.component';

describe('DrugreturnsPatientwiseIpComponent', () => {
  let component: DrugreturnsPatientwiseIpComponent;
  let fixture: ComponentFixture<DrugreturnsPatientwiseIpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DrugreturnsPatientwiseIpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DrugreturnsPatientwiseIpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
