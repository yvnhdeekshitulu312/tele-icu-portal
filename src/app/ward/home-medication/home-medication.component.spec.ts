import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeMedicationComponent } from './home-medication.component';

describe('HomeMedicationComponent', () => {
  let component: HomeMedicationComponent;
  let fixture: ComponentFixture<HomeMedicationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeMedicationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeMedicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
