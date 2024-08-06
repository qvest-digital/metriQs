import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkItemAgeChartComponent } from './work-item-age-chart.component';

describe('WorkItemAgeChartComponent', () => {
  let component: WorkItemAgeChartComponent;
  let fixture: ComponentFixture<WorkItemAgeChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkItemAgeChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkItemAgeChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
