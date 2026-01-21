import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkinCareBundleComponent } from './skin-care-bundle.component';

describe('SkinCareBundleComponent', () => {
  let component: SkinCareBundleComponent;
  let fixture: ComponentFixture<SkinCareBundleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SkinCareBundleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkinCareBundleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
