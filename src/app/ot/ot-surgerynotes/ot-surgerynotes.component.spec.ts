import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtSurgerynotesComponent } from './ot-surgerynotes.component';

describe('OtSurgerynotesComponent', () => {
  let component: OtSurgerynotesComponent;
  let fixture: ComponentFixture<OtSurgerynotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OtSurgerynotesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtSurgerynotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
