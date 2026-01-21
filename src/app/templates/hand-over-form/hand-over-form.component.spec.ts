import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HandOverFormComponent } from './hand-over-form.component';

describe('HandOverFormComponent', () => {
  let component: HandOverFormComponent;
  let fixture: ComponentFixture<HandOverFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HandOverFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HandOverFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
