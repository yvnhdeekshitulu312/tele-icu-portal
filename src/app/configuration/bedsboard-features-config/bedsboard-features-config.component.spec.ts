import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BedsboardFeaturesConfigComponent } from './bedsboard-features-config.component';

describe('BedsboardFeaturesConfigComponent', () => {
  let component: BedsboardFeaturesConfigComponent;
  let fixture: ComponentFixture<BedsboardFeaturesConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BedsboardFeaturesConfigComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BedsboardFeaturesConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
