import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MdroBundleInfectionComponent } from './mdro-bundle-infection.component';

describe('MdroBundleInfectionComponent', () => {
  let component: MdroBundleInfectionComponent;
  let fixture: ComponentFixture<MdroBundleInfectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MdroBundleInfectionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MdroBundleInfectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
