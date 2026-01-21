import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BedtransferComponent } from './bedtransfer.component';

describe('BedtransferComponent', () => {
  let component: BedtransferComponent;
  let fixture: ComponentFixture<BedtransferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BedtransferComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BedtransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
