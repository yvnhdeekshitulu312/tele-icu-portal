import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuitHeaderComponent } from './suit-header.component';

describe('SuitHeaderComponent', () => {
  let component: SuitHeaderComponent;
  let fixture: ComponentFixture<SuitHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SuitHeaderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuitHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
