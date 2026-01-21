import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceblockingComponent } from './resourceblocking.component';

describe('ResourceblockingComponent', () => {
  let component: ResourceblockingComponent;
  let fixture: ComponentFixture<ResourceblockingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResourceblockingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResourceblockingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
