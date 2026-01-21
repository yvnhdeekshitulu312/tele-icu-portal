import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DietCounsellingComponent } from './diet-counselling.component';

describe('DietCounsellingComponent', () => {
  let component: DietCounsellingComponent;
  let fixture: ComponentFixture<DietCounsellingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DietCounsellingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DietCounsellingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
