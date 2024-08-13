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
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {firstValueFrom} from "rxjs";
import {Dataset, DataSetType} from "../models/dataset";
import {CALLBACK_JIRA_CLOUD, CALLBACK_JIRA_DATA_CENTER} from "../app-routing.module";


/*
see https://confluence.atlassian.com/adminjiraserver0912/jira-oauth-2-0-provider-api-1346046945.html
 */
@Injectable({
  providedIn: 'root',
})
export class JiraDataCenterService implements OnInit {
  private clientId = environment.jira_data_center_clientId;
  private clientSecret = environment.jira_data_center_clientSecret;
  private redirectUri = (environment.production ? `https://qvest-digital.github.io/metriQs/` : 'http://localhost:4200/') + CALLBACK_JIRA_DATA_CENTER;


  constructor(
    private http: HttpClient,
    private databaseService: StorageService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router, private authService: AuthService
  ) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const authorizationCode = params['code'];
      if (authorizationCode) {
        this.handleCallback(authorizationCode);
      }
    });
  }

  login() {
    const authUrl: string = 'https://jira-staging.qvest-digital.com/rest/oauth2/latest/authorize';
    const code_verifier = this.authService.randomString(100);

    const params = new HttpParams()
      .set('client_id', this.clientId)
      .set('response_type', 'code')
      .set('redirect_uri', this.redirectUri)
      .set('scope', 'READ')
      .set('code_challenge', code_verifier)
      .set('code_challenge_method', 'plain');

    window.location.href = `${authUrl}?${params.toString()}`;

  }

  async handleCallback(code: string): Promise<void> {

    //retrieve a new access_token
    const body = new HttpParams()
      .set('grant_type', 'authorization_code')
      .set('client_id', this.clientId)
      .set('client_secret', this.clientSecret)
      .set('code', code)
      .set('redirect_uri', this.redirectUri);

    const tokenUrl = 'https://atlassian.example.com/rest/oauth2/latest/token';
    const tokenResponse
      :
      any = await firstValueFrom(this.http.post(tokenUrl, body.toString(), {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
    }));

    const accessToken = tokenResponse.access_token;

    const dataset: Dataset = {
      type: DataSetType.JIRA_CLOUD,
      baseUrl: 'https://api.atlassian.com',
      access_token: accessToken,
      jql: 'project = 10000 and status IN ("In Progress")',
    };

    await this.databaseService.addDataset(dataset);

    this.router.navigate(['/settings']);
  }

  async getIssues(): Promise<Issue[]> {
    const config = await this.databaseService.getFirstDataset();

    if (config !== null && config?.access_token
    ) {
      const client = new Version3Client({
        host: 'https://jira.qvest-digital.com',
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
