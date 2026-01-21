import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MothermilkfeedingComponent } from './mothermilkfeeding.component';

describe('MothermilkfeedingComponent', () => {
  let component: MothermilkfeedingComponent;
  let fixture: ComponentFixture<MothermilkfeedingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MothermilkfeedingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MothermilkfeedingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
