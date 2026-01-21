import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DischargeIntimationsComponent } from './discharge-intimations.component';

describe('DischargeIntimationsComponent', () => {
  let component: DischargeIntimationsComponent;
  let fixture: ComponentFixture<DischargeIntimationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DischargeIntimationsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DischargeIntimationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
