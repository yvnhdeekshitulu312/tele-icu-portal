import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualtriageComponent } from './visualtriage.component';

describe('VisualtriageComponent', () => {
  let component: VisualtriageComponent;
  let fixture: ComponentFixture<VisualtriageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VisualtriageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisualtriageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
