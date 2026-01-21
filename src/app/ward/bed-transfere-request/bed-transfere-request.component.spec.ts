import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BedTransfereRequestComponent } from './bed-transfere-request.component';

describe('BedTransfereRequestComponent', () => {
  let component: BedTransfereRequestComponent;
  let fixture: ComponentFixture<BedTransfereRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BedTransfereRequestComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BedTransfereRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
