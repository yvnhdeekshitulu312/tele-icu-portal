import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabTrendComponent } from './lab-trend.component';

describe('LabTrendComponent', () => {
  let component: LabTrendComponent;
  let fixture: ComponentFixture<LabTrendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabTrendComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabTrendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
