import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VteAntenatalComponent } from './vte-antenatal.component';

describe('VteAntenatalComponent', () => {
  let component: VteAntenatalComponent;
  let fixture: ComponentFixture<VteAntenatalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VteAntenatalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VteAntenatalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
