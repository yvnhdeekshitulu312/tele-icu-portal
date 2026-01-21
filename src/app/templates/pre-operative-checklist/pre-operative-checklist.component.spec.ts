import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreOperativeChecklistComponent } from './pre-operative-checklist.component';

describe('PreOperativeChecklistComponent', () => {
  let component: PreOperativeChecklistComponent;
  let fixture: ComponentFixture<PreOperativeChecklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreOperativeChecklistComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreOperativeChecklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
