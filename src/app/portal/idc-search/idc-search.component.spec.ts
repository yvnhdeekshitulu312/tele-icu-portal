import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdcSearchComponent } from './idc-search.component';

describe('IdcSearchComponent', () => {
  let component: IdcSearchComponent;
  let fixture: ComponentFixture<IdcSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IdcSearchComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IdcSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
