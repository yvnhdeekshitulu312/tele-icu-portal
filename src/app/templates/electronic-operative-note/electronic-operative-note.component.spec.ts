import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElectronicOperativeNoteComponent } from './electronic-operative-note.component';

describe('ElectronicOperativeNoteComponent', () => {
  let component: ElectronicOperativeNoteComponent;
  let fixture: ComponentFixture<ElectronicOperativeNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ElectronicOperativeNoteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ElectronicOperativeNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
