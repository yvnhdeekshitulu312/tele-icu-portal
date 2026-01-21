import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtQuickActionsComponent } from './ot-quick-actions.component';

describe('OtQuickActionsComponent', () => {
  let component: OtQuickActionsComponent;
  let fixture: ComponentFixture<OtQuickActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OtQuickActionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtQuickActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
