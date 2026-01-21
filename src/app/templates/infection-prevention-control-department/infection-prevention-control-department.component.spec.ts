import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfectionPreventionControlDepartmentComponent } from './infection-prevention-control-department.component';

describe('InfectionPreventionControlDepartmentComponent', () => {
  let component: InfectionPreventionControlDepartmentComponent;
  let fixture: ComponentFixture<InfectionPreventionControlDepartmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InfectionPreventionControlDepartmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfectionPreventionControlDepartmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
