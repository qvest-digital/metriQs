import {ComponentFixture, TestBed} from '@angular/core/testing';

import {WorkInProgressPageComponent} from './work-in-progress-page.component';

describe('WorkInProgressPageComponent', () => {
  let component: WorkInProgressPageComponent;
  let fixture: ComponentFixture<WorkInProgressPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkInProgressPageComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(WorkInProgressPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
