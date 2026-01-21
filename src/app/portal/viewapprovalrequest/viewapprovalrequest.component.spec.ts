import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewapprovalrequestComponent } from './viewapprovalrequest.component';

describe('ViewapprovalrequestComponent', () => {
  let component: ViewapprovalrequestComponent;
  let fixture: ComponentFixture<ViewapprovalrequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewapprovalrequestComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewapprovalrequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
