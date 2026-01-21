import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsentHighriskOperationComponent } from './consent-highrisk-operation.component';

describe('ConsentHighriskOperationComponent', () => {
  let component: ConsentHighriskOperationComponent;
  let fixture: ComponentFixture<ConsentHighriskOperationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsentHighriskOperationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsentHighriskOperationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
