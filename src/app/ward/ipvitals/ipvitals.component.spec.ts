import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpvitalsComponent } from './ipvitals.component';

describe('IpvitalsComponent', () => {
  let component: IpvitalsComponent;
  let fixture: ComponentFixture<IpvitalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IpvitalsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IpvitalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
