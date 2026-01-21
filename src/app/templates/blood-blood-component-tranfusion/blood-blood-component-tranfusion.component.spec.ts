import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BloodBloodComponentTranfusionComponent } from './blood-blood-component-tranfusion.component';

describe('BloodBloodComponentTranfusionComponent', () => {
  let component: BloodBloodComponentTranfusionComponent;
  let fixture: ComponentFixture<BloodBloodComponentTranfusionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BloodBloodComponentTranfusionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BloodBloodComponentTranfusionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
