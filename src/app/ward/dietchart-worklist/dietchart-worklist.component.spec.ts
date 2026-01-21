import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DietchartWorklistComponent } from './dietchart-worklist.component';

describe('DietchartWorklistComponent', () => {
  let component: DietchartWorklistComponent;
  let fixture: ComponentFixture<DietchartWorklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DietchartWorklistComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DietchartWorklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
