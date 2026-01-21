import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkprocessingComponent } from './bulkprocessing.component';

describe('BulkprocessingComponent', () => {
  let component: BulkprocessingComponent;
  let fixture: ComponentFixture<BulkprocessingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BulkprocessingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BulkprocessingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
