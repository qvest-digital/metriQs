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
import { AuthService } from '../../services/auth.service';
import { Dataset, DataSetType } from '../../models/dataset';

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
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.datasetForm = this.fb.group({
      name: ['', Validators.required],
      jql: ['', Validators.required],
      baseUrl: ['', Validators.required],
      type: [DataSetType.JIRA_CLOUD, Validators.required],
      access_token: ['', Validators.required],
      cloudId: ['', Validators.required]
    });
  }

  async ngOnInit() {
    this.datasets = await this.storageService.getAllDatasets();
  }

  async onSubmit() {
    if (this.datasetForm.valid) {
      const dataset: Dataset = this.datasetForm.value;
      if (this.editMode && this.datasetToEdit) {
        dataset.id = this.datasetToEdit.id;
        await this.storageService.updateDataset(dataset);
      } else {
        await this.storageService.addDataset(dataset);
      }
      this.datasets = await this.storageService.getAllDatasets();
      this.resetForm();
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

  protected readonly DataSetType = DataSetType;
}
