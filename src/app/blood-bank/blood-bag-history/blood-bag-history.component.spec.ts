import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BloodBagHistoryComponent } from './blood-bag-history.component';

describe('BloodBagHistoryComponent', () => {
  let component: BloodBagHistoryComponent;
  let fixture: ComponentFixture<BloodBagHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BloodBagHistoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BloodBagHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
