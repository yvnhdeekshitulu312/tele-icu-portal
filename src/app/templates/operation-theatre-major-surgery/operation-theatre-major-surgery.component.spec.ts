import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationTheatreMajorSurgeryComponent } from './operation-theatre-major-surgery.component';

describe('OperationTheatreMajorSurgeryComponent', () => {
  let component: OperationTheatreMajorSurgeryComponent;
  let fixture: ComponentFixture<OperationTheatreMajorSurgeryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OperationTheatreMajorSurgeryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OperationTheatreMajorSurgeryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
