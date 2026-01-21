import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CentralLineBundleComponent } from './central-line-bundle.component';

describe('CentralLineBundleComponent', () => {
  let component: CentralLineBundleComponent;
  let fixture: ComponentFixture<CentralLineBundleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CentralLineBundleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CentralLineBundleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
