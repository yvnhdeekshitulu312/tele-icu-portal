import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaternalHistoryComponent } from './maternal-history.component';

describe('MaternalHistoryComponent', () => {
  let component: MaternalHistoryComponent;
  let fixture: ComponentFixture<MaternalHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MaternalHistoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaternalHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
