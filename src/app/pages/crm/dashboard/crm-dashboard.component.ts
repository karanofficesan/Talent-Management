import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NgApexchartsModule } from 'ng-apexcharts';

import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ModalComponent } from '../../../shared/components/ui/modal/modal.component';
import { BadgeComponent } from '../../../shared/components/ui/badge/badge.component';

import {
  CrmStorageService,
  Party,
  Model,
  Requirement,
  Booking,
  Quotation,
  ActivityLog,
  FollowUp,
  MastersData
} from '../../../shared/services/crm-storage.service';

@Component({
  selector: 'app-crm-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NgApexchartsModule,
    PageBreadcrumbComponent,
    ModalComponent,
    BadgeComponent
  ],
  template: `
    <div class="space-y-6">
      <app-page-breadcrumb pageTitle="Talent Dashboard" />

      <!-- Quick Actions Bar -->
      <div class="flex flex-wrap gap-3 p-4 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800">
        <h4 class="w-full text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">Quick Actions</h4>
        <button (click)="openQuickModal('party')" class="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
          Add Party
        </button>
        <button (click)="openQuickModal('model')" class="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
          Add Model
        </button>
        <button (click)="openQuickModal('requirement')" class="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
          Add Requirement
        </button>
        <button (click)="openQuickModal('quotation')" class="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          Create Quotation
        </button>
        <button (click)="openQuickModal('booking')" class="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          Add Booking
        </button>
      </div>

      <!-- KPI Grid -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <!-- Models -->
        <div class="p-4 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800">
          <span class="text-xs font-medium text-gray-400 block mb-1">Models (Nat / Intl)</span>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-bold text-gray-800 dark:text-white">{{ kpis.totalModels }}</span>
            <span class="text-xs text-gray-500">({{ kpis.nationalModels }} / {{ kpis.internationalModels }})</span>
          </div>
          <span class="text-xs text-green-500 mt-2 block">{{ kpis.availableModels }} Available / {{ kpis.bookedModels }} Booked</span>
        </div>

        <!-- Parties -->
        <div class="p-4 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800">
          <span class="text-xs font-medium text-gray-400 block mb-1">Active Partners</span>
          <div class="text-2xl font-bold text-gray-800 dark:text-white">
            {{ kpis.activeClients + kpis.activeVendors }}
          </div>
          <span class="text-xs text-gray-500 mt-2 block">{{ kpis.activeClients }} Clients | {{ kpis.activeVendors }} Vendors</span>
        </div>

        <!-- Pipeline -->
        <div class="p-4 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800">
          <span class="text-xs font-medium text-gray-400 block mb-1">Pipeline & Leads</span>
          <div class="text-2xl font-bold text-gray-800 dark:text-white">
            {{ kpis.openRequirements + kpis.pendingQuotations }}
          </div>
          <span class="text-xs text-gray-500 mt-2 block">{{ kpis.openRequirements }} Req | {{ kpis.pendingQuotations }} Quotes</span>
        </div>

        <!-- Billing -->
        <div class="p-4 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800">
          <span class="text-xs font-medium text-gray-400 block mb-1">Pending Invoices</span>
          <div class="text-2xl font-bold text-gray-800 dark:text-white">
            {{ kpis.pendingInvoices }}
          </div>
          <span class="text-xs text-red-500 mt-2 block font-medium">Out: ₹{{ kpis.outstandingPayments | number:'1.0-0' }}</span>
        </div>

        <!-- Finance -->
        <div class="p-4 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800">
          <span class="text-xs font-medium text-gray-400 block mb-1">Monthly Revenue</span>
          <div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            ₹{{ kpis.monthlyRevenue | number:'1.0-0' }}
          </div>
          <span class="text-xs text-gray-500 mt-2 block">Profit: ₹{{ kpis.monthlyProfit | number:'1.0-0' }}</span>
        </div>
      </div>

      <!-- Charts & Schedules -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Revenue Trend Chart -->
        <div class="lg:col-span-2 p-6 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-semibold text-gray-800 dark:text-white">Financial Trends</h3>
            <!-- Tabs -->
            <div class="flex items-center gap-0.5 rounded-lg bg-gray-100 dark:bg-gray-900 p-0.5 text-xs">
              <button
                (click)="activeTrend = 'revenue'"
                [ngClass]="activeTrend === 'revenue' ? 'shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800 font-semibold' : 'text-gray-500 dark:text-gray-400'"
                class="px-3 py-1.5 rounded-md transition hover:text-gray-900 dark:hover:text-white"
              >
                Revenue
              </button>
              <button
                (click)="activeTrend = 'booking'"
                [ngClass]="activeTrend === 'booking' ? 'shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800 font-semibold' : 'text-gray-500 dark:text-gray-400'"
                class="px-3 py-1.5 rounded-md transition hover:text-gray-900 dark:hover:text-white"
              >
                Bookings
              </button>
            </div>
          </div>

          @if (activeTrend === 'revenue') {
            <apx-chart
              [series]="revenueChartOptions.series!"
              [chart]="revenueChartOptions.chart!"
              [xaxis]="revenueChartOptions.xaxis!"
              [stroke]="revenueChartOptions.stroke!"
              [colors]="revenueChartOptions.colors!"
              [fill]="revenueChartOptions.fill!"
              [dataLabels]="revenueChartOptions.dataLabels!"
              [yaxis]="revenueChartOptions.yaxis!"
              [tooltip]="revenueChartOptions.tooltip!">
            </apx-chart>
          } @else {
            <apx-chart
              [series]="bookingChartOptions.series!"
              [chart]="bookingChartOptions.chart!"
              [xaxis]="bookingChartOptions.xaxis!"
              [plotOptions]="bookingChartOptions.plotOptions!"
              [colors]="bookingChartOptions.colors!"
              [dataLabels]="bookingChartOptions.dataLabels!"
              [yaxis]="bookingChartOptions.yaxis!">
            </apx-chart>
          }
        </div>

        <!-- Upcoming Shoots -->
        <div class="p-6 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800 flex flex-col">
          <h3 class="text-base font-semibold text-gray-800 dark:text-white mb-4">Upcoming Shoots</h3>
          <div class="space-y-4 flex-1 overflow-y-auto max-h-[300px] pr-2">
            @for (shoot of upcomingShoots; track shoot.id) {
              <div class="p-3 bg-gray-50 dark:bg-gray-850 rounded-xl border border-gray-100 dark:border-gray-800">
                <div class="flex justify-between items-start">
                  <h5 class="text-sm font-semibold text-gray-800 dark:text-white">{{ getPartyName(shoot.customerId) }}</h5>
                  <app-badge size="sm" [color]="shoot.status === 'Confirmed' ? 'success' : 'warning'">
                    {{ shoot.status }}
                  </app-badge>
                </div>
                <div class="text-xs text-gray-500 mt-1.5 space-y-1">
                  <p>📅 Date: {{ shoot.shootDate | date:'mediumDate' }} ({{ shoot.shootTime }})</p>
                  <p>📍 Venue: {{ shoot.venue }}</p>
                  <p>👤 Models: {{ getModelsNames(shoot.modelIds) }}</p>
                </div>
              </div>
            } @empty {
              <p class="text-sm text-gray-400 text-center py-8">No upcoming shoots scheduled.</p>
            }
          </div>
        </div>
      </div>

      <!-- Lists Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Pending Follow-ups -->
        <div class="p-6 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800">
          <h3 class="text-base font-semibold text-gray-800 dark:text-white mb-4">Follow-up Reminders</h3>
          <div class="space-y-3 max-h-[320px] overflow-y-auto pr-2">
            @for (item of pendingFollowups; track item.id) {
              <div class="p-3 bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 rounded-xl flex gap-3">
                <div class="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg h-fit text-red-600 dark:text-red-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <div class="flex-1">
                  <div class="flex justify-between">
                    <span class="text-xs font-semibold text-red-600 dark:text-red-400">Due: {{ item.followUp.nextFollowUpDate | date:'shortDate' }}</span>
                    <span class="text-theme-xs text-gray-400">{{ item.type }}</span>
                  </div>
                  <h5 class="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-1">{{ item.title }}</h5>
                  <p class="text-xs text-gray-500 line-clamp-2 mt-0.5">{{ item.followUp.discussion }}</p>
                </div>
              </div>
            } @empty {
              <p class="text-sm text-gray-400 text-center py-8">No pending follow-ups today.</p>
            }
          </div>
        </div>

        <!-- Top Performing Models -->
        <div class="p-6 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800">
          <h3 class="text-base font-semibold text-gray-800 dark:text-white mb-4">Top Performing Models</h3>
          <div class="space-y-3 max-h-[320px] overflow-y-auto pr-2">
            @for (model of topModels; track model.id) {
              <div class="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-850 rounded-xl">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400 border border-gray-200 dark:border-gray-700 flex-shrink-0">
                    @if (model.portfolioImages && model.portfolioImages.length > 0) {
                      <img [src]="model.portfolioImages[0]" class="w-full h-full object-cover" alt="{{ model.name }}">
                    } @else {
                      {{ model.name[0] }}
                    }
                  </div>
                  <div>
                    <h5 class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ model.name }}</h5>
                    <span class="text-xs text-gray-400">{{ model.nationality }} | {{ model.gender }}</span>
                  </div>
                </div>
                <div class="text-right">
                  <span class="text-sm font-bold text-gray-800 dark:text-white">₹{{ model.dayRate | number:'1.0-0' }}</span>
                  <p class="text-theme-xs text-gray-400">Day Rate</p>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Recent Activities -->
        <div class="p-6 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800">
          <h3 class="text-base font-semibold text-gray-800 dark:text-white mb-4">Recent Activities</h3>
          <div class="space-y-4 max-h-[320px] overflow-y-auto pr-2">
            @for (log of recentActivities; track log.id) {
              <div class="flex gap-3 text-xs">
                <div class="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                <div class="flex-1">
                  <div class="flex justify-between text-gray-400">
                    <span class="font-semibold text-gray-500 dark:text-gray-300">{{ log.module }}</span>
                    <span>{{ log.timestamp | date:'shortTime' }}</span>
                  </div>
                  <p class="text-gray-600 dark:text-gray-400 mt-0.5">{{ log.description }}</p>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Outstanding Summaries -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Customer Outstanding Summary -->
        <div class="p-6 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800">
          <h3 class="text-base font-semibold text-gray-800 dark:text-white mb-4">Customer Outstanding</h3>
          <div class="overflow-x-auto">
            <table class="min-w-full text-xs">
              <thead>
                <tr class="border-b border-gray-100 dark:border-gray-800 text-gray-400 text-left">
                  <th class="pb-2 font-medium">Customer</th>
                  <th class="pb-2 font-medium">Active Invoices</th>
                  <th class="pb-2 font-medium text-right">Outstanding Amount</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50 dark:divide-gray-850">
                @for (c of customerOuts; track c.id) {
                  <tr>
                    <td class="py-2.5 font-medium text-gray-700 dark:text-gray-300">{{ c.name }}</td>
                    <td class="py-2.5">{{ c.invoiceCount }} Invoices</td>
                    <td class="py-2.5 text-right font-bold text-red-500">₹{{ c.outstanding | number:'1.0-0' }}</td>
                  </tr>
                } @empty {
                  <tr><td colspan="3" class="text-center py-4 text-gray-400">No outstanding customer invoices.</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Vendor Outstanding Summary -->
        <div class="p-6 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800">
          <h3 class="text-base font-semibold text-gray-800 dark:text-white mb-4">Vendor Outstanding Summary</h3>
          <div class="overflow-x-auto">
            <table class="min-w-full text-xs">
              <thead>
                <tr class="border-b border-gray-100 dark:border-gray-800 text-gray-400 text-left">
                  <th class="pb-2 font-medium">Vendor</th>
                  <th class="pb-2 font-medium">Details</th>
                  <th class="pb-2 font-medium text-right">Pending Payouts</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50 dark:divide-gray-850">
                @for (v of vendorOuts; track v.id) {
                  <tr>
                    <td class="py-2.5 font-medium text-gray-700 dark:text-gray-300">{{ v.name }}</td>
                    <td class="py-2.5">{{ v.role }}</td>
                    <td class="py-2.5 text-right font-bold text-amber-600">₹{{ v.pending | number:'1.0-0' }}</td>
                  </tr>
                } @empty {
                  <tr><td colspan="3" class="text-center py-4 text-gray-400">No vendor outstanding payments.</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- QUICK ACTION MODALS -->
    
    <!-- 1. Party Modal -->
    <app-modal [isOpen]="activeModal === 'party'" (close)="closeModal()">
      <div class="p-6 space-y-4">
        <h3 class="text-lg font-bold text-gray-800 dark:text-white">Add Customer / Vendor</h3>
        <form (submit)="saveParty()" class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Company Name *</label>
            <input type="text" [(ngModel)]="partyForm.companyName" name="companyName" required class="h-11 w-full rounded-lg border border-gray-350 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
          </div>
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Contact Person *</label>
            <input type="text" [(ngModel)]="partyForm.contactPerson" name="contactPerson" required class="h-11 w-full rounded-lg border border-gray-350 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
          </div>
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Party Type *</label>
            <select [(ngModel)]="partyForm.partyType" name="partyType" required class="h-11 w-full rounded-lg border border-gray-350 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white dark:bg-gray-900">
              <option value="Customer">Customer</option>
              <option value="Vendor">Vendor</option>
              <option value="Customer + Vendor">Customer + Vendor</option>
            </select>
          </div>
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Mobile *</label>
            <input type="text" [(ngModel)]="partyForm.mobile" name="mobile" required class="h-11 w-full rounded-lg border border-gray-350 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
          </div>
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Email *</label>
            <input type="email" [(ngModel)]="partyForm.email" name="email" required class="h-11 w-full rounded-lg border border-gray-350 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
          </div>
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">GST Number</label>
            <input type="text" [(ngModel)]="partyForm.gstNumber" name="gstNumber" class="h-11 w-full rounded-lg border border-gray-350 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
          </div>
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">PAN</label>
            <input type="text" [(ngModel)]="partyForm.pan" name="pan" class="h-11 w-full rounded-lg border border-gray-350 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
          </div>
          <div class="col-span-2">
            <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Address *</label>
            <textarea [(ngModel)]="partyForm.address" name="address" required class="w-full rounded-lg border border-gray-350 bg-transparent px-4 py-2 text-sm dark:border-gray-700 dark:text-white" rows="2"></textarea>
          </div>
          <div class="flex justify-end gap-3 col-span-2 mt-4">
            <button type="button" (click)="closeModal()" class="px-4 py-2 text-sm font-medium text-gray-500 border rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Save Party</button>
          </div>
        </form>
      </div>
    </app-modal>

    <!-- 2. Model Modal -->
    <app-modal [isOpen]="activeModal === 'model'" (close)="closeModal()">
      <div class="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
        <h3 class="text-lg font-bold text-gray-800 dark:text-white">Add Model Profile</h3>
        <form (submit)="saveModel()" class="grid grid-cols-2 gap-4">
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Full Name *</label>
            <input type="text" [(ngModel)]="modelForm.name" name="name" required class="h-11 w-full rounded-lg border border-gray-355 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
          </div>
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Vendor (Agency)</label>
            <select [(ngModel)]="modelForm.vendorId" name="vendorId" class="h-11 w-full rounded-lg border border-gray-355 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white dark:bg-gray-900">
              <option value="">Direct (No Vendor)</option>
              @for (v of vendors; track v.id) {
                <option [value]="v.id">{{ v.companyName }}</option>
              }
            </select>
          </div>
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Email *</label>
            <input type="email" [(ngModel)]="modelForm.email" name="email" required class="h-11 w-full rounded-lg border border-gray-355 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
          </div>
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Mobile *</label>
            <input type="text" [(ngModel)]="modelForm.mobile" name="mobile" required class="h-11 w-full rounded-lg border border-gray-355 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
          </div>
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Gender *</label>
            <select [(ngModel)]="modelForm.gender" name="gender" required class="h-11 w-full rounded-lg border border-gray-355 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white dark:bg-gray-900">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Age *</label>
            <input type="number" [(ngModel)]="modelForm.age" name="age" required class="h-11 w-full rounded-lg border border-gray-355 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
          </div>
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Height (cm) *</label>
            <input type="number" [(ngModel)]="modelForm.height" name="height" required class="h-11 w-full rounded-lg border border-gray-355 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
          </div>
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Nationality *</label>
            <input type="text" [(ngModel)]="modelForm.nationality" name="nationality" required class="h-11 w-full rounded-lg border border-gray-355 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
          </div>
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">City *</label>
            <input type="text" [(ngModel)]="modelForm.city" name="city" required class="h-11 w-full rounded-lg border border-gray-355 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
          </div>
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Experience (Years)</label>
            <input type="number" [(ngModel)]="modelForm.experienceYears" name="experienceYears" class="h-11 w-full rounded-lg border border-gray-355 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
          </div>
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Day Rate (₹) *</label>
            <input type="number" [(ngModel)]="modelForm.dayRate" name="dayRate" required class="h-11 w-full rounded-lg border border-gray-355 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
          </div>
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Instagram ID</label>
            <input type="text" [(ngModel)]="modelForm.instagram" name="instagram" class="h-11 w-full rounded-lg border border-gray-355 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
          </div>
          <div class="flex justify-end gap-3 col-span-2 mt-4">
            <button type="button" (click)="closeModal()" class="px-4 py-2 text-sm font-medium text-gray-500 border rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Save Model</button>
          </div>
        </form>
      </div>
    </app-modal>

    <!-- 3. Requirement Modal -->
    <app-modal [isOpen]="activeModal === 'requirement'" (close)="closeModal()">
      <div class="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
        <h3 class="text-lg font-bold text-gray-800 dark:text-white">Add Requirement</h3>
        <form (submit)="saveRequirement()" class="grid grid-cols-2 gap-4">
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Client *</label>
            <select [(ngModel)]="reqForm.clientId" name="clientId" required class="h-11 w-full rounded-lg border border-gray-360 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white dark:bg-gray-900">
              @for (c of clients; track c.id) {
                <option [value]="c.id">{{ c.companyName }}</option>
              }
            </select>
          </div>
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Brand *</label>
            <select [(ngModel)]="reqForm.brandId" name="brandId" required class="h-11 w-full rounded-lg border border-gray-360 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white dark:bg-gray-900">
              @for (b of masters?.brands; track b.id) {
                <option [value]="b.id">{{ b.name }}</option>
              }
            </select>
          </div>
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Category *</label>
            <select [(ngModel)]="reqForm.categoryId" name="categoryId" required class="h-11 w-full rounded-lg border border-gray-360 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white dark:bg-gray-900">
              @for (cat of masters?.categories; track cat.id) {
                <option [value]="cat.id">{{ cat.name }}</option>
              }
            </select>
          </div>
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Project Name *</label>
            <input type="text" [(ngModel)]="reqForm.project" name="project" required class="h-11 w-full rounded-lg border border-gray-360 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
          </div>
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Shoot Date *</label>
            <input type="date" [(ngModel)]="reqForm.shootDate" name="shootDate" required class="h-11 w-full rounded-lg border border-gray-360 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
          </div>
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Location *</label>
            <input type="text" [(ngModel)]="reqForm.location" name="location" required class="h-11 w-full rounded-lg border border-gray-360 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
          </div>
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Gender Preferred</label>
            <select [(ngModel)]="reqForm.gender" name="gender" class="h-11 w-full rounded-lg border border-gray-360 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white dark:bg-gray-900">
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
              <option value="All">All</option>
            </select>
          </div>
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">No of Models *</label>
            <input type="number" [(ngModel)]="reqForm.noOfModels" name="noOfModels" required class="h-11 w-full rounded-lg border border-gray-360 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
          </div>
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Budget (₹) *</label>
            <input type="number" [(ngModel)]="reqForm.budget" name="budget" required class="h-11 w-full rounded-lg border border-gray-360 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
          </div>
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Experience (Years)</label>
            <input type="number" [(ngModel)]="reqForm.experienceYears" name="experienceYears" class="h-11 w-full rounded-lg border border-gray-360 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
          </div>
          <div class="col-span-2">
            <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Detailed Requirements</label>
            <textarea [(ngModel)]="reqForm.requirements" name="requirements" class="w-full rounded-lg border border-gray-360 bg-transparent px-4 py-2 text-sm dark:border-gray-700 dark:text-white" rows="2"></textarea>
          </div>
          <div class="flex justify-end gap-3 col-span-2 mt-4">
            <button type="button" (click)="closeModal()" class="px-4 py-2 text-sm font-medium text-gray-500 border rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700">Save Requirement</button>
          </div>
        </form>
      </div>
    </app-modal>

    <!-- 4. Quotation Modal -->
    <app-modal [isOpen]="activeModal === 'quotation'" (close)="closeModal()">
      <div class="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
        <h3 class="text-lg font-bold text-gray-800 dark:text-white">Create Quotation</h3>
        <form (submit)="saveQuotation()" class="grid grid-cols-2 gap-4">
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Customer *</label>
            <select [(ngModel)]="qtForm.customerId" name="customerId" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white dark:bg-gray-900">
              @for (c of clients; track c.id) {
                <option [value]="c.id">{{ c.companyName }}</option>
              }
            </select>
          </div>
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Brand *</label>
            <select [(ngModel)]="qtForm.brandId" name="brandId" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white dark:bg-gray-900">
              @for (b of masters?.brands; track b.id) {
                <option [value]="b.id">{{ b.name }}</option>
              }
            </select>
          </div>
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Category *</label>
            <select [(ngModel)]="qtForm.categoryId" name="categoryId" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white dark:bg-gray-900">
              @for (cat of masters?.categories; track cat.id) {
                <option [value]="cat.id">{{ cat.name }}</option>
              }
            </select>
          </div>
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Date *</label>
            <input type="date" [(ngModel)]="qtForm.date" name="date" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
          </div>
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Validity (Days) *</label>
            <input type="number" [(ngModel)]="qtForm.validityDays" name="validityDays" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
          </div>
          <div class="flex items-center gap-2 mt-6">
            <input type="checkbox" id="enableGst" [(ngModel)]="qtForm.enableGst" name="enableGst" class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500">
            <label for="enableGst" class="text-sm font-semibold text-gray-600 dark:text-gray-400">Enable GST (18%)</label>
          </div>
 
          <div class="col-span-2 border-t border-gray-100 dark:border-gray-800 pt-3">
            <h5 class="text-xs font-bold text-gray-400 uppercase mb-2">Model Selection</h5>
            <div class="space-y-2">
              @for (qm of qtForm.models; track $index) {
                <div class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-850 rounded-lg">
                  <select [(ngModel)]="qm.modelId" [name]="'modelId_'+$index" class="h-9 flex-1 rounded-lg border border-gray-300 bg-transparent px-2 text-xs dark:border-gray-750 dark:text-white dark:bg-gray-900">
                    <option value="">Select Model</option>
                    @for (m of allModels; track m.id) {
                      <option [value]="m.id">{{ m.name }} (Day Rate: ₹{{ m.dayRate }})</option>
                    }
                  </select>
                  <input type="number" [(ngModel)]="qm.sellingPrice" [name]="'price_'+$index" placeholder="Selling Price" class="h-9 w-28 rounded-lg border border-gray-300 bg-transparent px-2 text-xs dark:border-gray-750 dark:text-white">
                  <input type="text" [(ngModel)]="qm.remarks" [name]="'rem_'+$index" placeholder="Remarks" class="h-9 w-36 rounded-lg border border-gray-300 bg-transparent px-2 text-xs dark:border-gray-750 dark:text-white">
                  <button type="button" (click)="removeModelFromQt($index)" class="p-1 text-red-500 hover:bg-red-50 rounded">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              }
              <button type="button" (click)="addModelToQt()" class="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">+ Add Model</button>
            </div>
          </div>
 
          <div class="col-span-2">
            <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Terms & Conditions</label>
            <textarea [(ngModel)]="qtForm.terms" name="terms" class="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm dark:border-gray-700 dark:text-white" rows="2"></textarea>
          </div>
          <div class="flex justify-end gap-3 col-span-2 mt-4">
            <button type="button" (click)="closeModal()" class="px-4 py-2 text-sm font-medium text-gray-500 border rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700">Save Quotation</button>
          </div>
        </form>
      </div>
    </app-modal>

    <!-- 5. Booking Modal -->
    <app-modal [isOpen]="activeModal === 'booking'" (close)="closeModal()">
      <div class="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
        <h3 class="text-lg font-bold text-gray-800 dark:text-white">Add Booking</h3>
        <form (submit)="saveBooking()" class="grid grid-cols-2 gap-4">
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Customer *</label>
            <select [(ngModel)]="bookingForm.customerId" name="customerId" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white dark:bg-gray-900">
              @for (c of clients; track c.id) {
                <option [value]="c.id">{{ c.companyName }}</option>
              }
            </select>
          </div>
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Brand *</label>
            <select [(ngModel)]="bookingForm.brandId" name="brandId" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white dark:bg-gray-900">
              @for (b of masters?.brands; track b.id) {
                <option [value]="b.id">{{ b.name }}</option>
              }
            </select>
          </div>
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Category *</label>
            <select [(ngModel)]="bookingForm.categoryId" name="categoryId" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white dark:bg-gray-900">
              @for (cat of masters?.categories; track cat.id) {
                <option [value]="cat.id">{{ cat.name }}</option>
              }
            </select>
          </div>
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Shoot Date *</label>
            <input type="date" [(ngModel)]="bookingForm.shootDate" name="shootDate" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
          </div>
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Shoot Time *</label>
            <input type="text" [(ngModel)]="bookingForm.shootTime" name="shootTime" placeholder="e.g. 09:00 AM - 06:00 PM" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
          </div>
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Venue *</label>
            <input type="text" [(ngModel)]="bookingForm.venue" name="venue" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
          </div>
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Coordinator *</label>
            <select [(ngModel)]="bookingForm.coordinatorId" name="coordinatorId" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white dark:bg-gray-900">
              @for (c of masters?.coordinators; track c.id) {
                <option [value]="c.id">{{ c.name }}</option>
              }
            </select>
          </div>
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Total Selling Price (₹) *</label>
            <input type="number" [(ngModel)]="bookingForm.sellingPrice" name="sellingPrice" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
          </div>
          <div class="col-span-2">
            <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Select Models *</label>
            <div class="grid grid-cols-2 gap-2 max-h-[120px] overflow-y-auto p-2 border border-gray-200 dark:border-gray-700 rounded-lg">
              @for (m of allModels; track m.id) {
                <div class="flex items-center gap-2">
                  <input type="checkbox" [id]="'bkm_'+m.id" [checked]="isModelSelectedInBooking(m.id)" (change)="toggleModelInBooking(m.id)" class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500">
                  <label [for]="'bkm_'+m.id" class="text-xs text-gray-700 dark:text-gray-300">{{ m.name }} (₹{{ m.dayRate }})</label>
                </div>
              }
            </div>
          </div>
          <div class="col-span-2">
            <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Remarks</label>
            <textarea [(ngModel)]="bookingForm.remarks" name="remarks" class="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm dark:border-gray-700 dark:text-white" rows="2"></textarea>
          </div>
          <div class="flex justify-end gap-3 col-span-2 mt-4">
            <button type="button" (click)="closeModal()" class="px-4 py-2 text-sm font-medium text-gray-500 border rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700">Save Booking</button>
          </div>
        </form>
      </div>
    </app-modal>
  `,
  styles: [`
    ::ng-select .ng-select-container {
      height: 2.75rem;
    }
  `]
})
export class CrmDashboardComponent implements OnInit, OnDestroy {

