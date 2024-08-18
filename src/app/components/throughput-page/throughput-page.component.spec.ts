import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThroughputPageComponent } from './throughput-page.component';

describe('ThroughputPageComponent', () => {
  let component: ThroughputPageComponent;
  let fixture: ComponentFixture<ThroughputPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThroughputPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThroughputPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
