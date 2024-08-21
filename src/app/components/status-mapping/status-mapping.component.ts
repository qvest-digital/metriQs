import {Component, OnInit} from '@angular/core';
import {CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {Status, StatusCategory} from '../../models/status';
import {StorageService} from '../../services/storage.service';
import {NgForOf} from "@angular/common";
import {MatChip} from "@angular/material/chips";
import {ToastrService} from "ngx-toastr";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-status-mapping',
  templateUrl: './status-mapping.component.html',
  standalone: true,
  imports: [
    CdkDropList,
    NgForOf,
    MatChip,
    CdkDrag
  ],
  styleUrls: ['./status-mapping.component.scss']
})
export class StatusMappingComponent implements OnInit {
  statuses: Status[] = [];
  statusCategories = Object.values(StatusCategory);
  connectedDropLists: string[] = [];
  datasourceId?: number;

  constructor(private storageService: StorageService, private toastr: ToastrService, private route: ActivatedRoute,
              private router: Router,) {
  }

  async ngOnInit() {
    this.datasourceId = +this.route.snapshot.paramMap.get('id')!;
    if (this.datasourceId !== undefined && this.datasourceId > 0) {
      this.statuses = await this.storageService.getAllStatuses(this.datasourceId);
      this.connectedDropLists = ['uncategorized', ...this.statusCategories.map(category => category)];
    }

  }

  async drop(event: CdkDragDrop<Status[]>, categoryName: string) {
    const formattedCategoryName = categoryName.replace(/\s+/g, '');
    const category = formattedCategoryName ? StatusCategory[formattedCategoryName as keyof typeof StatusCategory] : undefined;
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
      event.container.data[event.currentIndex].category = category;
    }
    // Set the order based on the new position
    event.container.data.forEach((status, index) => {
      status.order = index;
    });
    await this.storageService.updateStatus(event.container.data[event.currentIndex]);
    this.toastr.success('Status updated');
  }

  getStatusesByCategory(category: string): Status[] {
    return this.statuses
      .filter(status => status.category === category)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  getUncategorizedStatuses(): Status[] {
    return this.statuses
      .filter(status => !status.category)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }
}
