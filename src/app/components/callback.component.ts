import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {CALLBACK_JIRA_CLOUD, CALLBACK_JIRA_DATA_CENTER} from "../app-routing.module";
import {JiraCloudService} from "../services/jira-cloud.service";
import {JiraDataCenterService} from "../services/jira-data-center.service";
import {ToastrService} from "ngx-toastr";


@Component({
  selector: 'app-your-existing-component',
  template: '',
  standalone: true
})
export class CallbackComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jiraCloudService: JiraCloudService,
    private jiraDataCenterService: JiraDataCenterService,
    private toastService: ToastrService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const authorizationCode = params['code'];
      if (authorizationCode) {
        if (this.route.snapshot.routeConfig?.path === CALLBACK_JIRA_CLOUD) {
          this.jiraCloudService.handleCallback(authorizationCode).then(() => {
            this.toastService.success('Jira Cloud successfully connected');
            this.router.navigate(['/settings']);
            this.toastService.success('Jira Cloud successfully connected');
          }).catch(error => {
            this.toastService.error('Jira Cloud has an error', error);
          });
        } else if (this.route.snapshot.routeConfig?.path === CALLBACK_JIRA_DATA_CENTER) {
          this.jiraDataCenterService.handleCallback(authorizationCode).then(() => {
            this.router.navigate(['/settings']);
            this.toastService.success('Jira Data Center successfully connected');
          }).catch(error => {
            this.toastService.error('Jira Data Center has an error', error);
          });
        }
      }
    });
  }
}
