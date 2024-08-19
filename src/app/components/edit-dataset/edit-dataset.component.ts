import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { StorageService } from '../../services/storage.service';
import {Dataset, DataSetType} from '../../models/dataset';
import {MatGridList, MatGridTile} from "@angular/material/grid-list";
import {MatError, MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatButton} from "@angular/material/button";
import {MatOption, MatSelect} from "@angular/material/select";
import {NgForOf, NgIf} from "@angular/common";
import {ToastrService} from "ngx-toastr";
import {MANAGE_DATASETS} from "../../app-routing.module";
import {Status} from "../../models/status";
import {StatusMappingComponent} from "../status-mapping/status-mapping.component";

@Component({
  selector: 'app-edit-dataset',
  templateUrl: './edit-dataset.component.html',
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
  styleUrls: ['./edit-dataset.component.scss']
})
export class EditDatasetComponent implements OnInit {
  datasetForm: FormGroup;
  datasetId?: number;
  datasetTypes = Object.values(DataSetType);
  currentStates: Status[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private storageService: StorageService,
    private toastr: ToastrService
  ) {
    this.datasetForm = this.fb.group({
      name: [''],
      baseUrl: ['', Validators.required],
      jql: ['', Validators.required],
      type: [this.datasetTypes[0]]
    });
  }

  async ngOnInit() {
    this.datasetId = +this.route.snapshot.paramMap.get('id')!;
    if (this.datasetId !== undefined && this.datasetId > 0) {
      const dataset = await this.storageService.getDataset(this.datasetId);
      this.datasetForm.patchValue({
        name: dataset.name ?? '',
        baseUrl: dataset.baseUrl ?? '',
        jql: dataset.jql ?? '',
        type: dataset.type ?? this.datasetTypes[0]
      });
      this.currentStates = await this.storageService.getAllStatuses();
    }
  }

  async saveDataset(): Promise<void> {
    if (this.datasetForm.valid) {
      const updatedDataset: Dataset = {
        ...this.datasetForm.value
      };
      if (this.datasetId !== undefined && !isNaN(this.datasetId)) {
        updatedDataset.id = this.datasetId;
        await this.storageService.updateDataset(updatedDataset);
        this.toastr.success('Dataset updated');
      } else {
        await this.storageService.createDataset(updatedDataset);
        this.toastr.success('Dataset created');
      }
      this.router.navigate([MANAGE_DATASETS]);
    }
  }

  async deleteDataset(): Promise<void> {
    if (this.datasetId) {
      await this.storageService.removeDataset(this.datasetId);
      this.toastr.success('Dataset deleted');
      this.router.navigate([MANAGE_DATASETS]);
    }
  }
}
