import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SickleaveComponent } from './sickleave.component';

describe('SickleaveComponent', () => {
  let component: SickleaveComponent;
  let fixture: ComponentFixture<SickleaveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SickleaveComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SickleaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
