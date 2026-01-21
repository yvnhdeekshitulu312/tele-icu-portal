import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralconsentComponent } from './generalconsent.component';

describe('GeneralconsentComponent', () => {
  let component: GeneralconsentComponent;
  let fixture: ComponentFixture<GeneralconsentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeneralconsentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneralconsentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
