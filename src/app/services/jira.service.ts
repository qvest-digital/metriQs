// src/app/services/jira.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { DatabaseService } from './database.service';
import {Issue} from "../models/issue";
import {Version3Client} from "jira.js";

@Injectable({
  providedIn: 'root',
})
export class JiraService {
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private databaseService: DatabaseService
  ) {}

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
      jql: 'project=10000',
      fields: ['status', 'statuscategorychangedate'],
      expand: ['changelog'],
    });


          // Manually map the response to Issue objects
      const issues: Issue[] = response!.issues!.map((issue: any) => ({
        id: issue.id,
        key: issue.key,
        title: issue.title,
        //FIXME: This is not the correct field value
        dataSetId: 1,
      }));

      return issues;
    } else {
      throw new Error('No config found or access token missing');
    }
  }
}
