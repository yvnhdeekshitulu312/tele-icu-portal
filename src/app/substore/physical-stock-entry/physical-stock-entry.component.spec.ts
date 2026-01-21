import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhysicalStockEntryComponent } from './physical-stock-entry.component';

describe('PhysicalStockEntryComponent', () => {
  let component: PhysicalStockEntryComponent;
  let fixture: ComponentFixture<PhysicalStockEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PhysicalStockEntryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhysicalStockEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
