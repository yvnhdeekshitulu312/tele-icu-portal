import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressNoteComponent } from './progress-note.component';

describe('ProgressNoteComponent', () => {
  let component: ProgressNoteComponent;
  let fixture: ComponentFixture<ProgressNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProgressNoteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgressNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
