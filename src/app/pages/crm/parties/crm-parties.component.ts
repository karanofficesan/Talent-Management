import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ModalComponent } from '../../../shared/components/ui/modal/modal.component';
import { BadgeComponent } from '../../../shared/components/ui/badge/badge.component';

import {
  CrmStorageService,
  Party,
  PartyType,
  Booking,
  Invoice,
  PaymentReceived
} from '../../../shared/services/crm-storage.service';

@Component({
  selector: 'app-crm-parties',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageBreadcrumbComponent,
    ModalComponent,
    BadgeComponent
  ],
  template: `
    <div class="space-y-6">
      <app-page-breadcrumb pageTitle="Party Master (Customers & Vendors)" />

      <!-- Controls Row -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800">
        <!-- Filters -->
        <div class="flex flex-wrap gap-2">
          <button (click)="setFilter('All')" [ngClass]="{'bg-blue-600 text-white': activeFilter === 'All', 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300': activeFilter !== 'All'}" class="px-4 py-2 rounded-lg text-sm font-medium transition">
            All ({{ parties.length }})
          </button>
          <button (click)="setFilter('Customer')" [ngClass]="{'bg-blue-600 text-white': activeFilter === 'Customer', 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300': activeFilter !== 'Customer'}" class="px-4 py-2 rounded-lg text-sm font-medium transition">
            Customers ({{ getCount('Customer') }})
          </button>
          <button (click)="setFilter('Vendor')" [ngClass]="{'bg-blue-600 text-white': activeFilter === 'Vendor', 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300': activeFilter !== 'Vendor'}" class="px-4 py-2 rounded-lg text-sm font-medium transition">
            Vendors ({{ getCount('Vendor') }})
          </button>
          <button (click)="setFilter('Customer + Vendor')" [ngClass]="{'bg-blue-600 text-white': activeFilter === 'Customer + Vendor', 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300': activeFilter !== 'Customer + Vendor'}" class="px-4 py-2 rounded-lg text-sm font-medium transition">
            Co-Partners ({{ getCount('Customer + Vendor') }})
          </button>
        </div>

        <!-- Search and Add -->
        <div class="flex items-center gap-2">
          <input type="text" [(ngModel)]="searchQuery" placeholder="Search Company or Contact..." class="h-10 px-4 rounded-lg border border-gray-300 bg-transparent text-sm dark:border-gray-700 dark:text-white placeholder:text-gray-400 focus:outline-none w-64">
          <button (click)="openAddModal()" class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">
            + Add Party
          </button>
        </div>
      </div>

      <!-- Parties List Table -->
      <div class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div class="max-w-full overflow-x-auto">
          <table class="min-w-full">
            <thead class="border-b border-gray-100 dark:border-white/[0.05]">
              <tr class="bg-gray-50 dark:bg-gray-850">
                <th class="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400">Company Name</th>
                <th class="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400">Type</th>
                <th class="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400">Contact Details</th>
                <th class="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400">Financials</th>
                <th class="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</th>
                <th class="px-5 py-3 font-semibold text-gray-500 text-center text-theme-xs dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-white/[0.05]">
              @for (party of filteredParties; track party.id) {
                <tr class="hover:bg-gray-50/50 dark:hover:bg-gray-850/50 transition cursor-pointer" (click)="viewPartyDetails(party)">
                  <td class="px-5 py-4">
                    <span class="block font-semibold text-gray-800 dark:text-white/90 text-sm">{{ party.companyName }}</span>
                    <span class="block text-gray-400 text-xs mt-0.5">📍 {{ party.city }}, {{ party.state }}</span>
                  </td>
                  <td class="px-5 py-4">
                    <app-badge size="sm" [color]="getBadgeColor(party.partyType)">
                      {{ party.partyType }}
                    </app-badge>
                  </td>
                  <td class="px-5 py-4 text-xs text-gray-600 dark:text-gray-300">
                    <p class="font-medium text-gray-700 dark:text-gray-200">{{ party.contactPerson }}</p>
                    <p class="mt-0.5">📞 {{ party.mobile }}</p>
                    <p>✉️ {{ party.email }}</p>
                  </td>
                  <td class="px-5 py-4 text-xs text-gray-600 dark:text-gray-300">
                    <p>Due Terms: <span class="font-semibold">{{ party.paymentDueDays }} Days</span></p>
                    <p>Credit Limit: <span class="font-semibold">{{ party.currency }} {{ party.creditLimit | number }}</span></p>
                  </td>
                  <td class="px-5 py-4">
                    <app-badge size="sm" [color]="party.status === 'Active' ? 'success' : 'error'">
                      {{ party.status }}
                    </app-badge>
                  </td>
                  <td class="px-5 py-4 text-center" (click)="$event.stopPropagation()">
                    <div class="flex items-center justify-center gap-2">
                      <button (click)="openEditModal(party)" class="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded">
                        <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
                      <button (click)="deleteParty(party.id)" class="p-1 text-gray-400 hover:text-red-600 rounded">
                        <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="px-5 py-8 text-center text-gray-400 text-sm">No parties match the filter.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Detail Drawer / Modal -->
      <app-modal [isOpen]="!!selectedParty" (close)="selectedParty = null" [isFullscreen]="true" [className]="'bg-gray-50 dark:bg-gray-950 p-6 overflow-y-auto'">
        @if (selectedParty) {
          <div class="max-w-6xl mx-auto space-y-6 pt-8">
            <!-- Header Block -->
            <div class="flex items-center justify-between p-6 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800">
              <div>
                <span class="text-xs font-semibold text-blue-600 uppercase">{{ selectedParty.partyType }} Profile</span>
                <h2 class="text-2xl font-bold text-gray-800 dark:text-white mt-1">{{ selectedParty.companyName }}</h2>
                <p class="text-xs text-gray-400 mt-1">Registered: {{ selectedParty.createdAt | date:'mediumDate' }} | Status: {{ selectedParty.status }}</p>
              </div>
              <div class="flex gap-2">
                <button (click)="openEditModal(selectedParty); selectedParty = null" class="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">Edit Profile</button>
                <button (click)="selectedParty = null" class="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700">Close Profile</button>
              </div>
            </div>

            <!-- Detail Columns -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- Basic Information -->
              <div class="p-6 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800 space-y-4">
                <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Contact & Location</h4>
                <div class="text-xs space-y-2 text-gray-600 dark:text-gray-300">
                  <p><span class="font-medium block text-gray-400">Contact Person</span> {{ selectedParty.contactPerson }}</p>
                  <p><span class="font-medium block text-gray-400">Mobile</span> {{ selectedParty.mobile }}</p>
                  <p><span class="font-medium block text-gray-400">Email</span> {{ selectedParty.email }}</p>
                  <p><span class="font-medium block text-gray-400">Website</span> <a [href]="'http://'+selectedParty.website" target="_blank" class="text-blue-500 hover:underline">{{ selectedParty.website || 'N/A' }}</a></p>
                  <p><span class="font-medium block text-gray-400">GST Number</span> {{ selectedParty.gstNumber || 'N/A' }}</p>
                  <p><span class="font-medium block text-gray-400">PAN</span> {{ selectedParty.pan || 'N/A' }}</p>
                  <p><span class="font-medium block text-gray-400">Billing Address</span> {{ selectedParty.address }} <br> {{ selectedParty.city }} - {{ selectedParty.pincode }}, {{ selectedParty.state }}, {{ selectedParty.country }}</p>
                </div>
              </div>

              <!-- Financial Config -->
              <div class="p-6 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800 space-y-4">
                <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Financial Details</h4>
                <div class="text-xs space-y-2 text-gray-600 dark:text-gray-300">
                  <p><span class="font-medium block text-gray-400">Payment Due Terms</span> {{ selectedParty.paymentDueDays }} Days</p>
                  <p><span class="font-medium block text-gray-400">Credit Limit</span> {{ selectedParty.currency }} {{ selectedParty.creditLimit | number }}</p>
                  <p><span class="font-medium block text-gray-400">Currency Code</span> {{ selectedParty.currency }}</p>
                  <div class="pt-3 border-t border-gray-100 dark:border-gray-800">
                    <p class="text-sm font-semibold text-red-500">Outstanding: ₹{{ partyOutstanding | number:'1.0-0' }}</p>
                    <p class="text-xs text-gray-400 mt-1">Overdue Amount: ₹{{ partyOverdue | number:'1.0-0' }}</p>
                  </div>
                </div>
              </div>

              <!-- Bank Details -->
              <div class="p-6 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800 space-y-4">
                <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Settlement & Bank Details</h4>
                <div class="text-xs space-y-2 text-gray-600 dark:text-gray-300">
                  <p><span class="font-medium block text-gray-400">Bank Name</span> {{ selectedParty.bankDetails.bankName || 'N/A' }}</p>
                  <p><span class="font-medium block text-gray-400">Account Name</span> {{ selectedParty.bankDetails.accountName || 'N/A' }}</p>
                  <p><span class="font-medium block text-gray-400">Account Number</span> {{ selectedParty.bankDetails.accountNumber || 'N/A' }}</p>
                  <p><span class="font-medium block text-gray-400">IFSC / Branch</span> {{ selectedParty.bankDetails.ifsc || 'N/A' }} ({{ selectedParty.bankDetails.branch || 'N/A' }})</p>
                  <p><span class="font-medium block text-gray-400">SWIFT Code</span> {{ selectedParty.bankDetails.swiftCode || 'N/A' }}</p>
                </div>
              </div>
            </div>

            <!-- Ledger & History Tabs -->
            <div class="p-6 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800 space-y-4">
              <div class="flex border-b border-gray-200 dark:border-gray-800">
                <button (click)="activeTab = 'ledger'" [ngClass]="{'border-b-2 border-blue-600 font-bold text-blue-600': activeTab === 'ledger', 'text-gray-500': activeTab !== 'ledger'}" class="pb-3 px-4 text-sm font-semibold transition">
                  General Ledger
                </button>
                <button (click)="activeTab = 'bookings'" [ngClass]="{'border-b-2 border-blue-600 font-bold text-blue-600': activeTab === 'bookings', 'text-gray-500': activeTab !== 'bookings'}" class="pb-3 px-4 text-sm font-semibold transition">
                  Booking History ({{ partyBookings.length }})
                </button>
                <button (click)="activeTab = 'invoices'" [ngClass]="{'border-b-2 border-blue-600 font-bold text-blue-600': activeTab === 'invoices', 'text-gray-500': activeTab !== 'invoices'}" class="pb-3 px-4 text-sm font-semibold transition">
                  Invoice History ({{ partyInvoices.length }})
                </button>
                <button (click)="activeTab = 'payments'" [ngClass]="{'border-b-2 border-blue-600 font-bold text-blue-600': activeTab === 'payments', 'text-gray-500': activeTab !== 'payments'}" class="pb-3 px-4 text-sm font-semibold transition">
                  Payment History ({{ partyPayments.length }})
                </button>
              </div>

              <!-- Tab Contents -->
              @if (activeTab === 'ledger') {
                <div class="overflow-x-auto">
                  <table class="min-w-full text-xs text-gray-700 dark:text-gray-300">
                    <thead>
                      <tr class="border-b border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-left">
                        <th class="pb-2">Date</th>
                        <th class="pb-2">Transaction Details</th>
                        <th class="pb-2 text-right">Debit (Invoiced)</th>
                        <th class="pb-2 text-right">Credit (Paid)</th>
                        <th class="pb-2 text-right">Balance</th>
                      </tr>
                    </thead>
                      <tbody class="divide-y divide-gray-50 dark:divide-gray-800">
                      @for (row of partyLedger; track row.id) {
                        <tr>
                          <td class="py-2">{{ row.date | date:'shortDate' }}</td>
                          <td class="py-2 font-medium">{{ row.desc }}</td>
                          <td class="py-2 text-right text-red-500">{{ row.debit > 0 ? '₹' + (row.debit | number) : '-' }}</td>
                          <td class="py-2 text-right text-green-500">{{ row.credit > 0 ? '₹' + (row.credit | number) : '-' }}</td>
                          <td class="py-2 text-right font-bold">₹{{ row.balance | number }}</td>
                        </tr>
                      } @empty {
                        <tr><td colspan="5" class="text-center py-4 text-gray-400">No ledger transactions found.</td></tr>
                      }
                    </tbody>
                  </table>
                </div>
              }

              @if (activeTab === 'bookings') {
                <div class="overflow-x-auto">
                  <table class="min-w-full text-xs text-gray-700 dark:text-gray-300">
                    <thead>
                      <tr class="border-b border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-left">
                        <th class="pb-2">Booking No</th>
                        <th class="pb-2">Date</th>
                        <th class="pb-2">Shoot Details</th>
                        <th class="pb-2">Price</th>
                        <th class="pb-2">Status</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50 dark:divide-gray-800">
                      @for (b of partyBookings; track b.id) {
                        <tr>
                          <td class="py-2 font-bold">{{ b.bookingNo }}</td>
                          <td class="py-2">{{ b.shootDate | date:'mediumDate' }}</td>
                          <td class="py-2">{{ b.venue }} | {{ b.shootTime }}</td>
                          <td class="py-2">₹{{ b.sellingPrice | number }}</td>
                          <td class="py-2">
                            <app-badge size="sm" [color]="b.status === 'Confirmed' ? 'success' : 'warning'">{{ b.status }}</app-badge>
                          </td>
                        </tr>
                      } @empty {
                        <tr><td colspan="5" class="text-center py-4 text-gray-400">No bookings history.</td></tr>
                      }
                    </tbody>
                  </table>
                </div>
              }

              @if (activeTab === 'invoices') {
                <div class="overflow-x-auto">
                  <table class="min-w-full text-xs text-gray-700 dark:text-gray-300">
                    <thead>
                      <tr class="border-b border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-left">
                        <th class="pb-2">Invoice No</th>
                        <th class="pb-2">Date</th>
                        <th class="pb-2">Grand Total</th>
                        <th class="pb-2">Paid</th>
                        <th class="pb-2">Status</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50 dark:divide-gray-800">
                      @for (i of partyInvoices; track i.id) {
                        <tr>
                          <td class="py-2 font-bold">{{ i.invoiceNo }}</td>
                          <td class="py-2">{{ i.date | date:'mediumDate' }}</td>
                          <td class="py-2">₹{{ i.grandTotal | number }}</td>
                          <td class="py-2 text-green-500">₹{{ i.amountPaid | number }}</td>
                          <td class="py-2">
                            <app-badge size="sm" [color]="i.status === 'Paid' ? 'success' : (i.status === 'Overdue' ? 'error' : 'warning')">{{ i.status }}</app-badge>
                          </td>
                        </tr>
                      } @empty {
                        <tr><td colspan="5" class="text-center py-4 text-gray-400">No invoices generated.</td></tr>
                      }
                    </tbody>
                  </table>
                </div>
              }

              @if (activeTab === 'payments') {
                <div class="overflow-x-auto">
                  <table class="min-w-full text-xs text-gray-700 dark:text-gray-300">
                    <thead>
                      <tr class="border-b border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-left">
                        <th class="pb-2">TXN Reference</th>
                        <th class="pb-2">Date</th>
                        <th class="pb-2">Mode</th>
                        <th class="pb-2">Amount Received</th>
                        <th class="pb-2">TDS Deducted</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50 dark:divide-gray-800">
                      @for (p of partyPayments; track p.id) {
                        <tr>
                          <td class="py-2 font-bold">{{ p.reference }}</td>
                          <td class="py-2">{{ p.date | date:'mediumDate' }}</td>
                          <td class="py-2">{{ p.mode }}</td>
                          <td class="py-2 text-green-600 font-semibold">₹{{ p.amount | number }}</td>
                          <td class="py-2 text-red-500">₹{{ p.tdsDeduction | number }}</td>
                        </tr>
                      } @empty {
                        <tr><td colspan="5" class="text-center py-4 text-gray-400">No payments received history.</td></tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            </div>
          </div>
        }
      </app-modal>

      <!-- Edit / Add Modal Form -->
      <app-modal [isOpen]="isFormOpen" (close)="isFormOpen = false">
        <div class="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          <h3 class="text-lg font-bold text-gray-800 dark:text-white">
            {{ editMode ? 'Edit Party Profile' : 'Add New Party Profile' }}
          </h3>
          <form (submit)="submitForm()" class="grid grid-cols-2 gap-4">
            <div class="col-span-2">
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Company Name *</label>
              <input type="text" [(ngModel)]="formData.companyName" name="companyName" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Contact Person *</label>
              <input type="text" [(ngModel)]="formData.contactPerson" name="contactPerson" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Party Type *</label>
              <select [(ngModel)]="formData.partyType" name="partyType" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white dark:bg-gray-900">
                <option value="Customer">Customer</option>
                <option value="Vendor">Vendor</option>
                <option value="Customer + Vendor">Customer + Vendor</option>
              </select>
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Mobile *</label>
              <input type="text" [(ngModel)]="formData.mobile" name="mobile" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Email *</label>
              <input type="email" [(ngModel)]="formData.email" name="email" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Website</label>
              <input type="text" [(ngModel)]="formData.website" name="website" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Status</label>
              <select [(ngModel)]="formData.status" name="status" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white dark:bg-gray-900">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">GST Number</label>
              <input type="text" [(ngModel)]="formData.gstNumber" name="gstNumber" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">PAN</label>
              <input type="text" [(ngModel)]="formData.pan" name="pan" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
            </div>

            <div class="col-span-2 border-t border-gray-100 dark:border-gray-800 pt-3">
              <h5 class="text-xs font-bold text-gray-400 uppercase mb-2">Location details</h5>
            </div>
            <div class="col-span-2">
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Address *</label>
              <input type="text" [(ngModel)]="formData.address" name="address" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">City *</label>
              <input type="text" [(ngModel)]="formData.city" name="city" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">State *</label>
              <input type="text" [(ngModel)]="formData.state" name="state" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Country *</label>
              <input type="text" [(ngModel)]="formData.country" name="country" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Pincode *</label>
              <input type="text" [(ngModel)]="formData.pincode" name="pincode" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
            </div>

            <div class="col-span-2 border-t border-gray-100 dark:border-gray-800 pt-3">
              <h5 class="text-xs font-bold text-gray-400 uppercase mb-2">Financial Settings</h5>
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Due Days *</label>
              <input type="number" [(ngModel)]="formData.paymentDueDays" name="paymentDueDays" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Credit Limit *</label>
              <input type="number" [(ngModel)]="formData.creditLimit" name="creditLimit" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Currency *</label>
              <input type="text" [(ngModel)]="formData.currency" name="currency" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
            </div>

            <div class="col-span-2 border-t border-gray-100 dark:border-gray-800 pt-3">
              <h5 class="text-xs font-bold text-gray-400 uppercase mb-2">Bank Account Details</h5>
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Bank Name</label>
              <input type="text" [(ngModel)]="formData.bankDetails!.bankName" name="bankName" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Account Name</label>
              <input type="text" [(ngModel)]="formData.bankDetails!.accountName" name="accountName" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Account Number</label>
              <input type="text" [(ngModel)]="formData.bankDetails!.accountNumber" name="accountNumber" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">IFSC Code</label>
              <input type="text" [(ngModel)]="formData.bankDetails!.ifsc" name="ifsc" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Branch Name</label>
              <input type="text" [(ngModel)]="formData.bankDetails!.branch" name="branch" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">SWIFT Code</label>
              <input type="text" [(ngModel)]="formData.bankDetails!.swiftCode" name="swiftCode" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
            </div>

            <div class="flex justify-end gap-3 col-span-2 mt-4 border-t border-gray-100 dark:border-gray-800 pt-4">
              <button type="button" (click)="isFormOpen = false" class="px-4 py-2 text-sm font-medium text-gray-500 border rounded-lg hover:bg-gray-50">Cancel</button>
              <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Save Profile</button>
            </div>
          </form>
        </div>
      </app-modal>
    </div>
  `
})
export class CrmPartiesComponent implements OnInit, OnDestroy {