  private sub = new Subscription();

  // KPIs
  kpis = {
    totalModels: 0,
    nationalModels: 0,
    internationalModels: 0,
    availableModels: 0,
    bookedModels: 0,
    activeClients: 0,
    activeVendors: 0,
    openRequirements: 0,
    pendingQuotations: 0,
    upcomingShoots: 0,
    pendingInvoices: 0,
    outstandingPayments: 0,
    overduePayments: 0,
    monthlyRevenue: 0,
    monthlyExpenses: 0,
    monthlyProfit: 0
  };

  // Trend active tab
  activeTrend: 'revenue' | 'booking' = 'revenue';

  // Lists
  upcomingShoots: Booking[] = [];
  pendingFollowups: { id: string; type: string; title: string; followUp: FollowUp }[] = [];
  topModels: Model[] = [];
  recentActivities: ActivityLog[] = [];
  customerOuts: { id: string; name: string; invoiceCount: number; outstanding: number }[] = [];
  vendorOuts: { id: string; name: string; role: string; pending: number }[] = [];

  // Masters reference
  masters: MastersData | null = null;
  clients: Party[] = [];
  vendors: Party[] = [];
  allModels: Model[] = [];

  // Chart configs
  revenueChartOptions: any = {};
  bookingChartOptions: any = {};

