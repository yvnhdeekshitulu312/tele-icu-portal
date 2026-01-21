import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdultVentilatorBundleComponent } from './adult-ventilator-bundle.component';

describe('AdultVentilatorBundleComponent', () => {
  let component: AdultVentilatorBundleComponent;
  let fixture: ComponentFixture<AdultVentilatorBundleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdultVentilatorBundleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdultVentilatorBundleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
