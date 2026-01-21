import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComprehensiveDentalHealthAsmntformComponent } from './comprehensive-dental-health-asmntform.component';

describe('ComprehensiveDentalHealthAsmntformComponent', () => {
  let component: ComprehensiveDentalHealthAsmntformComponent;
  let fixture: ComponentFixture<ComprehensiveDentalHealthAsmntformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComprehensiveDentalHealthAsmntformComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComprehensiveDentalHealthAsmntformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
