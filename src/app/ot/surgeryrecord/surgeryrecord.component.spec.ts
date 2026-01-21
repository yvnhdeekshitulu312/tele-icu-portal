import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurgeryrecordComponent } from './surgeryrecord.component';

describe('SurgeryrecordComponent', () => {
  let component: SurgeryrecordComponent;
  let fixture: ComponentFixture<SurgeryrecordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SurgeryrecordComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SurgeryrecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
