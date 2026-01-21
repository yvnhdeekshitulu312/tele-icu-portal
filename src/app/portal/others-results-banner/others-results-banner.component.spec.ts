import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OthersResultsBannerComponent } from './others-results-banner.component';

describe('OthersResultsBannerComponent', () => {
  let component: OthersResultsBannerComponent;
  let fixture: ComponentFixture<OthersResultsBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OthersResultsBannerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OthersResultsBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
