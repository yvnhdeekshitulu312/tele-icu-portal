import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AkuWorklistComponent } from './aku-worklist.component';

describe('AkuWorklistComponent', () => {
  let component: AkuWorklistComponent;
  let fixture: ComponentFixture<AkuWorklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AkuWorklistComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AkuWorklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
