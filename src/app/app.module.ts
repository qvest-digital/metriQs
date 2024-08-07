// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './components/app.component';
import { SettingsComponent } from './components/settings.component';
import {OAuthModule} from "angular-oauth2-oidc";
import {CallbackComponent} from "./components/callback.component";
import {AppRoutingModule} from "./app.routes";
import {StorageService, dbConfig} from "./services/storage.service";
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import {ToastrModule} from "ngx-toastr";
import {NgxIndexedDBModule} from "ngx-indexed-db";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";

@NgModule({
  declarations: [
    CallbackComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgxIndexedDBModule.forRoot(dbConfig),
    FormsModule,
    AppComponent,
    SettingsComponent,
    OAuthModule.forRoot(),
    ToastrModule.forRoot(),
    BrowserAnimationsModule
  ],
  providers: [StorageService, provideCharts(withDefaultRegisterables())],
})
export class AppModule { }
