import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplicationsSideeffectsOfEpiduralanaesthesiaComponent } from './complications-sideeffects-of-epiduralanaesthesia.component';

describe('ComplicationsSideeffectsOfEpiduralanaesthesiaComponent', () => {
  let component: ComplicationsSideeffectsOfEpiduralanaesthesiaComponent;
  let fixture: ComponentFixture<ComplicationsSideeffectsOfEpiduralanaesthesiaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComplicationsSideeffectsOfEpiduralanaesthesiaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComplicationsSideeffectsOfEpiduralanaesthesiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
