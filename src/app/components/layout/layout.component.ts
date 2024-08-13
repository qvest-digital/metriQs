import {Component, inject, OnInit} from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import {AsyncPipe, NgForOf} from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import {RouterLink, RouterOutlet} from "@angular/router";
import {MatSelectModule} from "@angular/material/select";
import {MatFormFieldModule} from "@angular/material/form-field";
import {StorageService} from "../../services/storage.service";
import {Dataset} from "../../models/dataset";
import {ToastrService} from "ngx-toastr";


@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    AsyncPipe,
    RouterOutlet,
    RouterLink,
    NgForOf
  ]
})
export class LayoutComponent implements OnInit {
  private breakpointObserver = inject(BreakpointObserver);

  constructor(private storageService: StorageService, private toastr: ToastrService) {

  }

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  datasets: Dataset[] = [];
  selectedDataset: string = this.datasets[0] ? this.datasets[0].name! : '';

  onDatasetChange(event: any) {
    this.toastr.success('Selected dataset: ' + event.value);
  }

  ngOnInit(): void {
    this.storageService.getAllDatasets().then((datasets: Dataset[]) => {
      this.datasets = datasets;
    });
  };
}
