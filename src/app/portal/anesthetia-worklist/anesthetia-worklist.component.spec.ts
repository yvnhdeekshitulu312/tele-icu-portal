import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnesthetiaWorklistComponent } from './anesthetia-worklist.component';

describe('AnesthetiaWorklistComponent', () => {
  let component: AnesthetiaWorklistComponent;
  let fixture: ComponentFixture<AnesthetiaWorklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnesthetiaWorklistComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnesthetiaWorklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
