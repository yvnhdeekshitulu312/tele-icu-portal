import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IvfOrderDetailsComponent } from './ivf-order-details.component';

describe('IvfOrderDetailsComponent', () => {
  let component: IvfOrderDetailsComponent;
  let fixture: ComponentFixture<IvfOrderDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IvfOrderDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IvfOrderDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
