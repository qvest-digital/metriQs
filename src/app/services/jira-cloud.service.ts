// src/app/services/jira.service.ts
import {Injectable, OnInit} from '@angular/core';
import {StorageService} from './storage.service';
import {Issue} from "../models/issue";
import {Version2Client, Version3Client} from "jira.js";
import *  as Version3 from 'jira.js/out/version3';
import {ToastrService} from "ngx-toastr";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "./auth.service";
import {environment} from "../../environments/environment";
import {firstValueFrom} from "rxjs";
import {Dataset, DataSetType} from "../models/dataset";
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {CALLBACK_JIRA_CLOUD} from "../app-routing.module";
/*
see https://developer.atlassian.com/cloud/jira/platform/oauth-2-3lo-apps/
 */
@Injectable({
  providedIn: 'root',
})
export class JiraCloudService implements OnInit {
  private authUrl: string = 'https://auth.atlassian.com/authorize';
  private clientId = environment.jira_cloud_clientId;
  private clientSecret = environment.jira_cloud_clientSecret;
  private redirectUri = (environment.production ? `https://qvest-digital.github.io/metriQs/` : 'http://localhost:4200/') + CALLBACK_JIRA_CLOUD;

  constructor(
    private http: HttpClient,
    private databaseService: StorageService,
    private toastr: ToastrService,
    private route: ActivatedRoute, private router: Router, private authService: AuthService
  ) {}

  login() {
    const params = new HttpParams()
      .set('client_id', this.clientId)
      .set('response_type', 'code')
      .set('redirect_uri', this.redirectUri)
      .set('scope', 'read:jira-user read:jira-work');

    window.location.href = `${this.authUrl}?${params.toString()}`;
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const authorizationCode = params['code'];
      if (authorizationCode) {
        this.handleCallback(authorizationCode);
      }
    });
  }

  async handleCallback(code: string): Promise<void> {
    const body = new HttpParams()
      .set('grant_type', 'authorization_code')
      .set('client_id', this.clientId)
      .set('client_secret', this.clientSecret)
      .set('code', code)
      .set('redirect_uri', this.redirectUri);

    const tokenUrl = 'https://auth.atlassian.com/oauth/token';
    const tokenResponse: any = await firstValueFrom(this.http.post(tokenUrl, body.toString(), {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
    }));

    const accessToken = tokenResponse.access_token;
    const resourceUrl = 'https://api.atlassian.com/oauth/token/accessible-resources';
    const resourceResponse: any = await firstValueFrom(this.http.get(resourceUrl, {
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
      name: 'Jira Cloud Dataset',
    };

    await this.databaseService.addDataset(dataset);

    this.router.navigate(['/settings']);
  }

  async getIssues(): Promise<Issue[]> {
    const config = await this.databaseService.getFirstDataset();

    if (config !== null && config?.access_token) {
      const client = new Version3Client({
        host: `https://api.atlassian.com/ex/jira/${config?.cloudId}`,
        authentication: {
          oauth2: {
            accessToken: config.access_token!,
          },
        },
      });

      const response = await client.issueSearch.searchForIssuesUsingJqlPost({
        jql: config.jql,
        fields: ['status', 'created', 'summary', 'issueType', 'statuscategorychangedate'],
        expand: ['changelog'],
      });
      // Manually map the response to Issue objects
      const issues: Issue[] = response!.issues!.map((issue: Version3.Version3Models.Issue) => ({
        issueKey: issue.key,
        title: issue.fields.summary,
        dataSetId: config.id!,
        createdDate: new Date(issue.fields.created),
        status: issue.fields.status!.name!,
        url: issue.self!,
      }));

      return issues;
    } else {
      this.toastr.error('No config found or access token missing');
      throw new Error('No config found or access token missing');
    }
  }
}
