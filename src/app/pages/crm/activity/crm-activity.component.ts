import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { BadgeComponent } from '../../../shared/components/ui/badge/badge.component';

import {
  CrmStorageService,
  ActivityLog
} from '../../../shared/services/crm-storage.service';

@Component({
  selector: 'app-crm-activity',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageBreadcrumbComponent,
    BadgeComponent
  ],
  template: `
    <div class="space-y-6">
      <app-page-breadcrumb pageTitle="Security Activity Logs" />

      <!-- Controls Row -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800">
        <!-- Search -->
        <input type="text" [(ngModel)]="searchQuery" (input)="filterLogs()" placeholder="Search Activity or User..." class="h-10 px-4 rounded-lg border border-gray-300 bg-transparent text-sm dark:border-gray-700 dark:text-white placeholder:text-gray-400 focus:outline-none w-72">
        
        <!-- Clear Logs -->
        <button (click)="clearLogs()" class="px-4 py-2 text-xs font-semibold text-white bg-red-650 hover:bg-red-700 rounded-lg transition">
          Clear Audit Trail
        </button>
      </div>

      <!-- Logs Table -->
      <div class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div class="max-w-full overflow-x-auto">
          <table class="min-w-full">
            <thead class="border-b border-gray-100 dark:border-white/[0.05]">
              <tr class="bg-gray-50 dark:bg-gray-850">
                <th class="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400">Timestamp</th>
                <th class="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400">Author Role</th>
                <th class="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400">Action Category</th>
                <th class="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400">Detailed Description</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-white/[0.05]">
              @for (log of filteredLogs; track log.id) {
                <tr class="hover:bg-gray-50/50 dark:hover:bg-gray-850/50 transition">
                  <td class="px-5 py-4 text-xs text-gray-400">
                    {{ log.timestamp | date:'medium' }}
                  </td>
                  <td class="px-5 py-4 text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {{ log.userIP }}
                  </td>
                  <td class="px-5 py-4">
                    <app-badge size="sm" [color]="getActionColor(log.action)">{{ log.action }}</app-badge>
                  </td>
                  <td class="px-5 py-4 text-xs text-gray-650 dark:text-gray-300">
                    {{ log.description }}
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="4" class="px-5 py-8 text-center text-gray-400 text-sm">No activity recorded.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class CrmActivityComponent implements OnInit, OnDestroy {

  private sub = new Subscription();
  logs: ActivityLog[] = [];
  filteredLogs: ActivityLog[] = [];
  searchQuery: string = '';

  constructor(private crmStorage: CrmStorageService) { }

  ngOnInit() {
    this.sub.add(this.crmStorage.getActivityLogs$().subscribe(list => {
      this.logs = list;
      this.filterLogs();
    }));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  getActionColor(action: ActivityLog['action']): 'success' | 'warning' | 'error' | 'primary' | 'info' {
    if (action === 'Create') return 'success';
    if (action === 'Update') return 'primary';
    if (action === 'Delete') return 'error';
    if (action === 'Payment' || action === 'Booking') return 'info';
    return 'warning';
  }

  filterLogs() {
    let list = [...this.logs];
    // Sort latest first
    list.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(l =>
        l.description.toLowerCase().includes(q) ||
        l.userIP.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q)
      );
    }
    this.filteredLogs = list;
  }

  clearLogs() {
    if (confirm('Are you sure you want to completely clear the security audit logs? This action is irreversible.')) {
      this.crmStorage.clearActivityLogs();
    }
  }
}
