import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { StorageService } from '../../services/storage.service';
import {Datasource, DatasourceType} from '../../models/datasource';
import {MatGridList, MatGridTile} from "@angular/material/grid-list";
import {MatError, MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatButton} from "@angular/material/button";
import {MatOption, MatSelect} from "@angular/material/select";
import {NgForOf, NgIf} from "@angular/common";
import {ToastrService} from "ngx-toastr";
import {DATASOURCE_LIST} from "../../app-routing.module";
import {Status} from "../../models/status";
import {StatusMappingComponent} from "../status-mapping/status-mapping.component";

@Component({
  selector: 'app-edit-dataset',
  templateUrl: './datasource-edit.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatGridList,
    MatGridTile,
    MatFormField,
    MatInput,
    MatButton,
    MatLabel,
    MatSelect,
    MatOption,
    NgForOf,
    NgIf, MatError, StatusMappingComponent
  ],
  styleUrls: ['./datasource-edit.component.scss']
})
export class DatasourceEditComponent implements OnInit {
  datasourceForm: FormGroup;
  datasourceId?: number;
  datasourceTypes = Object.values(DatasourceType);
  currentStates: Status[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private storageService: StorageService,
    private toastr: ToastrService
  ) {
    this.datasourceForm = this.fb.group({
      name: [''],
      baseUrl: ['', Validators.required],
      jql: ['', Validators.required],
      type: [this.datasourceTypes[0]]
    });
  }

  async ngOnInit() {
    this.datasourceId = +this.route.snapshot.paramMap.get('id')!;
    if (this.datasourceId !== undefined && this.datasourceId > 0) {
      const dataset = await this.storageService.getDatasource(this.datasourceId);
      this.datasourceForm.patchValue({
        name: dataset.name ?? '',
        baseUrl: dataset.baseUrl ?? '',
        jql: dataset.jql ?? '',
        type: dataset.type ?? this.datasourceTypes[0]
      });
      this.currentStates = await this.storageService.getAllStatuses(this.datasourceId);
    }
  }

  async saveDataset(): Promise<void> {
    if (this.datasourceForm.valid) {
      const updatedDataset: Datasource = {
        ...this.datasourceForm.value
      };
      if (this.datasourceId !== undefined && !isNaN(this.datasourceId)) {
        updatedDataset.id = this.datasourceId;
        await this.storageService.updateDatasource(updatedDataset);
        this.toastr.success('Datasource updated');
      } else {
        await this.storageService.createDatasource(updatedDataset);
        this.toastr.success('Datasource created');
      }
      this.router.navigate([DATASOURCE_LIST]);
    }
  }

  async deleteDataset(): Promise<void> {
    if (this.datasourceId) {
      await this.storageService.removeDatasource(this.datasourceId);
      this.toastr.success('Datasource deleted');
      this.router.navigate([DATASOURCE_LIST]);
    }
  }
}
