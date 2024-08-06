// src/app/components/app.component.ts
import { Component, OnInit } from '@angular/core';
import {Router, ActivatedRoute, RouterOutlet} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { DatabaseService } from '../services/database.service';
import {SettingsComponent} from "./settings.component";
import {WorkItemAgeChartComponent} from "./work-item-age-chart/work-item-age-chart.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [SettingsComponent, RouterOutlet, WorkItemAgeChartComponent]
})
export class AppComponent implements OnInit {
  title = 'friendly user';

  constructor(
    private authService: AuthService,
    private databaseService: DatabaseService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {

  }

  login() {
    this.authService.login();
  }

  async saveData() {
    // const data = this.settingsService.getConfiguration();
    // await this.databaseService.addDataset(data);
  }


}