  private sub = new Subscription();
  parties: Party[] = [];
  filteredParties: Party[] = [];
  activeFilter: 'All' | PartyType = 'All';
  searchQuery: string = '';

  // Detail view
  selectedParty: Party | null = null;
  activeTab: 'ledger' | 'bookings' | 'invoices' | 'payments' = 'ledger';
  partyOutstanding = 0;
  partyOverdue = 0;
  partyBookings: Booking[] = [];
  partyInvoices: Invoice[] = [];
  partyPayments: PaymentReceived[] = [];
  partyLedger: any[] = [];

  // Form states
  isFormOpen = false;
  editMode = false;
  formData: Partial<Party> = {
    bankDetails: { bankName: '', accountName: '', accountNumber: '', ifsc: '', branch: '' }
  };

  constructor(private crmStorage: CrmStorageService) { }

  ngOnInit() {
    this.sub.add(this.crmStorage.getParties$().subscribe(list => {
      this.parties = list;
      this.applyFilterAndSearch();
      if (this.selectedParty) {
        // Refresh details panel if it's currently open
        const fresh = list.find(p => p.id === this.selectedParty!.id);
        if (fresh) {
          this.viewPartyDetails(fresh);
        } else {
          this.selectedParty = null;
        }
      }
    }));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  getBadgeColor(type: PartyType): 'primary' | 'info' | 'success' {
    if (type === 'Customer') return 'primary';
    if (type === 'Vendor') return 'info';
    return 'success';
  }

  getCount(type: PartyType): number {
    return this.parties.filter(p => p.partyType === type).length;
  }

  setFilter(filter: 'All' | PartyType) {
    this.activeFilter = filter;
    this.applyFilterAndSearch();
  }

  applyFilterAndSearch() {
    let list = this.parties;
    if (this.activeFilter !== 'All') {
      list = list.filter(p => p.partyType === this.activeFilter);
    }
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(p => p.companyName.toLowerCase().includes(q) || p.contactPerson.toLowerCase().includes(q));
    }
    this.filteredParties = list;
  }

