import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediInvProcComponent } from './medi-inv-proc.component';

describe('MediInvProcComponent', () => {
  let component: MediInvProcComponent;
  let fixture: ComponentFixture<MediInvProcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MediInvProcComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MediInvProcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
