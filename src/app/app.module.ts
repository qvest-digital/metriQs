import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import {StorageService, dbConfigIssueData, dbConfigCore} from './services/storage.service';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ToastrModule } from 'ngx-toastr';
import { NgxIndexedDBModule } from 'ngx-indexed-db';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {AppRoutingModule, routes} from "./app-routing.module";
import {AppComponent} from "./app.component";
import {RouterModule} from "@angular/router";
import {DatasourceListComponent} from "./components/datasource/datasource-list.component";
import {DragDropModule} from "@angular/cdk/drag-drop";
import {MatChipsModule} from "@angular/material/chips";

@NgModule({
  declarations: [
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgxIndexedDBModule.forRoot(dbConfigIssueData, dbConfigCore),
    FormsModule,
    ToastrModule.forRoot(),
    BrowserAnimationsModule,
    RouterModule.forRoot(routes),
    DatasourceListComponent,
    DragDropModule,
    MatChipsModule
  ],
  providers: [StorageService, provideCharts(withDefaultRegisterables())],
})
export class AppModule { }
