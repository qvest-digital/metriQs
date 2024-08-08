// src/app/services/jira.service.ts
import {Injectable, OnInit} from '@angular/core';
import {StorageService} from './storage.service';
import {Issue} from "../models/issue";
import {Version2Client, Version3Client} from "jira.js";
import  *  as Version3 from 'jira.js/out/version3';
import {ToastrService} from "ngx-toastr";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "./auth.service";

@Injectable({
  providedIn: 'root',
})
export class JiraDataCenterService implements OnInit {
  constructor(
    private databaseService: StorageService,
    private toastr: ToastrService,
    private route: ActivatedRoute, private router: Router, private authService: AuthService
  ) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      if (code) {
        this.authService.handleCallback(code);
      }
    });
  }

  async getIssues(): Promise<Issue[]> {
    const config = await this.databaseService.getFirstDataset();

    if (config !== null && config?.access_token) {
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
