import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabBulkverificationComponent } from './lab-bulkverification.component';

describe('LabBulkverificationComponent', () => {
  let component: LabBulkverificationComponent;
  let fixture: ComponentFixture<LabBulkverificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabBulkverificationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabBulkverificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
