import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CycleTimeScatterplotComponent } from './cycle-time-scatterplot.component';

describe('CycleTimeScatterplotComponent', () => {
  let component: CycleTimeScatterplotComponent;
  let fixture: ComponentFixture<CycleTimeScatterplotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CycleTimeScatterplotComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CycleTimeScatterplotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
