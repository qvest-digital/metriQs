// src/app/components/manage-datasets/manage-datasets.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatList, MatListItem } from "@angular/material/list";
import { MatIcon } from "@angular/material/icon";
import { MatButton, MatIconButton } from "@angular/material/button";
import { NgForOf, NgIf } from "@angular/common";
import { MatInput } from "@angular/material/input";
import { MatSelect, MatOption } from "@angular/material/select";
import { StorageService } from '../../services/storage.service';
import { Dataset, DataSetType } from '../../models/dataset';
import {LayoutComponent} from "../layout/layout.component";

@Component({
  selector: 'app-manage-datasets',
  templateUrl: './manage-datasets.component.html',
  standalone: true,
  imports: [
    MatFormField,
    FormsModule,
    ReactiveFormsModule,
    MatList,
    MatListItem,
    MatIcon,
    MatIconButton,
    MatButton,
    NgForOf,
    MatInput,
    MatLabel,
    NgIf,
    MatSelect,
    MatOption
  ],
  styleUrls: ['./manage-datasets.component.scss']
})
export class ManageDatasetsComponent implements OnInit {
  datasets: Dataset[] = [];
  editMode: boolean = false;
  datasetToEdit?: Dataset;
  datasetForm: FormGroup;
  datasetTypes = Object.values(DataSetType);

  constructor(
    private storageService: StorageService,
    private fb: FormBuilder,
    private layoutComponent: LayoutComponent
  ) {
    this.datasetForm = this.fb.group({
      name: ['', Validators.required],
      jql: ['', Validators.required],
      baseUrl: ['', Validators.required],
      type: [DataSetType.JIRA_CLOUD, Validators.required],
      access_token: [''],
      cloudId: ['']
    });
  }

  async ngOnInit() {
    this.datasets = await this.storageService.getAllDatasets();
  }

  async onSubmit() {
    if (this.datasetForm.valid) {
      var dataset: Dataset = this.datasetForm.value;
      if (this.editMode && this.datasetToEdit) {
        dataset.id = this.datasetToEdit.id;
        dataset = await this.storageService.updateDataset(dataset);
      } else {
        dataset = await this.storageService.addDataset(dataset);
      }
      this.datasets = await this.storageService.getAllDatasets();
      await this.storageService.saveAppSettings({selectedDatasetId: dataset.id!});
      this.resetForm();
      this.layoutComponent.refreshDatasets(); // Refresh datasets in LayoutComponent
    }
  }

  async removeDataset(dataset: Dataset) {
    await this.storageService.removeDataset(dataset.id!);
    this.datasets = await this.storageService.getAllDatasets();
  }

  editDataset(dataset: Dataset) {
    this.editMode = true;
    this.datasetToEdit = { ...dataset };
    this.datasetForm.patchValue(dataset);
  }

  cancelEdit() {
    this.resetForm();
  }

  private resetForm() {
    this.editMode = false;
    this.datasetToEdit = undefined;
    this.datasetForm.reset({
      type: DataSetType.JIRA_CLOUD
    });
  }

}
