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
import {Datasource} from '../../models/datasource';
import {LayoutComponent} from "../layout/layout.component";
import {DATASOURCE_CREATE, DATASOURCE_LIST} from "../../app-routing.module";
import {Router} from "@angular/router";

@Component({
  selector: 'app-datasources-list',
  templateUrl: './datasource-list.component.html',
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
  styleUrls: ['./datasource-list.component.scss']
})
export class DatasourceListComponent implements OnInit {
  datasources: Datasource[] = [];

  constructor(
    private storageService: StorageService,
    private router: Router
  ) {
  }

  async ngOnInit() {
    this.datasources = await this.storageService.getAllDatasources();
  }

  async removeDatasource(datasource: Datasource) {
    await this.storageService.removeDatasource(datasource.id!);
    this.datasources = await this.storageService.getAllDatasources();
  }

  editDatasource(datasource: Datasource) {
    this.router.navigate([DATASOURCE_LIST, datasource.id]);
  }

  createDatasource() {
    this.router.navigate([DATASOURCE_CREATE]);
  }
}
