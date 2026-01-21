import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmrBedsComponent } from './emr-beds.component';

describe('EmrBedsComponent', () => {
  let component: EmrBedsComponent;
  let fixture: ComponentFixture<EmrBedsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmrBedsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmrBedsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
