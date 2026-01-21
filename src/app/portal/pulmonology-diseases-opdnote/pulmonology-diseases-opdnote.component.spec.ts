import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PulmonologyDiseasesOpdnoteComponent } from './pulmonology-diseases-opdnote.component';

describe('PulmonologyDiseasesOpdnoteComponent', () => {
  let component: PulmonologyDiseasesOpdnoteComponent;
  let fixture: ComponentFixture<PulmonologyDiseasesOpdnoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PulmonologyDiseasesOpdnoteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PulmonologyDiseasesOpdnoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
