import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreCardiacCatheterizationChecklistComponent } from './pre-cardiac-catheterization-checklist.component';

describe('PreCardiacCatheterizationChecklistComponent', () => {
  let component: PreCardiacCatheterizationChecklistComponent;
  let fixture: ComponentFixture<PreCardiacCatheterizationChecklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreCardiacCatheterizationChecklistComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreCardiacCatheterizationChecklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
