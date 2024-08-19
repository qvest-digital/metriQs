// src/app/services/jira.service.ts
import {Injectable, OnInit} from '@angular/core';
import {StorageService} from './storage.service';
import {Issue} from "../models/issue";
import {Version2, Version2Client, Version3Client} from "jira.js";
import {ToastrService} from "ngx-toastr";
import {ActivatedRoute, Router} from "@angular/router";
import {environment} from "../../environments/environment";
import {firstValueFrom} from "rxjs";
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {CALLBACK_JIRA_CLOUD, DASHBOARD, MANAGE_DATASETS} from "../app-routing.module";
import {BusinessLogicService} from "./business-logic.service";

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
    private storageService: StorageService,
    private toastr: ToastrService,
    private route: ActivatedRoute, private router: Router,
    private businessLogicService: BusinessLogicService
  ) {
  }

  login(dataSetId: number) {
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
    const appSettings = await this.storageService.getAppSettings();
    const dataset = await this.storageService.getDataset(appSettings.selectedDatasetId);
    dataset.access_token = accessToken;
    dataset.cloudId = resourceId;
    await this.storageService.updateDataset(dataset);
    this.toastr.success('Successfully logged in to Jira');
    await this.router.navigate([MANAGE_DATASETS, appSettings.selectedDatasetId]);
  }

  async getAndSaveIssues(dataSetId: number): Promise<Issue[]> {
    const dataset = await this.storageService.getDataset(dataSetId);

    if (dataset !== null && dataset?.access_token) {
      const client = new Version3Client({
        host: `https://api.atlassian.com/ex/jira/${dataset?.cloudId}`,
        authentication: {
          oauth2: {
            accessToken: dataset.access_token!,
          },
        },
      });
      try {
        const response = await client.issueSearch.searchForIssuesUsingJqlPost({
          jql: dataset.jql,
          fields: ['status', 'created', 'summary', 'issueType', 'statuscategorychangedate'],
          expand: ['changelog', 'names'],
        });

        //if response successfully received, clear all data
        await this.storageService.clearAllData();

        // Manually map the response to Issue objects
        const issues: Issue[] = [];
        for (const issue of response!.issues!) {
          let i: Issue = {
            issueKey: issue.key,
            title: issue.fields.summary,
            dataSetId: dataset.id!,
            createdDate: new Date(issue.fields.created),
            status: issue.fields.status!.name!,
            externalStatusId: Number.parseInt(issue.fields.status!.id!),
            url: issue.self!,
          };
          i = await this.storageService.addissue(i);
          issues.push(i);
          const issueHistories = this.businessLogicService.mapChangelogToIssueHistory(i, issue.changelog as Version2.Version2Models.Changelog);
          await this.storageService.addIssueHistories(issueHistories);

          const wiAge = await this.businessLogicService.map2WorkItemAgeEntries([i]);
          await this.storageService.addWorkItemAgeData(wiAge);

          const cycleTime = this.businessLogicService.map2CycleTimeEntries(issueHistories, i);
          await this.storageService.addCycleTimeEntries(cycleTime);
        }
        const allHistories = await this.storageService.getAllIssueHistories();

        let newStatesFound = this.businessLogicService.findAllNewStatuses(issues, allHistories);
        const allStatuses = await this.storageService.getAllStatuses();

        newStatesFound = this.businessLogicService.filterOutMappedStatuses(newStatesFound, allStatuses);
        await this.storageService.addStatuses(newStatesFound);

        return issues;
      } catch (error) {
        this.toastr.error('Failed to fetch issues from Jira', error!.toString());
        console.error('Error fetching issues:', error);
        throw new Error('Error fetching issues from Jira');
      }
    } else {
      this.toastr.error('No config found or access token missing');
      throw new Error('No config found or access token missing');
    }
  }


}
