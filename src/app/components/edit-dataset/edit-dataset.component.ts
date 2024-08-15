import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StorageService } from '../../services/storage.service';
import { Dataset } from '../../models/dataset';

@Component({
  selector: 'app-edit-dataset',
  templateUrl: './edit-dataset.component.html',
  standalone: true,
  styleUrls: ['./edit-dataset.component.css']
})
export class EditDatasetComponent implements OnInit {
  datasetForm: FormGroup;
  datasetId?: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private storageService: StorageService
  ) {
    this.datasetForm = this.fb.group({
      name: ['', Validators.required],
      baseUrl: ['', Validators.required],
      jql: ['', Validators.required],
      access_token: ['', Validators.required],
      cloudId: ['']
    });
  }

  ngOnInit(): void {
    this.datasetId = +this.route.snapshot.paramMap.get('id')!;
    this.loadDataset();
  }

  async loadDataset(): Promise<void> {
    const dataset = await this.storageService.getDataset(this.datasetId!);
    this.datasetForm.patchValue(dataset);
  }

  async saveDataset(): Promise<void> {
    if (this.datasetForm.valid) {
      const updatedDataset: Dataset = {
        ...this.datasetForm.value,
        id: this.datasetId
      };
      await this.storageService.updateDataset(updatedDataset);
    }
  }
}
