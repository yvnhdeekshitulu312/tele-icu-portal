import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NeonatalIntensiveCareUnitComponent } from './neonatal-intensive-care-unit.component';

describe('NeonatalIntensiveCareUnitComponent', () => {
  let component: NeonatalIntensiveCareUnitComponent;
  let fixture: ComponentFixture<NeonatalIntensiveCareUnitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NeonatalIntensiveCareUnitComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NeonatalIntensiveCareUnitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
