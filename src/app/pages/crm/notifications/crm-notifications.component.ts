import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';

import {
  CrmStorageService,
  SystemNotification
} from '../../../shared/services/crm-storage.service';

@Component({
  selector: 'app-crm-notifications',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageBreadcrumbComponent
  ],
  template: `
    <div class="space-y-6">
      <app-page-breadcrumb pageTitle="Alerts & Notification Desk" />

      <!-- Layout Split: Notifications list + Gateway Log triggers -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Main Notifications Desk -->
        <div class="lg:col-span-2 p-6 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800 space-y-4">
          <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
            <div class="flex items-center gap-3">
              <h3 class="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider">In-App Alerts</h3>
              <div class="flex bg-gray-150 dark:bg-gray-850 rounded-lg p-0.5 text-[10px]">
                <button (click)="activeFilter = 'all'" [ngClass]="{'bg-white dark:bg-gray-700 font-semibold shadow-sm': activeFilter === 'all'}" class="px-2 py-1 rounded transition">All</button>
                <button (click)="activeFilter = 'unread'" [ngClass]="{'bg-white dark:bg-gray-700 font-semibold shadow-sm': activeFilter === 'unread'}" class="px-2 py-1 rounded transition">Unread ({{ getUnreadCount() }})</button>
              </div>
            </div>
            
            <div class="flex items-center gap-2">
              <button (click)="markAllAsRead()" class="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">Mark all read</button>
              <span class="text-gray-300 dark:text-gray-700">|</span>
              <button (click)="clearAll()" class="text-xs font-semibold text-red-500 hover:underline">Clear all</button>
            </div>
          </div>

          <!-- List -->
          <div class="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            @for (item of filteredNotifs; track item.id) {
              <div [ngClass]="{'bg-blue-50/50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900': !item.isRead, 'bg-gray-50 border-gray-100 dark:bg-gray-850 dark:border-gray-850': item.isRead}" class="p-4 rounded-xl border flex items-start justify-between gap-3 relative transition hover:shadow-sm">
                
                <div class="space-y-1 text-xs">
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] font-semibold text-gray-400">{{ item.createdAt | date:'medium' }}</span>
                    @if (!item.isRead) {
                      <span class="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                    }
                  </div>
                  <p class="text-gray-800 dark:text-gray-250 font-medium whitespace-pre-line">{{ item.message }}</p>
                </div>

                <div class="flex items-center gap-1.5">
                  @if (!item.isRead) {
                    <button (click)="markAsRead(item.id)" class="px-2 py-1 text-[10px] bg-white border dark:bg-gray-850 dark:border-gray-700 font-semibold rounded hover:bg-gray-50 dark:hover:bg-gray-800" title="Mark as read">
                      ✓ Read
                    </button>
                  }
                  <button (click)="deleteNotif(item.id)" class="p-1 text-gray-400 hover:text-red-500 rounded" title="Delete record">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </div>
            } @empty {
              <p class="text-xs text-gray-400 text-center py-12">No notifications found.</p>
            }
          </div>
        </div>

        <!-- Gateway Logs triggers -->
        <div class="p-6 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800 space-y-4">
          <div class="border-b border-gray-100 dark:border-gray-800 pb-3">
            <h3 class="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider">Gateway log triggers</h3>
          </div>
          <p class="text-xs text-gray-400">Real-time status of outgoing system automation events dispatched to Twilio SMS and SMTP mail services.</p>

          <div class="space-y-3 max-h-[450px] overflow-y-auto pr-1">
            @for (log of getGatewayLogs(); track log.id) {
              <div class="p-3 bg-gray-50 dark:bg-gray-850 border border-gray-150 dark:border-gray-800 rounded-xl space-y-2 text-xs">
                <div class="flex justify-between items-center">
                  <span class="text-[9px] font-bold uppercase" [ngClass]="log.status === 'Sent' ? 'text-green-600' : 'text-yellow-600'">
                    ● {{ log.status }}
                  </span>
                  <span class="text-[9px] text-gray-400">{{ log.time }}</span>
                </div>
                <p class="text-gray-800 dark:text-gray-250 font-semibold">{{ log.action }}</p>
                <div class="text-[10px] text-gray-400 flex justify-between">
                  <span>Channel: {{ log.channel }}</span>
                  <span>Recipient: {{ log.recipient }}</span>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class CrmNotificationsComponent implements OnInit, OnDestroy {

  private sub = new Subscription();
  notifs: SystemNotification[] = [];
  filteredNotifs: SystemNotification[] = [];
  activeFilter: 'all' | 'unread' = 'all';

  constructor(private crmStorage: CrmStorageService) { }

  ngOnInit() {
    this.sub.add(this.crmStorage.getNotifications$().subscribe(list => {
      this.notifs = list;
      this.filterNotifs();
    }));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  getUnreadCount(): number {
    return this.notifs.filter(n => !n.isRead).length;
  }

  setFilter(filter: 'all' | 'unread') {
    this.activeFilter = filter;
    this.filterNotifs();
  }

  filterNotifs() {
    if (this.activeFilter === 'unread') {
      this.filteredNotifs = this.notifs.filter(n => !n.isRead);
    } else {
      this.filteredNotifs = this.notifs;
    }
    // Sort latest first
    this.filteredNotifs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  markAsRead(id: string) {
    this.crmStorage.markNotificationRead(id);
  }

  markAllAsRead() {
    this.crmStorage.markAllNotificationsRead();
  }

  clearAll() {
    if (confirm('Are you sure you want to clear all in-app notifications?')) {
      this.crmStorage.clearAllNotifications();
    }
  }

  deleteNotif(id: string) {
    this.crmStorage.deleteNotification(id);
  }

  // Gateway log triggers mockup
  getGatewayLogs() {
    return [
      { id: '1', status: 'Sent', time: 'Just now', action: 'WhatsApp: Shoot Calendar Hold Details dispatched', channel: 'WhatsApp Gateway API', recipient: '+91 98200 11223' },
      { id: '2', status: 'Sent', time: '10 mins ago', action: 'Email SMTP: Proforma Invoice generated pdf attachment', channel: 'SMTP Mailer', recipient: 'finance@reliancebrands.com' },
      { id: '3', status: 'Sent', time: '2 hours ago', action: 'SMS: Payment Receipt verification alert', channel: 'Twilio SMS Gateway', recipient: '+91 99999 88888' },
      { id: '4', status: 'Sent', time: '5 hours ago', action: 'WhatsApp: Casting Requirement details notification', channel: 'WhatsApp Gateway API', recipient: '+91 91234 56789' }
    ];
  }
}
