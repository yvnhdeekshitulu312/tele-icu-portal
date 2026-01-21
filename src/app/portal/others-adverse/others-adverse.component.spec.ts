import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OthersAdverseComponent } from './others-adverse.component';

describe('OthersAdverseComponent', () => {
  let component: OthersAdverseComponent;
  let fixture: ComponentFixture<OthersAdverseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OthersAdverseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OthersAdverseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
