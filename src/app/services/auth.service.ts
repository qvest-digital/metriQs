// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { DatabaseService } from './database.service';
import { Dataset } from '../models/dataset';
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private clientId = environment.jira_cloud_clientId;
  private clientSecret = environment.jira_cloud_clientSecret;
  private redirectUri = 'http://localhost:4200/callback';
  private authUrl = 'https://auth.atlassian.com/authorize';
  private tokenUrl = 'https://auth.atlassian.com/oauth/token';
  private resourceUrl = 'https://api.atlassian.com/oauth/token/accessible-resources';

  constructor(private http: HttpClient, private router: Router, private databaseService: DatabaseService) {}

  login() {
    const params = new HttpParams()
      .set('client_id', this.clientId)
      .set('response_type', 'code')
      .set('redirect_uri', this.redirectUri)
      .set('scope', 'read:jira-user read:jira-work');

    window.location.href = `${this.authUrl}?${params.toString()}`;
  }

  async handleCallback(code: string): Promise<void> {
    const body = new HttpParams()
      .set('grant_type', 'authorization_code')
      .set('client_id', this.clientId)
      .set('client_secret', this.clientSecret)
      .set('code', code)
      .set('redirect_uri', this.redirectUri);

    const tokenResponse: any = await this.http.post(this.tokenUrl, body.toString(), {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
    }).toPromise();

    const accessToken = tokenResponse.access_token;

    const resourceResponse: any = await this.http.get(this.resourceUrl, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      }),
    }).toPromise();

    const resourceId = resourceResponse[0].id;

    const dataset: Dataset = {
      useJira: true,
      url: 'https://api.atlassian.com',
      access_token: accessToken,
      cloudId: resourceId,
    };

    await this.databaseService.addDataset(dataset);

    this.router.navigate(['/']);
  }

}
