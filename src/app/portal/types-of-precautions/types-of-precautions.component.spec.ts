import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypesOfPrecautionsComponent } from './types-of-precautions.component';

describe('TypesOfPrecautionsComponent', () => {
  let component: TypesOfPrecautionsComponent;
  let fixture: ComponentFixture<TypesOfPrecautionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TypesOfPrecautionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypesOfPrecautionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
