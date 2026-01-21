import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NeonatalIntensiveCareunitNursingComponent } from './neonatal-intensive-careunit-nursing.component';

describe('NeonatalIntensiveCareunitNursingComponent', () => {
  let component: NeonatalIntensiveCareunitNursingComponent;
  let fixture: ComponentFixture<NeonatalIntensiveCareunitNursingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NeonatalIntensiveCareunitNursingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NeonatalIntensiveCareunitNursingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
