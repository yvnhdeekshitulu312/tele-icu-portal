import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PharmacyReturnsComponent } from './pharmacy-returns.component';

describe('PharmacyReturnsComponent', () => {
  let component: PharmacyReturnsComponent;
  let fixture: ComponentFixture<PharmacyReturnsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PharmacyReturnsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PharmacyReturnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
