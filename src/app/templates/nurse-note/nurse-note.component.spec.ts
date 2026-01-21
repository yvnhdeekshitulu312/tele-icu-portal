import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NurseNoteComponent } from './nurse-note.component';

describe('NurseNoteComponent', () => {
  let component: NurseNoteComponent;
  let fixture: ComponentFixture<NurseNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NurseNoteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NurseNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
