// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './components/app.component';
import { SettingsComponent } from './components/settings.component';
import {outputAst} from "@angular/compiler";
import {OAuthLogger, OAuthModule, OAuthService} from "angular-oauth2-oidc";
import {CallbackComponent} from "./components/callback.component";
import {AppRoutingModule} from "./app.routes";
import {DatabaseService} from "./services/database.service";

@NgModule({
  declarations: [
    CallbackComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    AppComponent,
    SettingsComponent,
    OAuthModule.forRoot()
  ],
  providers: [DatabaseService],
})
export class AppModule { }
