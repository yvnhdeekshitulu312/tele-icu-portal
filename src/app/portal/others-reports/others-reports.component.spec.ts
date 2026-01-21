import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OthersReportsComponent } from './others-reports.component';

describe('OthersReportsComponent', () => {
  let component: OthersReportsComponent;
  let fixture: ComponentFixture<OthersReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OthersReportsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OthersReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
