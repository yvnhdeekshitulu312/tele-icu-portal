import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AkuVitalsComponent } from './aku-vitals.component';

describe('AkuVitalsComponent', () => {
  let component: AkuVitalsComponent;
  let fixture: ComponentFixture<AkuVitalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AkuVitalsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AkuVitalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
