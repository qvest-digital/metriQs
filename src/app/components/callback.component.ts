// src/app/callback.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import {StorageService} from "../services/storage.service";

@Component({
  selector: 'app-callback',
  template: '<p>Loading...</p>',
})
export class CallbackComponent implements OnInit {

  constructor(private route: ActivatedRoute, private router: Router, private authService: AuthService, private databaseService: StorageService) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      if (code) {
        this.authService.handleCallback(code);
      }
    });
  }
}
