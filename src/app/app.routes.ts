import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {CallbackComponent} from "./components/callback.component";

export const routes: Routes = [
  { path: 'callback', component: CallbackComponent },
  // other routes
  { path: '**', redirectTo: '', pathMatch: 'full' } // fallback route
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