  // Details Tab calculations
  viewPartyDetails(party: Party) {
    this.selectedParty = party;
    this.activeTab = 'ledger';

    // 1. Bookings
    const allBookings = this.crmStorage['bookings$'].value;
    this.partyBookings = allBookings.filter(b => b.customerId === party.id);

    // 2. Invoices
    const allInvoices = this.crmStorage['invoices$'].value;
    this.partyInvoices = allInvoices.filter(i => i.customerId === party.id);

    // 3. Payments
    const allPayments = this.crmStorage['paymentsReceived$'].value;
    this.partyPayments = allPayments.filter(p => p.customerId === party.id);

    // 4. Calculations
    let outstanding = 0;
    let overdue = 0;
    this.partyInvoices.forEach(inv => {
      const balance = inv.grandTotal - inv.amountPaid;
      if (balance > 0) {
        outstanding += balance;
        const age = (Date.now() - new Date(inv.date).getTime()) / (1000 * 60 * 60 * 24);
        if (age > 30) {
          overdue += balance;
        }
      }
    });
    this.partyOutstanding = outstanding;
    this.partyOverdue = overdue;

    // 5. Generate Ledger
    // Debits: Invoices, Credits: Payments
    const ledgerRows: any[] = [];
    this.partyInvoices.forEach(inv => {
      ledgerRows.push({
        id: inv.id,
        date: inv.date,
        desc: `Invoice raised: ${inv.invoiceNo}`,
        debit: inv.grandTotal,
        credit: 0,
        rawDate: new Date(inv.date).getTime()
      });
    });

    this.partyPayments.forEach(pay => {
      ledgerRows.push({
        id: pay.id,
        date: pay.date,
        desc: `Payment Received Ref: ${pay.reference}`,
        debit: 0,
        credit: pay.amount,
        rawDate: new Date(pay.date).getTime()
      });
    });

    // Sort by date ascending
    ledgerRows.sort((a, b) => a.rawDate - b.rawDate);

    // Accumulate Balance
    let balance = 0;
    this.partyLedger = ledgerRows.map(row => {
      balance = balance + row.debit - row.credit;
      return { ...row, balance };
    }).reverse(); // display latest first
  }

  // CRUD MODALS
  openAddModal() {
    this.editMode = false;
    this.formData = {
      partyType: 'Customer',
      status: 'Active',
      paymentDueDays: 30,
      creditLimit: 200000,
      currency: 'INR',
      bankDetails: { bankName: '', accountName: '', accountNumber: '', ifsc: '', branch: '' }
    };
    this.isFormOpen = true;
  }

  openEditModal(party: Party) {
    this.editMode = true;
    this.formData = JSON.parse(JSON.stringify(party)); // deep copy
    this.formData.bankDetails = this.formData.bankDetails || { bankName: '', accountName: '', accountNumber: '', ifsc: '', branch: '' };
    this.isFormOpen = true;
  }

  submitForm() {
    if (this.formData.companyName && this.formData.contactPerson) {
      this.crmStorage.saveParty(this.formData as Party);
      this.isFormOpen = false;
    }
  }

  deleteParty(id: string) {
    if (confirm('Are you sure you want to delete this party?')) {
      this.crmStorage.deleteParty(id);
    }
  }
}
