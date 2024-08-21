import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonteCarloPageComponent } from './monte-carlo-page.component';

describe('MonteCarloPageComponent', () => {
  let component: MonteCarloPageComponent;
  let fixture: ComponentFixture<MonteCarloPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonteCarloPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonteCarloPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
