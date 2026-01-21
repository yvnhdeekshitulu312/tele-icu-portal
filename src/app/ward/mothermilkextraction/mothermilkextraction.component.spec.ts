import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MothermilkextractionComponent } from './mothermilkextraction.component';

describe('MothermilkextractionComponent', () => {
  let component: MothermilkextractionComponent;
  let fixture: ComponentFixture<MothermilkextractionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MothermilkextractionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MothermilkextractionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
