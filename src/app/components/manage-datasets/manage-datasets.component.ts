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
import {Dataset} from '../../models/dataset';
import {LayoutComponent} from "../layout/layout.component";
import {CREATE_DATASETS, MANAGE_DATASETS} from "../../app-routing.module";
import {Router} from "@angular/router";

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

  constructor(
    private storageService: StorageService,
    private fb: FormBuilder,
    private layoutComponent: LayoutComponent,
    private router: Router
  ) {
  }

  async ngOnInit() {
    this.datasets = await this.storageService.getAllDatasets();
  }

  async removeDataset(dataset: Dataset) {
    await this.storageService.removeDataset(dataset.id!);
    this.datasets = await this.storageService.getAllDatasets();
  }

  editDataset(dataset: Dataset) {
    this.router.navigate([MANAGE_DATASETS, dataset.id]);
  }

  createDataset() {
    this.router.navigate([CREATE_DATASETS]);
  }
}
