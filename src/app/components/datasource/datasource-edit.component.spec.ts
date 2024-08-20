import { ComponentFixture, TestBed } from '@angular/core/testing';

import {DatasourceEditComponent} from './datasource-edit.component';

describe('EditDatasetComponent', () => {
  let component: DatasourceEditComponent;
  let fixture: ComponentFixture<DatasourceEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatasourceEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatasourceEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
