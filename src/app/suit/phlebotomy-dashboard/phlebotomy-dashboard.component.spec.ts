import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhlebotomyDashboardComponent } from './phlebotomy-dashboard.component';

describe('PhlebotomyDashboardComponent', () => {
  let component: PhlebotomyDashboardComponent;
  let fixture: ComponentFixture<PhlebotomyDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PhlebotomyDashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhlebotomyDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
