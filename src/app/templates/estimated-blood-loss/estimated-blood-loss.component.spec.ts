import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstimatedBloodLossComponent } from './estimated-blood-loss.component';

describe('EstimatedBloodLossComponent', () => {
  let component: EstimatedBloodLossComponent;
  let fixture: ComponentFixture<EstimatedBloodLossComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EstimatedBloodLossComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstimatedBloodLossComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
