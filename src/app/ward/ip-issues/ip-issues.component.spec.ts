import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpIssuesComponent } from './ip-issues.component';

describe('IpIssuesComponent', () => {
  let component: IpIssuesComponent;
  let fixture: ComponentFixture<IpIssuesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IpIssuesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IpIssuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
