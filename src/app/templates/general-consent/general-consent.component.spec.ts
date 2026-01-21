import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralConsentComponent } from './general-consent.component';

describe('GeneralConsentComponent', () => {
  let component: GeneralConsentComponent;
  let fixture: ComponentFixture<GeneralConsentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeneralConsentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneralConsentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
