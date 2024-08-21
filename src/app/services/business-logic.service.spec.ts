// business-logic.service.spec.ts
import {TestBed} from '@angular/core/testing';
import {BusinessLogicService} from './business-logic.service';
import {StorageService} from './storage.service';
import {IssueHistory} from '../models/issueHistory';
import {Status, StatusCategory} from '../models/status';
import {CycleTimeEntry} from "../models/cycleTimeEntry";
import {Issue} from "../models/issue";

describe('BusinessLogicService', () => {
  let service: BusinessLogicService;
  let storageService: jasmine.SpyObj<StorageService>;

  beforeEach(() => {
    const storageServiceSpy = jasmine.createSpyObj('StorageService', ['getAllStatuses', 'getAllIssueHistoriesForIssue']);

    TestBed.configureTestingModule({
      providers: [
        BusinessLogicService,
        {provide: StorageService, useValue: storageServiceSpy}
      ]
    });

    service = TestBed.inject(BusinessLogicService);
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
  });

  it('should map issue histories to cycle time entries', async () => {
    const issue: Issue = {
      id: 1,
      issueKey: 'ISSUE-1',
      title: 'Test Issue',
      datasourceId: 1,
      createdDate: new Date('2023-01-01'),
      status: 'Done',
      externalStatusId: 3,
      url: 'http://example.com'
    };

    const issueHistories: IssueHistory[] = [
      {
        issueId: 1,
        datasourceId: 1,
        field: 'status',
        fromValue: 'To Do',
        fromValueId: 1,
        toValue: 'In Progress',
        toValueId: 2,
        createdDate: new Date('2023-01-02')
      },
      {
        issueId: 1,
        datasourceId: 1,
        field: 'status',
        fromValue: 'In Progress',
        fromValueId: 2,
        toValue: 'Done',
        toValueId: 3,
        createdDate: new Date('2023-01-03')
      }
    ];

    const statuses: Status[] = [
      {externalId: 1, category: StatusCategory.ToDo, datasourceId: 1, name: 'To Do'},
      {externalId: 2, category: StatusCategory.InProgress, datasourceId: 1, name: 'In Progress'},
      {externalId: 3, category: StatusCategory.Done, datasourceId: 1, name: 'Done'}
    ];

    storageService.getAllStatuses.and.returnValue(Promise.resolve(statuses));

    const result = await service.analyzeIssueHistoriesForStatusChanges(issueHistories, issue);

    const expectedCycleTimeEntries: CycleTimeEntry[] = [
      {
        inProgressState: 'In Progress',
        resolvedState: 'Done',
        resolvedDate: new Date('2023-01-03'),
        inProgressDate: new Date('2023-01-02'),
        issueId: 1,
        issueKey: 'ISSUE-1',
        title: 'Test Issue',
        cycleTime: 1, // 1 day between 2023-01-02 and 2023-01-03
        status: 'Done',
        externalStatusId: 3,
        externalResolvedStatusId: 3,
        externalInProgressStatusId: 2,
        datasourceId: 1
      }
    ];

    expect(result.cycleTEntries).toEqual(expectedCycleTimeEntries);
  });

  it('if issue was reopened, it must contains two cycletime entries', async () => {
    const issue: Issue = {
      id: 1,
      issueKey: 'ISSUE-1',
      title: 'Test Issue',
      datasourceId: 1,
      createdDate: new Date('2023-01-01'),
      status: 'Done',
      externalStatusId: 3,
      url: 'http://example.com'
    };

    const issueHistories: IssueHistory[] = [
      {
        issueId: 1,
        datasourceId: 1,
        field: 'status',
        fromValue: 'To Do',
        fromValueId: 1,
        toValue: 'In Progress',
        toValueId: 2,
        createdDate: new Date('2023-01-02')
      },
      {
        issueId: 1,
        datasourceId: 1,
        field: 'status',
        fromValue: 'In Progress',
        fromValueId: 2,
        toValue: 'Done',
        toValueId: 3,
        createdDate: new Date('2023-01-03')
      },
      {
        issueId: 1,
        datasourceId: 1,
        field: 'status',
        fromValue: 'Done',
        fromValueId: 3,
        toValue: 'In Progress',
        toValueId: 2,
        createdDate: new Date('2023-01-04')
      },
      {
        issueId: 1,
        datasourceId: 1,
        field: 'status',
        fromValue: 'In Progress',
        fromValueId: 2,
        toValue: 'Done',
        toValueId: 3,
        createdDate: new Date('2023-01-06')
      },
    ];

    const statuses: Status[] = [
      {externalId: 1, category: StatusCategory.ToDo, datasourceId: 1, name: 'To Do'},
      {externalId: 2, category: StatusCategory.InProgress, datasourceId: 1, name: 'In Progress'},
      {externalId: 3, category: StatusCategory.Done, datasourceId: 1, name: 'Done'}
    ];

    storageService.getAllStatuses.and.returnValue(Promise.resolve(statuses));

    const result = await service.analyzeIssueHistoriesForStatusChanges(issueHistories, issue);

    const expectedCycleTimeEntries: CycleTimeEntry[] = [
      {
        inProgressState: 'In Progress',
        resolvedState: 'Done',
        resolvedDate: new Date('2023-01-03'),
        inProgressDate: new Date('2023-01-02'),
        issueId: 1,
        issueKey: 'ISSUE-1',
        title: 'Test Issue',
        cycleTime: 1, // 1 day between 2023-01-02 and 2023-01-03
        status: 'Done',
        externalStatusId: 3,
        externalResolvedStatusId: 3,
        externalInProgressStatusId: 2,
        datasourceId: 1
      },
      {
        inProgressState: 'In Progress',
        resolvedState: 'Done',
        resolvedDate: new Date('2023-01-06'),
        inProgressDate: new Date('2023-01-04'),
        issueId: 1,
        issueKey: 'ISSUE-1',
        title: 'Test Issue',
        cycleTime: 2, // 1 day between 2023-01-04 and 2023-01-06
        status: 'Done',
        externalStatusId: 3,
        externalResolvedStatusId: 3,
        externalInProgressStatusId: 2,
        datasourceId: 1
      }
    ];

    expect(result.cycleTEntries).toEqual(expectedCycleTimeEntries);
  });
});
