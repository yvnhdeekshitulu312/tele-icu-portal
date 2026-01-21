import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfectionControlBundleformComponent } from './infection-control-bundleform.component';

describe('InfectionControlBundleformComponent', () => {
  let component: InfectionControlBundleformComponent;
  let fixture: ComponentFixture<InfectionControlBundleformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InfectionControlBundleformComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfectionControlBundleformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
