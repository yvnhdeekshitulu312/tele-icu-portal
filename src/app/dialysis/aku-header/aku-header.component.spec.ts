import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AkuHeaderComponent } from './aku-header.component';

describe('AkuHeaderComponent', () => {
  let component: AkuHeaderComponent;
  let fixture: ComponentFixture<AkuHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AkuHeaderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AkuHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
