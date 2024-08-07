// src/app/services/jira.service.ts
import {Injectable} from '@angular/core';
import {StorageService} from './storage.service';
import {Issue} from "../models/issue";
import {Version3Client} from "jira.js";
import  *  as Version3 from 'jira.js/out/version3';
import {ToastrService} from "ngx-toastr";

@Injectable({
  providedIn: 'root',
})
export class JiraService {
  constructor(
    private databaseService: StorageService,
    private toastr: ToastrService
  ) {
  }

  async getIssues(): Promise<Issue[]> {
    const config = await this.databaseService.getDataset();

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
