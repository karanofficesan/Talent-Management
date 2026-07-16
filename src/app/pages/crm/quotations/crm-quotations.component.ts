import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ModalComponent } from '../../../shared/components/ui/modal/modal.component';
import { BadgeComponent } from '../../../shared/components/ui/badge/badge.component';

import {
  CrmStorageService,
  Quotation,
  Party,
  Model,
  MastersData,
  FollowUp
} from '../../../shared/services/crm-storage.service';

@Component({
  selector: 'app-crm-quotations',
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
      <app-page-breadcrumb pageTitle="Quotations & Proformas" />

      <!-- Controls Row -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800">
        <!-- Search -->
        <input type="text" [(ngModel)]="searchQuery" (input)="filterQuotes()" placeholder="Search Quote No or Client..." class="h-10 px-4 rounded-lg border border-gray-300 bg-transparent text-sm dark:border-gray-700 dark:text-white placeholder:text-gray-400 focus:outline-none w-72">
        
        <!-- Add Button -->
        <button (click)="openAddModal()" class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">
          + Create Quotation
        </button>
      </div>

      <!-- Quotations Table -->
      <div class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div class="max-w-full overflow-x-auto">
          <table class="min-w-full">
            <thead class="border-b border-gray-100 dark:border-white/[0.05]">
              <tr class="bg-gray-50 dark:bg-gray-850">
                <th class="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400">Quote No / Date</th>
                <th class="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400">Client / Brand</th>
                <th class="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400">Models Shortlisted</th>
                <th class="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400">Grand Total</th>
                <th class="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400">Validity</th>
                <th class="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</th>
                <th class="px-5 py-3 font-semibold text-gray-500 text-center text-theme-xs dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-white/[0.05]">
              @for (qt of filteredQuotes; track qt.id) {
                <tr class="hover:bg-gray-50/50 dark:hover:bg-gray-850/50 transition cursor-pointer" (click)="viewQuoteDetails(qt)">
                  <td class="px-5 py-4">
                    <span class="block font-semibold text-gray-800 dark:text-white/90 text-sm">{{ qt.quotationNo }}</span>
                    <span class="block text-gray-400 text-xs mt-0.5">📅 {{ qt.date | date:'mediumDate' }}</span>
                  </td>
                  <td class="px-5 py-4 text-xs text-gray-600 dark:text-gray-300">
                    <p class="font-semibold text-gray-700 dark:text-gray-200">{{ getClientName(qt.customerId) }}</p>
                    <p>Brand: {{ getBrandLabel(qt.brandId) }} | Category: {{ getCategoryLabel(qt.categoryId) }}</p>
                  </td>
                  <td class="px-5 py-4 text-xs text-gray-600 dark:text-gray-300">
                    <p class="font-medium">{{ qt.models.length }} Models</p>
                    <p class="text-gray-400 mt-0.5">{{ getModelShortlistLabels(qt.models) }}</p>
                  </td>
                  <td class="px-5 py-4 text-sm font-bold text-gray-800 dark:text-white">
                    ₹{{ qt.grandTotal | number }}
                  </td>
                  <td class="px-5 py-4 text-xs">
                    @if (isExpired(qt)) {
                      <span class="text-red-500 font-semibold">Expired</span>
                    } @else {
                      <span class="text-green-500 font-semibold">{{ getDaysLeft(qt) }} Days left</span>
                    }
                    <span class="block text-gray-400 mt-0.5">Expires: {{ getExpiryDate(qt) | date:'shortDate' }}</span>
                  </td>
                  <td class="px-5 py-4">
                    <app-badge size="sm" [color]="getStatusColor(qt.status)">{{ qt.status }}</app-badge>
                  </td>
                  <td class="px-5 py-4 text-center" (click)="$event.stopPropagation()">
                    <div class="flex items-center justify-center gap-2">
                      <button (click)="openEditModal(qt)" class="p-1 text-gray-400 hover:text-blue-600 rounded" title="Edit">
                        <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
                      <button (click)="deleteQuote(qt.id)" class="p-1 text-gray-400 hover:text-red-600 rounded" title="Delete">
                        <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="px-5 py-8 text-center text-gray-400 text-sm">No quotations found.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Quotation Preview, Print, & Follow-up Drawer -->
      <app-modal [isOpen]="!!selectedQuote" (close)="selectedQuote = null" [isFullscreen]="true" [className]="'bg-gray-50 dark:bg-gray-950 p-6 overflow-y-auto'">
        @if (selectedQuote) {
          <div class="max-w-5xl mx-auto space-y-6 pt-8">
            <!-- Top Action Banner -->
            <div class="p-6 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800 flex flex-wrap justify-between items-center gap-4">
              <div>
                <span class="text-xs font-semibold text-blue-600 uppercase">Quotation Review Desk</span>
                <h2 class="text-xl font-bold text-gray-800 dark:text-white mt-1">Ref: {{ selectedQuote.quotationNo }}</h2>
              </div>
              <div class="flex items-center gap-2">
                <button (click)="simulateShare('Email')" class="px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 flex items-center gap-1.5">
                  ✉️ Email Client
                </button>
                <button (click)="simulateShare('WhatsApp')" class="px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 flex items-center gap-1.5">
                  💬 WhatsApp Share
                </button>
                <button (click)="printQuote()" class="px-3 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 flex items-center gap-1.5">
                  🖨️ Print / Save PDF
                </button>
                <button (click)="selectedQuote = null" class="px-3 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">Close</button>
              </div>
            </div>

            <!-- Content Split: Print Layout & Follow-up Desk -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <!-- Printable Sheet -->
              <div id="quotationPrintSheet" class="lg:col-span-2 p-8 bg-white text-gray-800 border border-gray-200 rounded-2xl space-y-6 shadow-sm">
                <!-- Agency Header -->
                <div class="flex justify-between items-start border-b border-gray-100 pb-5">
                  <div>
                    <h2 class="text-xl font-bold text-blue-600">ANTIGRAVITY TALENT LTD</h2>
                    <p class="text-xs text-gray-500 mt-1">102 Fashion Boulevard, Bandra West, Mumbai - 400050<br>GSTIN: 27AAAAA1111A1Z1 | contact&#64;antigravity.co</p>
                  </div>
                  <div class="text-right">
                    <h3 class="text-lg font-bold text-gray-700 uppercase">Proforma Invoice</h3>
                    <p class="text-xs text-gray-500 mt-1">No: <span class="font-bold text-gray-800">{{ selectedQuote.quotationNo }}</span><br>Date: {{ selectedQuote.date | date:'mediumDate' }}<br>Expiry: {{ getExpiryDate(selectedQuote) | date:'mediumDate' }}</p>
                  </div>
                </div>

                <!-- Client Billing Address -->
                <div class="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <h5 class="font-bold text-gray-400 uppercase">Invoice To:</h5>
                    <p class="font-bold text-gray-800 mt-1">{{ getClientName(selectedQuote.customerId) }}</p>
                    <p class="text-gray-500 mt-0.5">{{ getClientAddress(selectedQuote.customerId) }}</p>
                  </div>
                  <div class="text-right">
                    <h5 class="font-bold text-gray-400 uppercase">Shoot Specs:</h5>
                    <p class="text-gray-700 mt-1"><span class="font-semibold">Brand:</span> {{ getBrandLabel(selectedQuote.brandId) }}</p>
                    <p class="text-gray-700"><span class="font-semibold">Shoot Category:</span> {{ getCategoryLabel(selectedQuote.categoryId) }}</p>
                  </div>
                </div>

                <!-- Models & Day Rates Table -->
                <table class="min-w-full text-xs border-collapse">
                  <thead>
                    <tr class="border-b border-gray-200 text-left bg-gray-50 text-gray-500 font-bold">
                      <th class="py-2.5 px-3">Item #</th>
                      <th class="py-2.5 px-3">Model Profile Shortlisted</th>
                      <th class="py-2.5 px-3 text-right">Selling Day Rate (₹)</th>
                      <th class="py-2.5 px-3">Status / Hold</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100">
                    @for (m of selectedQuote.models; track $index) {
                      <tr>
                        <td class="py-3 px-3">{{ $index + 1 }}</td>
                        <td class="py-3 px-3">
                          <span class="font-bold block text-gray-850">{{ getModelName(m.modelId) }}</span>
                          <span class="text-gray-400 block text-[10px]">{{ m.remarks }}</span>
                        </td>
                        <td class="py-3 px-3 text-right font-semibold">₹{{ m.sellingPrice | number }}</td>
                        <td class="py-3 px-3 text-gray-500 font-semibold">{{ m.status }}</td>
                      </tr>
                    }
                  </tbody>
                </table>

                <!-- Summary math -->
                <div class="flex justify-end pt-4 border-t border-gray-100">
                  <div class="w-64 text-xs space-y-2 text-gray-600">
                    <div class="flex justify-between">
                      <span>Subtotal Day Rates:</span>
                      <span class="font-semibold text-gray-800">₹{{ getSubtotal(selectedQuote) | number }}</span>
                    </div>
                    @if (selectedQuote.enableGst) {
                      <div class="flex justify-between">
                        <span>GST ({{ selectedQuote.gstRate }}%):</span>
                        <span class="font-semibold text-gray-800">₹{{ selectedQuote.taxAmount | number }}</span>
                      </div>
                    }
                    <div class="flex justify-between border-t border-gray-200 pt-2 text-sm font-bold text-gray-800">
                      <span>Grand Total:</span>
                      <span>₹{{ selectedQuote.grandTotal | number }}</span>
                    </div>
                  </div>
                </div>

                <!-- Terms -->
                <div class="border-t border-gray-100 pt-4 text-[10px] text-gray-400">
                  <h6 class="font-bold uppercase mb-1">Terms & Conditions:</h6>
                  <p class="whitespace-pre-line">{{ selectedQuote.terms }}</p>
                </div>
              </div>

              <!-- Follow up pipeline timeline -->
              <div class="space-y-6">
                <!-- Add Log Card -->
                <div class="p-6 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800 space-y-4">
                  <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Add Follow-Up Contact</h3>
                  <form (submit)="submitFollowUp()" class="space-y-3 text-xs">
                    <div>
                      <label class="block mb-1 font-semibold text-gray-500 uppercase">Contact Date *</label>
                      <input type="date" [(ngModel)]="newFollow.date" name="followDate" required class="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-xs dark:border-gray-700 dark:text-white">
                    </div>
                    <div>
                      <label class="block mb-1 font-semibold text-gray-500 uppercase">Discussion log *</label>
                      <textarea [(ngModel)]="newFollow.discussion" name="followDisc" required class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-xs dark:border-gray-700 dark:text-white" rows="3" placeholder="Client feedback..."></textarea>
                    </div>
                    <div>
                      <label class="block mb-1 font-semibold text-gray-500 uppercase">Next Follow-Up Date</label>
                      <input type="date" [(ngModel)]="newFollow.nextFollowUpDate" name="followNext" class="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-xs dark:border-gray-700 dark:text-white">
                    </div>
                    <div class="flex items-center gap-2">
                      <input type="checkbox" id="followRem" [(ngModel)]="newFollow.reminder" name="followReminder" class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500">
                      <label for="followRem" class="font-semibold text-gray-600 dark:text-gray-400">Set Calendar reminder</label>
                    </div>
                    <button type="submit" class="w-full py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Save Log Entry</button>
                  </form>
                </div>

                <!-- Interaction Trail -->
                <div class="p-6 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800 space-y-4">
                  <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Interaction Trail ({{ selectedQuote.followUps.length }})</h3>
                  <div class="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-150 dark:before:bg-gray-800 overflow-y-auto max-h-[300px] pr-2">
                    @for (f of getSortedFollowUps(selectedQuote.followUps); track f.id) {
                      <div class="relative text-xs">
                        <div class="absolute -left-[22px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white bg-blue-600 dark:border-gray-900 shadow"></div>
                        <div class="bg-gray-50 dark:bg-gray-850 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                          <span class="block text-[10px] text-gray-400 font-semibold">{{ f.date | date:'mediumDate' }}</span>
                          <p class="text-gray-650 dark:text-gray-300 mt-1 whitespace-pre-line">{{ f.discussion }}</p>
                        </div>
                      </div>
                    } @empty {
                      <p class="text-xs text-gray-400 text-center py-4">No follow-ups recorded yet.</p>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      </app-modal>

      <!-- Edit / Add Modal Form -->
      <app-modal [isOpen]="isFormOpen" (close)="isFormOpen = false">
        <div class="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          <h3 class="text-lg font-bold text-gray-800 dark:text-white">
            {{ editMode ? 'Edit Quotation Details' : 'Create Proforma Quotation' }}
          </h3>
          <form (submit)="submitForm()" class="grid grid-cols-2 gap-4">
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Customer *</label>
              <select [(ngModel)]="formData.customerId" name="customerId" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white dark:bg-gray-900">
                @for (c of clients; track c.id) {
                  <option [value]="c.id">{{ c.companyName }}</option>
                }
              </select>
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Brand *</label>
              <select [(ngModel)]="formData.brandId" name="brandId" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white dark:bg-gray-900">
                @for (b of masters?.brands; track b.id) {
                  <option [value]="b.id">{{ b.name }}</option>
                }
              </select>
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Category *</label>
              <select [(ngModel)]="formData.categoryId" name="categoryId" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white dark:bg-gray-900">
                @for (cat of masters?.categories; track cat.id) {
                  <option [value]="cat.id">{{ cat.name }}</option>
                }
              </select>
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Date *</label>
              <input type="date" [(ngModel)]="formData.date" name="date" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Validity (Days) *</label>
              <input type="number" [(ngModel)]="formData.validityDays" name="validityDays" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Quotation Status</label>
              <select [(ngModel)]="formData.status" name="status" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white dark:bg-gray-900">
                <option value="Sent">Sent</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div class="flex items-center gap-2 mt-6">
              <input type="checkbox" id="enableGst" [(ngModel)]="formData.enableGst" name="enableGst" class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500">
              <label for="enableGst" class="text-sm font-semibold text-gray-600 dark:text-gray-400">Enable GST (18%)</label>
            </div>

            <!-- Model Selection Subform -->
            <div class="col-span-2 border-t border-gray-100 dark:border-gray-800 pt-3">
              <h5 class="text-xs font-bold text-gray-400 uppercase mb-2">Model Selection & Pricing Overrides</h5>
              <div class="space-y-2">
                @for (qm of formData.models; track $index) {
                  <div class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-850 rounded-lg">
                    <select [(ngModel)]="qm.modelId" [name]="'modelId_'+$index" class="h-9 flex-1 rounded-lg border border-gray-300 bg-transparent px-2 text-xs dark:border-gray-750 dark:text-white dark:bg-gray-900">
                      <option value="">Select Model</option>
                      @for (m of allModels; track m.id) {
                        <option [value]="m.id">{{ m.name }} (Day Rate: ₹{{ m.dayRate }})</option>
                      }
                    </select>
                    <input type="number" [(ngModel)]="qm.sellingPrice" [name]="'price_'+$index" placeholder="Selling Day Rate" class="h-9 w-28 rounded-lg border border-gray-300 bg-transparent px-2 text-xs dark:border-gray-750 dark:text-white">
                    <input type="text" [(ngModel)]="qm.remarks" [name]="'rem_'+$index" placeholder="Hold Remarks" class="h-9 w-36 rounded-lg border border-gray-300 bg-transparent px-2 text-xs dark:border-gray-750 dark:text-white">
                    <button type="button" (click)="removeModelFromQt($index)" class="p-1 text-red-500 hover:bg-red-50 rounded">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                }
                <button type="button" (click)="addModelToQt()" class="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">+ Add Model Line</button>
              </div>
            </div>

            <div class="col-span-2">
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Terms & Conditions</label>
              <textarea [(ngModel)]="formData.terms" name="terms" class="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm dark:border-gray-700 dark:text-white" rows="2"></textarea>
            </div>

            <div class="flex justify-end gap-3 col-span-2 mt-4 border-t border-gray-100 dark:border-gray-800 pt-4">
              <button type="button" (click)="isFormOpen = false" class="px-4 py-2 text-sm font-medium text-gray-500 border rounded-lg hover:bg-gray-50">Cancel</button>
              <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Save Quotation</button>
            </div>
          </form>
        </div>
      </app-modal>
    </div>
  `
})
export class CrmQuotationsComponent implements OnInit, OnDestroy {

  private sub = new Subscription();
  quotes: Quotation[] = [];
  filteredQuotes: Quotation[] = [];
  clients: Party[] = [];
  allModels: Model[] = [];
  masters: MastersData | null = null;
  searchQuery: string = '';

  // Pipeline follow-ups drawer details
  selectedQuote: Quotation | null = null;
  newFollow: Partial<FollowUp> = {};

  // Form states
  isFormOpen = false;
  editMode = false;
  formData: Partial<Quotation> = { models: [], enableGst: true, gstRate: 18 };

  constructor(private crmStorage: CrmStorageService) { }

  ngOnInit() {
    this.sub.add(this.crmStorage.getQuotations$().subscribe(list => {
      this.quotes = list;
      this.filterQuotes();
      if (this.selectedQuote) {
        const fresh = list.find(q => q.id === this.selectedQuote!.id);
        if (fresh) this.selectedQuote = fresh;
      }
    }));
    this.sub.add(this.crmStorage.getParties$().subscribe(parties => {
      this.clients = parties.filter(p => p.partyType === 'Customer' || p.partyType === 'Customer + Vendor');
    }));
    this.sub.add(this.crmStorage.getModels$().subscribe(models => this.allModels = models));
    this.sub.add(this.crmStorage.getMasters$().subscribe(data => this.masters = data));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  getStatusColor(status: Quotation['status']): 'success' | 'primary' | 'error' {
    if (status === 'Approved') return 'success';
    if (status === 'Sent') return 'primary';
    return 'error';
  }

  getClientName(id: string): string {
    const c = this.clients.find(p => p.id === id);
    return c ? c.companyName : 'Unknown Client';
  }

  getClientAddress(id: string): string {
    const c = this.clients.find(p => p.id === id);
    return c ? `${c.address}, ${c.city} - ${c.pincode}, ${c.state}` : '';
  }

  getBrandLabel(id: string): string {
    const item = this.masters?.brands.find(b => b.id === id);
    return item ? item.name : 'Other';
  }

  getCategoryLabel(id: string): string {
    const item = this.masters?.categories.find(c => c.id === id);
    return item ? item.name : 'Other';
  }

  getModelName(id: string): string {
    const m = this.allModels.find(item => item.id === id);
    return m ? m.name : 'Unknown Model';
  }

  getModelShortlistLabels(models: Quotation['models']): string {
    return models.map(qm => this.getModelName(qm.modelId)).join(', ') || 'None';
  }

  getExpiryDate(qt: Quotation): Date {
    const d = new Date(qt.date);
    d.setDate(d.getDate() + qt.validityDays);
    return d;
  }

  isExpired(qt: Quotation): boolean {
    return this.getExpiryDate(qt).getTime() < Date.now();
  }

  getDaysLeft(qt: Quotation): number {
    const diff = this.getExpiryDate(qt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  getSubtotal(qt: Quotation): number {
    return qt.models.reduce((acc, m) => acc + m.sellingPrice, 0);
  }

  filterQuotes() {
    if (!this.searchQuery) {
      this.filteredQuotes = this.quotes;
      return;
    }
    const q = this.searchQuery.toLowerCase();
    this.filteredQuotes = this.quotes.filter(qt =>
      qt.quotationNo.toLowerCase().includes(q) ||
      this.getClientName(qt.customerId).toLowerCase().includes(q)
    );
  }

  viewQuoteDetails(qt: Quotation) {
    this.selectedQuote = qt;
    this.newFollow = {
      date: new Date().toISOString().split('T')[0],
      discussion: '',
      nextFollowUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      reminder: true
    };
  }

  getSortedFollowUps(followUps: FollowUp[]): FollowUp[] {
    return [...followUps].sort((a, b) => b.date.localeCompare(a.date));
  }

  submitFollowUp() {
    if (this.selectedQuote && this.newFollow.date && this.newFollow.discussion) {
      this.crmStorage.addQuotationFollowUp(this.selectedQuote.id, this.newFollow as FollowUp);
      this.newFollow = {
        date: new Date().toISOString().split('T')[0],
        discussion: '',
        nextFollowUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        reminder: true
      };
    }
  }

  // Share Options Simulation
  simulateShare(platform: 'WhatsApp' | 'Email') {
    if (!this.selectedQuote) return;
    const client = this.getClientName(this.selectedQuote.customerId);
    const msg = `Quotation ${this.selectedQuote.quotationNo} shared successfully via ${platform} to ${client}!`;
    alert(msg);
  }

  printQuote() {
    const printContents = document.getElementById('quotationPrintSheet')?.innerHTML;
    if (!printContents) return;
    const originalContents = document.body.innerHTML;

    // Simple mock print popup
    const popup = window.open('', '_blank');
    popup?.document.write(`
      <html>
        <head>
          <title>Print Quotation</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>body { padding: 40px; font-family: sans-serif; }</style>
        </head>
        <body onload="window.print();window.close()">
          <div class="max-w-4xl mx-auto">${printContents}</div>
        </body>
      </html>
    `);
    popup?.document.close();
  }

  // CRUD MODALS
  openAddModal() {
    this.editMode = false;
    this.formData = {
      date: new Date().toISOString().split('T')[0],
      customerId: this.clients[0]?.id || '',
      brandId: this.masters?.brands[0]?.id || '',
      categoryId: this.masters?.categories[0]?.id || '',
      validityDays: 15,
      terms: 'Standard agency terms: 50% advance payment.\nRates valid only for 15 days.\nUsage rights restricted to digital media.',
      enableGst: true,
      gstRate: 18,
      models: [],
      status: 'Sent'
    };
    this.addModelToQt();
    this.isFormOpen = true;
  }

  openEditModal(qt: Quotation) {
    this.editMode = true;
    this.formData = JSON.parse(JSON.stringify(qt));
    this.formData.models = this.formData.models || [];
    this.isFormOpen = true;
  }

  submitForm() {
    if (this.formData.customerId && this.formData.models && this.formData.models.length > 0) {
      this.crmStorage.saveQuotation(this.formData as Quotation);
      this.isFormOpen = false;
    }
  }

  deleteQuote(id: string) {
    if (confirm('Are you sure you want to remove this quotation?')) {
      this.crmStorage.deleteQuotation(id);
    }
  }

  // Model Selection lines helper
  addModelToQt() {
    this.formData.models = this.formData.models || [];
    this.formData.models.push({ modelId: '', sellingPrice: 20000, remarks: '', status: 'Hold' });
  }

  removeModelFromQt(idx: number) {
    this.formData.models?.splice(idx, 1);
  }
}
