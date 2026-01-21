import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatedBedsComponent } from './updated-beds.component';

describe('UpdatedBedsComponent', () => {
  let component: UpdatedBedsComponent;
  let fixture: ComponentFixture<UpdatedBedsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdatedBedsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdatedBedsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
