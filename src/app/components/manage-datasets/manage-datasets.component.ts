import { Component } from '@angular/core';
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {FormsModule} from "@angular/forms";
import {MatList, MatListItem} from "@angular/material/list";
import {MatIcon} from "@angular/material/icon";
import {MatButton, MatIconButton} from "@angular/material/button";
import {NgForOf} from "@angular/common";
import {MatInput} from "@angular/material/input";

@Component({
  selector: 'app-manage-datasets',
  templateUrl: './manage-datasets.component.html',
  standalone: true,
  imports: [
    MatFormField,
    FormsModule,
    MatList,
    MatListItem,
    MatIcon,
    MatIconButton,
    MatButton,
    NgForOf,
    MatInput,
    MatLabel
  ],
  styleUrls: ['./manage-datasets.component.scss']
})
export class ManageDatasetsComponent {
  datasets: string[] = ['team metriQs (jira cloud)', 'IoT Crew (jira selfhosted)', 'team Bärchen (open project)'];
  newDataset: string = '';

  addDataset() {
    if (this.newDataset) {
      this.datasets.push(this.newDataset);
      this.newDataset = '';
    }
  }

  removeDataset(dataset: string) {
    this.datasets = this.datasets.filter(d => d !== dataset);
  }
}
