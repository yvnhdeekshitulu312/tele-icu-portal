import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreOpChecklistComponent } from './pre-op-checklist.component';

describe('PreOpChecklistComponent', () => {
  let component: PreOpChecklistComponent;
  let fixture: ComponentFixture<PreOpChecklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreOpChecklistComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreOpChecklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
