import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmergencyHeaderComponent } from './emergency-header.component';

describe('EmergencyHeaderComponent', () => {
  let component: EmergencyHeaderComponent;
  let fixture: ComponentFixture<EmergencyHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmergencyHeaderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmergencyHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
