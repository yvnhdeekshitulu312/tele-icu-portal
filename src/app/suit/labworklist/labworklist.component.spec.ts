import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabworklistComponent } from './labworklist.component';

describe('LabworklistComponent', () => {
  let component: LabworklistComponent;
  let fixture: ComponentFixture<LabworklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabworklistComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabworklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
