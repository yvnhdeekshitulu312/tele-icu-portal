import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IcuProgressnotesNewComponent } from './icu-progressnotes-new.component';

describe('IcuProgressnotesNewComponent', () => {
  let component: IcuProgressnotesNewComponent;
  let fixture: ComponentFixture<IcuProgressnotesNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IcuProgressnotesNewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IcuProgressnotesNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
