import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateBedstatusComponent } from './update-bedstatus.component';

describe('UpdateBedstatusComponent', () => {
  let component: UpdateBedstatusComponent;
  let fixture: ComponentFixture<UpdateBedstatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateBedstatusComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateBedstatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
