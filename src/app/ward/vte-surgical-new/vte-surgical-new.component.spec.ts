import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VteSurgicalNewComponent } from './vte-surgical-new.component';

describe('VteSurgicalNewComponent', () => {
  let component: VteSurgicalNewComponent;
  let fixture: ComponentFixture<VteSurgicalNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VteSurgicalNewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VteSurgicalNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
