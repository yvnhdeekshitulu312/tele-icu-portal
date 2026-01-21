import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IvfOrderComponent } from './ivf-order.component';

describe('IvfOrderComponent', () => {
  let component: IvfOrderComponent;
  let fixture: ComponentFixture<IvfOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IvfOrderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IvfOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
