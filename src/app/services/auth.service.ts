// src/app/services/auth.service.ts
import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Router} from '@angular/router';
import {StorageService} from './storage.service';
import {Dataset, DataSetType} from '../models/dataset';
import {environment} from "../../environments/environment";
import {firstValueFrom} from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private clientId = environment.jira_cloud_clientId;
  private clientSecret = environment.jira_cloud_clientSecret;
  private redirectUri = environment.jira_cloud_callback_url;
  private authUrl = 'https://auth.atlassian.com/authorize';
  private tokenUrl = 'https://auth.atlassian.com/oauth/token';
  private resourceUrl = 'https://api.atlassian.com/oauth/token/accessible-resources';

  constructor(private http: HttpClient, private router: Router, private databaseService: StorageService) {}

  private randomString(length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  loginToDataCenter() {
    const codeVerifier = this.randomString(100);
    const params = new HttpParams()
      .set('client_id', environment.jira_data_center_clientId)
      .set('response_type', 'code')
      .set('redirect_uri', environment.jira_cloud_callback_url)
      .set('state', 'myState')
      .set('code_challenge', codeVerifier)
      .set('code_challenge_method', 'plain')
      .set('scope', 'READ');

    const dataCenterUrl = 'http://localhost:8080/rest/oauth2/latest/authorize';
    const fullUrl = `${dataCenterUrl}?${params.toString()}`;
    window.location.href = fullUrl;
  }

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

    const tokenResponse: any = await firstValueFrom(this.http.post(this.tokenUrl, body.toString(), {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
    }));

    const accessToken = tokenResponse.access_token;

    const resourceResponse: any = await firstValueFrom(this.http.get(this.resourceUrl, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      }),
    }));

    const resourceId = resourceResponse[0].id;

    const dataset: Dataset = {
      type: DataSetType.JIRA_CLOUD,
      baseUrl: 'https://api.atlassian.com',
      access_token: accessToken,
      cloudId: resourceId,
      jql: 'project = 10000 and status IN ("In Progress")',
    };

    await this.databaseService.addDataset(dataset);

    this.router.navigate(['/settings']);
  }

}
