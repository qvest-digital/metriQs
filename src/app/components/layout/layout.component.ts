import { Component, inject } from '@angular/core';
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
export class LayoutComponent {
  private breakpointObserver = inject(BreakpointObserver);

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  datasets: string[] = ['team metriQs (jira cloud)', 'IoT Crew (jira selfhosted)', 'team Bärchen (open project)'];
  selectedDataset: string = this.datasets[0];

  onDatasetChange(event: any) {
    console.log('Selected dataset:', event.value);
    // Handle dataset change logic here
  }
}
