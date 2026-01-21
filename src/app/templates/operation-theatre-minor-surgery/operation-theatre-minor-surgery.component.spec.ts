import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationTheatreMinorSurgeryComponent } from './operation-theatre-minor-surgery.component';

describe('OperationTheatreMinorSurgeryComponent', () => {
  let component: OperationTheatreMinorSurgeryComponent;
  let fixture: ComponentFixture<OperationTheatreMinorSurgeryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OperationTheatreMinorSurgeryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OperationTheatreMinorSurgeryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
