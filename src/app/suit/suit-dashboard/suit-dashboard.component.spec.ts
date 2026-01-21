import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuitDashboardComponent } from './suit-dashboard.component';

describe('SuitDashboardComponent', () => {
  let component: SuitDashboardComponent;
  let fixture: ComponentFixture<SuitDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SuitDashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuitDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