  // Quick Action Modal states
  activeModal: 'party' | 'model' | 'requirement' | 'quotation' | 'booking' | null = null;

  // Form states
  partyForm: Partial<Party> = {};
  modelForm: Partial<Model> = {};
  reqForm: Partial<Requirement> = {};
  qtForm: Partial<Quotation> = { models: [], enableGst: true, gstRate: 18 };
  bookingForm: Partial<Booking> = { modelIds: [] };

  constructor(private crmStorage: CrmStorageService) { }

  ngOnInit() {
    this.sub.add(this.crmStorage.getMasters$().subscribe(data => this.masters = data));
    this.sub.add(this.crmStorage.getParties$().subscribe(parties => {
      this.clients = parties.filter(p => p.partyType === 'Customer' || p.partyType === 'Customer + Vendor');
      this.vendors = parties.filter(p => p.partyType === 'Vendor' || p.partyType === 'Customer + Vendor');
      this.calculateKpisAndLists();
    }));
    this.sub.add(this.crmStorage.getModels$().subscribe(models => {
      this.allModels = models;
      this.calculateKpisAndLists();
    }));
    this.sub.add(this.crmStorage.getRequirements$().subscribe(() => this.calculateKpisAndLists()));
    this.sub.add(this.crmStorage.getQuotations$().subscribe(() => this.calculateKpisAndLists()));
    this.sub.add(this.crmStorage.getBookings$().subscribe(() => this.calculateKpisAndLists()));
    this.sub.add(this.crmStorage.getInvoices$().subscribe(() => this.calculateKpisAndLists()));
    this.sub.add(this.crmStorage.getPaymentsReceived$().subscribe(() => this.calculateKpisAndLists()));
    this.sub.add(this.crmStorage.getPaymentsMade$().subscribe(() => this.calculateKpisAndLists()));
    this.sub.add(this.crmStorage.getActivityLogs$().subscribe(logs => this.recentActivities = logs.slice(0, 5)));

    this.initChartOptions();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  calculateKpisAndLists() {
    // 1. Models
    const models = this.crmStorage['models$'].value;
    this.kpis.totalModels = models.length;
    this.kpis.nationalModels = models.filter(m => m.nationality.toLowerCase() === 'india' || m.nationality.toLowerCase() === 'indian').length;
    this.kpis.internationalModels = this.kpis.totalModels - this.kpis.nationalModels;
    this.kpis.availableModels = models.filter(m => m.status === 'Available' || m.status === 'Active').length;
    this.kpis.bookedModels = models.filter(m => m.status === 'Booked').length;

    // Top Models
    this.topModels = [...models].sort((a, b) => b.dayRate - a.dayRate).slice(0, 5);

    // 2. Parties
    const parties = this.crmStorage['parties$'].value;
    this.kpis.activeClients = parties.filter(p => (p.partyType === 'Customer' || p.partyType === 'Customer + Vendor') && p.status === 'Active').length;
    this.kpis.activeVendors = parties.filter(p => (p.partyType === 'Vendor' || p.partyType === 'Customer + Vendor') && p.status === 'Active').length;

    // 3. Requirements
    const reqs = this.crmStorage['requirements$'].value;
    this.kpis.openRequirements = reqs.filter(r => r.status === 'Open' || r.status === 'In Progress').length;

    // 4. Quotations
    const qts = this.crmStorage['quotations$'].value;
    this.kpis.pendingQuotations = qts.filter(q => q.status === 'Sent').length;

    // 5. Bookings (Upcoming)
    const bookings = this.crmStorage['bookings$'].value;
    const todayStr = new Date().toISOString().split('T')[0];
    this.upcomingShoots = bookings.filter(b => b.shootDate >= todayStr && b.status !== 'Cancelled').sort((a, b) => a.shootDate.localeCompare(b.shootDate));
    this.kpis.upcomingShoots = this.upcomingShoots.length;

    // 6. Invoices, Payments, Outstanding
    const invoices = this.crmStorage['invoices$'].value;
    const paymentsReceived = this.crmStorage['paymentsReceived$'].value;
    const paymentsMade = this.crmStorage['paymentsMade$'].value;

    this.kpis.pendingInvoices = invoices.filter(i => i.status === 'Pending' || i.status === 'Partial' || i.status === 'Overdue').length;

    // Outstanding & Overdue calculations
    let outSum = 0;
    let overdueSum = 0;
    invoices.forEach(inv => {
      const pendingAmount = inv.grandTotal - inv.amountPaid;
      if (pendingAmount > 0) {
        outSum += pendingAmount;
        // Mock check for overdue: if invoice is older than 30 days
        const ageInDays = (Date.now() - new Date(inv.date).getTime()) / (1000 * 60 * 60 * 24);
        if (ageInDays > 30) {
          overdueSum += pendingAmount;
          inv.status = 'Overdue'; // updates inline display status
        }
      }
    });
    this.kpis.outstandingPayments = outSum;
    this.kpis.overduePayments = overdueSum;

    // Revenue calculations (Received Payments this month)
    let revSum = 0;
    paymentsReceived.forEach(p => {
      revSum += p.amount;
    });
    this.kpis.monthlyRevenue = revSum;

    // Expenses calculations (Disbursed Payments to Models/Vendors)
    let expSum = 0;
    paymentsMade.forEach(p => {
      expSum += p.amount;
    });
    this.kpis.monthlyExpenses = expSum;
    this.kpis.monthlyProfit = this.kpis.monthlyRevenue - this.kpis.monthlyExpenses;

    // 7. Follow-ups Reminders
    const reminders: any[] = [];
    reqs.forEach(r => {
      r.followUps.forEach(f => {
        if (f.reminder && f.nextFollowUpDate >= todayStr) {
          reminders.push({ id: f.id, type: 'Requirement', title: r.project, followUp: f });
        }
      });
    });
    qts.forEach(q => {
      q.followUps.forEach(f => {
        if (f.reminder && f.nextFollowUpDate >= todayStr) {
          reminders.push({ id: f.id, type: 'Quotation', title: `Quote: ${q.quotationNo}`, followUp: f });
        }
      });
    });
    this.pendingFollowups = reminders.sort((a, b) => a.followUp.nextFollowUpDate.localeCompare(b.followUp.nextFollowUpDate)).slice(0, 5);

    // 8. Customer Outstanding List
    const custOutMap = new Map<string, { name: string; count: number; sum: number }>();
    invoices.forEach(inv => {
      const pending = inv.grandTotal - inv.amountPaid;
      if (pending > 0) {
        const client = this.clients.find(c => c.id === inv.customerId);
        const name = client ? client.companyName : 'Unknown Client';
        const entry = custOutMap.get(inv.customerId) || { name, count: 0, sum: 0 };
        entry.count++;
        entry.sum += pending;
        custOutMap.set(inv.customerId, entry);
      }
    });
    this.customerOuts = Array.from(custOutMap.entries()).map(([id, val]) => ({
      id,
      name: val.name,
      invoiceCount: val.count,
      outstanding: val.sum
    })).sort((a, b) => b.outstanding - a.outstanding).slice(0, 5);

    // 9. Vendor Outstanding List (simulated payouts pending)
    // Find all bookings where payouts haven't been completed
    const vendorOutMap = new Map<string, { name: string; role: string; pending: number }>();
    bookings.forEach(b => {
      // For each model in booking, check if payout is recorded
      b.modelIds.forEach(mid => {
        const model = models.find(m => m.id === mid);
        if (model) {
          const modelPayouts = paymentsMade.filter(p => p.modelId === mid);
          const totalPaid = modelPayouts.reduce((acc, curr) => acc + curr.amount, 0);
          const expectedPayout = model.dayRate; // simple 1 day shoot simulation
          const pending = expectedPayout - totalPaid;
          if (pending > 0) {
            const vendorName = model.name;
            const entry = vendorOutMap.get(mid) || { name: vendorName, role: 'Model Payout', pending: 0 };
            entry.pending += pending;
            vendorOutMap.set(mid, entry);
          }
        }
      });
    });
    this.vendorOuts = Array.from(vendorOutMap.entries()).map(([id, val]) => ({
      id,
      name: val.name,
      role: val.role,
      pending: val.pending
    })).sort((a, b) => b.pending - a.pending).slice(0, 5);
  }

  getPartyName(id: string): string {
    const party = this.clients.find(c => c.id === id) || this.vendors.find(v => v.id === id);
    return party ? party.companyName : 'Unknown Party';
  }

  getModelsNames(ids: string[]): string {
    return this.allModels.filter(m => ids.includes(m.id)).map(m => m.name).join(', ') || 'None';
  }

  // Quick action Modal handling
  openQuickModal(type: 'party' | 'model' | 'requirement' | 'quotation' | 'booking') {
    this.activeModal = type;
    // reset forms
    if (type === 'party') {
      this.partyForm = { partyType: 'Customer', status: 'Active', paymentDueDays: 30, creditLimit: 200000, currency: 'INR', bankDetails: { bankName: '', accountName: '', accountNumber: '', ifsc: '', branch: '' } };
    } else if (type === 'model') {
      this.modelForm = { gender: 'Female', age: 22, height: 170, status: 'Available', categoryIds: [], portfolioImages: [], bankDetails: { bankName: '', accountName: '', accountNumber: '', ifsc: '', branch: '' } };
    } else if (type === 'requirement') {
      this.reqForm = { clientId: this.clients[0]?.id || '', brandId: this.masters?.brands[0]?.id || '', categoryId: this.masters?.categories[0]?.id || '', gender: 'Female', noOfModels: 1, budget: 50000, status: 'Open', shootDate: new Date().toISOString().split('T')[0] };
    } else if (type === 'quotation') {
      this.qtForm = { customerId: this.clients[0]?.id || '', brandId: this.masters?.brands[0]?.id || '', categoryId: this.masters?.categories[0]?.id || '', date: new Date().toISOString().split('T')[0], validityDays: 15, enableGst: true, gstRate: 18, models: [] };
      this.addModelToQt();
    } else if (type === 'booking') {
      this.bookingForm = { customerId: this.clients[0]?.id || '', brandId: this.masters?.brands[0]?.id || '', categoryId: this.masters?.categories[0]?.id || '', coordinatorId: this.masters?.coordinators[0]?.id || '', shootDate: new Date().toISOString().split('T')[0], shootTime: '09:00 AM - 06:00 PM', status: 'Confirmed', modelIds: [], sellingPrice: 50000 };
    }
  }

  closeModal() {
    this.activeModal = null;
  }

  // Save Quick Actions
  saveParty() {
    if (this.partyForm.companyName && this.partyForm.contactPerson) {
      this.crmStorage.saveParty(this.partyForm as Party);
      this.closeModal();
    }
  }

  saveModel() {
    if (this.modelForm.name && this.modelForm.email) {
      this.crmStorage.saveModel(this.modelForm as Model);
      this.closeModal();
    }
  }

  saveRequirement() {
    if (this.reqForm.project && this.reqForm.clientId) {
      this.crmStorage.saveRequirement(this.reqForm as Requirement);
      this.closeModal();
    }
  }

  saveQuotation() {
    if (this.qtForm.customerId && this.qtForm.models && this.qtForm.models.length > 0) {
      this.crmStorage.saveQuotation(this.qtForm as Quotation);
      this.closeModal();
    }
  }

  saveBooking() {
    if (this.bookingForm.customerId && this.bookingForm.modelIds && this.bookingForm.modelIds.length > 0) {
      this.crmStorage.saveBooking(this.bookingForm as Booking);
      this.closeModal();
    }
  }

  // Quotation models helper
  addModelToQt() {
    this.qtForm.models = this.qtForm.models || [];
    this.qtForm.models.push({ modelId: '', sellingPrice: 20000, remarks: '', status: 'Selected' });
  }

  removeModelFromQt(idx: number) {
    this.qtForm.models?.splice(idx, 1);
  }

  // Booking models helper
  isModelSelectedInBooking(id: string): boolean {
    return this.bookingForm.modelIds?.includes(id) || false;
  }

  toggleModelInBooking(id: string) {
    this.bookingForm.modelIds = this.bookingForm.modelIds || [];
    const idx = this.bookingForm.modelIds.indexOf(id);
    if (idx > -1) {
      this.bookingForm.modelIds.splice(idx, 1);
    } else {
      this.bookingForm.modelIds.push(id);
    }
  }

  initChartOptions() {
    // Revenue trend option
    this.revenueChartOptions = {
      series: [
        {
          name: 'Revenue',
          data: [94400, 118000, 141600, 95000, 110000, 130000, 125000, 140000, 155000, 160000, 148000, 175000]
        },
        {
          name: 'Payouts',
          data: [50000, 65000, 80000, 55000, 60000, 70000, 75000, 85000, 90000, 100000, 92000, 115000]
        }
      ],
      chart: {
        fontFamily: 'Outfit, sans-serif',
        type: 'area',
        height: 250,
        toolbar: { show: false }
      },
      colors: ['#3b82f6', '#f59e0b'],
      stroke: { curve: 'smooth', width: 3 },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.4,
          opacityTo: 0.1,
          stops: [0, 90, 100]
        }
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      },
      yaxis: {
        labels: {
          formatter: (val: number) => '₹' + (val / 1000) + 'k'
        }
      },
      tooltip: {
        y: {
          formatter: (val: number) => '₹' + val.toLocaleString()
        }
      }
    };

    // Booking chart options
    this.bookingChartOptions = {
      series: [
        {
          name: 'Bookings Count',
          data: [5, 8, 12, 6, 9, 14, 11, 10, 15, 13, 16, 20]
        }
      ],
      chart: {
        fontFamily: 'Outfit, sans-serif',
        type: 'bar',
        height: 250,
        toolbar: { show: false }
      },
      colors: ['#8b5cf6'],
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '40%',
          borderRadius: 4
        }
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      },
      yaxis: {
        labels: {
          formatter: (val: number) => val + ' shoots'
        }
      }
    };
  }
}
