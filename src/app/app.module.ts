import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { SettingsComponent } from './components/settings.component';
import { OAuthModule } from 'angular-oauth2-oidc';
import { CallbackComponent } from './components/callback.component';
import { StorageService, dbConfig } from './services/storage.service';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ToastrModule } from 'ngx-toastr';
import { NgxIndexedDBModule } from 'ngx-indexed-db';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {AppRoutingModule, routes} from "./app-routing.module";
import {AppComponent} from "./app.component";
import {RouterModule} from "@angular/router";

@NgModule({
  declarations: [
    CallbackComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgxIndexedDBModule.forRoot(dbConfig),
    FormsModule,
    OAuthModule.forRoot(),
    ToastrModule.forRoot(),
    BrowserAnimationsModule,
    RouterModule.forRoot(routes)
  ],
  providers: [StorageService, provideCharts(withDefaultRegisterables())],
})
export class AppModule { }
