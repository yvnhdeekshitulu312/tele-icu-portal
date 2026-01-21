import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpReturnsComponent } from './ip-returns.component';

describe('IpReturnsComponent', () => {
  let component: IpReturnsComponent;
  let fixture: ComponentFixture<IpReturnsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IpReturnsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IpReturnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
