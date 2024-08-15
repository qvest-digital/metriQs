import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import {StorageService, dbConfigIssueData, dataSetDbConfig} from './services/storage.service';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ToastrModule } from 'ngx-toastr';
import { NgxIndexedDBModule } from 'ngx-indexed-db';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {AppRoutingModule, routes} from "./app-routing.module";
import {AppComponent} from "./app.component";
import {RouterModule} from "@angular/router";
import {ManageDatasetsComponent} from "./components/manage-datasets/manage-datasets.component";

@NgModule({
  declarations: [
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgxIndexedDBModule.forRoot(dbConfigIssueData, dataSetDbConfig),
    FormsModule,
    ToastrModule.forRoot(),
    BrowserAnimationsModule,
    RouterModule.forRoot(routes),
    ManageDatasetsComponent
  ],
  providers: [StorageService, provideCharts(withDefaultRegisterables())],
})
export class AppModule { }
