import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './app/services/auth.service';
import { AppModule } from './app/app.module';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {LayoutComponent} from "./app/components/layout/layout.component";
import {AppComponent} from "./app/app.component";

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(BrowserModule, FormsModule, AppModule),
    provideHttpClient(),
    provideAnimationsAsync(),
  ]
}).catch(err => console.error(err));
