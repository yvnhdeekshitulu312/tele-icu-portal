import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferChecklistComponent } from './transfer-checklist.component';

describe('TransferChecklistComponent', () => {
  let component: TransferChecklistComponent;
  let fixture: ComponentFixture<TransferChecklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransferChecklistComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransferChecklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
