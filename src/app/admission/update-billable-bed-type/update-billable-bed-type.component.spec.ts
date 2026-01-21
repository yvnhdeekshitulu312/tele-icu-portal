import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateBillableBedTypeComponent } from './update-billable-bed-type.component';

describe('UpdateBillableBedTypeComponent', () => {
  let component: UpdateBillableBedTypeComponent;
  let fixture: ComponentFixture<UpdateBillableBedTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateBillableBedTypeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateBillableBedTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
