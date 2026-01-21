import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructionsToNurseComponent } from './instructions-to-nurse.component';

describe('InstructionsToNurseComponent', () => {
  let component: InstructionsToNurseComponent;
  let fixture: ComponentFixture<InstructionsToNurseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InstructionsToNurseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstructionsToNurseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
