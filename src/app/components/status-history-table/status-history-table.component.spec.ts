import {ComponentFixture, TestBed} from '@angular/core/testing';

import {StatusHistoryTableComponent} from './status-history-table.component';

describe('StatusHistoryTableComponent', () => {
  let component: StatusHistoryTableComponent;
  let fixture: ComponentFixture<StatusHistoryTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusHistoryTableComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(StatusHistoryTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
