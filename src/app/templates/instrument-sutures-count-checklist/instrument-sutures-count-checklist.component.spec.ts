import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstrumentSuturesCountChecklistComponent } from './instrument-sutures-count-checklist.component';

describe('InstrumentSuturesCountChecklistComponent', () => {
  let component: InstrumentSuturesCountChecklistComponent;
  let fixture: ComponentFixture<InstrumentSuturesCountChecklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InstrumentSuturesCountChecklistComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstrumentSuturesCountChecklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
