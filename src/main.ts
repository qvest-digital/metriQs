import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './app/services/auth.service';
import { OAuthModule, OAuthService, UrlHelperService } from 'angular-oauth2-oidc';
import { AppModule } from './app/app.module';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {LayoutComponent} from "./app/components/layout/layout.component";
import {AppComponent} from "./app/app.component";

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(BrowserModule, FormsModule, OAuthModule, AppModule),
    provideHttpClient(),
    OAuthService, UrlHelperService, provideAnimationsAsync(),
  ]
}).catch(err => console.error(err));
