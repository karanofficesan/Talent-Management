import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../../shared/components/common/component-card/component-card.component';
import { ModalComponent } from '../../../shared/components/ui/modal/modal.component';
import { BadgeComponent } from '../../../shared/components/ui/badge/badge.component';

import {
  CrmStorageService,
  Booking,
  Party,
  Model,
  MastersData
} from '../../../shared/services/crm-storage.service';

@Component({
  selector: 'app-crm-bookings',
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
      <app-page-breadcrumb pageTitle="Shoot Bookings & Assignments" />

      <!-- Controls Row -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800">
        <!-- Search -->
        <input type="text" [(ngModel)]="searchQuery" (input)="filterBookings()" placeholder="Search Booking No, Client, Venue..." class="h-10 px-4 rounded-lg border border-gray-300 bg-transparent text-sm dark:border-gray-700 dark:text-white placeholder:text-gray-400 focus:outline-none w-72">
        
        <!-- Add Button -->
        <button (click)="openAddModal()" class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">
          + Add Booking
        </button>
      </div>

      <!-- Bookings Table -->
      <div class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div class="max-w-full overflow-x-auto">
          <table class="min-w-full">
            <thead class="border-b border-gray-100 dark:border-white/[0.05]">
              <tr class="bg-gray-50 dark:bg-gray-850">
                <th class="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400">Booking ID / Date</th>
                <th class="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400">Client / Brand</th>
                <th class="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400">Models Assigned</th>
                <th class="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400">Shoot details</th>
                <th class="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400">Contract Value</th>
                <th class="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</th>
                <th class="px-5 py-3 font-semibold text-gray-500 text-center text-theme-xs dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-white/[0.05]">
              @for (b of filteredBookings; track b.id) {
                <tr class="hover:bg-gray-50/50 dark:hover:bg-gray-850/50 transition cursor-pointer" (click)="viewBookingDetails(b)">
                  <td class="px-5 py-4">
                    <span class="block font-semibold text-gray-800 dark:text-white/90 text-sm">{{ b.bookingNo }}</span>
                    <span class="block text-gray-400 text-xs mt-0.5">📅 Shoot Date: {{ b.shootDate | date:'mediumDate' }}</span>
                  </td>
                  <td class="px-5 py-4 text-xs text-gray-600 dark:text-gray-300">
                    <p class="font-semibold text-gray-750 dark:text-gray-250">{{ getClientName(b.customerId) }}</p>
                    <p>Brand: {{ getBrandLabel(b.brandId) }} | Category: {{ getCategoryLabel(b.categoryId) }}</p>
                  </td>
                  <td class="px-5 py-4 text-xs text-gray-600 dark:text-gray-300">
                    <p class="font-semibold text-indigo-600 dark:text-indigo-400">{{ b.modelIds.length }} Models</p>
                    <p class="text-gray-400 mt-0.5">{{ getModelsNames(b.modelIds) }}</p>
                  </td>
                  <td class="px-5 py-4 text-xs text-gray-650 dark:text-gray-300">
                    <p>📍 {{ b.venue }}</p>
                    <p>⏰ {{ b.shootTime }}</p>
                    <p>👤 Coord: {{ getCoordinatorLabel(b.coordinatorId) }}</p>
                  </td>
                  <td class="px-5 py-4 text-sm font-bold text-gray-800 dark:text-white">
                    ₹{{ b.sellingPrice | number }}
                  </td>
                  <td class="px-5 py-4">
                    <app-badge size="sm" [color]="getStatusColor(b.status)">{{ b.status }}</app-badge>
                  </td>
                  <td class="px-5 py-4 text-center" (click)="$event.stopPropagation()">
                    <div class="flex items-center justify-center gap-2">
                      @if (b.status !== 'Cancelled') {
                        <button (click)="cancelBooking(b.id)" class="px-2.5 py-1.5 text-[10px] font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg dark:bg-red-950/20 dark:text-red-400 transition" title="Cancel Booking">
                          Cancel
                        </button>
                      }
                      <button (click)="deleteBooking(b.id)" class="p-1 text-gray-400 hover:text-red-650 rounded" title="Delete record">
                        <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="px-5 py-8 text-center text-gray-400 text-sm">No bookings scheduled.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Booking detail overview modal -->
      <app-modal [isOpen]="!!selectedBooking" (close)="selectedBooking = null">
        @if (selectedBooking) {
          <div class="p-6 space-y-4 text-xs text-gray-600 dark:text-gray-300">
            <h3 class="text-lg font-bold text-gray-800 dark:text-white">Booking Details: {{ selectedBooking.bookingNo }}</h3>
            
            <div class="grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-gray-800 pt-3">
              <div>
                <span class="text-gray-400 block">Client</span>
                <span class="font-bold text-gray-850 dark:text-white text-sm">{{ getClientName(selectedBooking.customerId) }}</span>
              </div>
              <div>
                <span class="text-gray-400 block">Shoot Date & Location</span>
                <span class="font-bold text-gray-850 dark:text-white">{{ selectedBooking.shootDate | date:'mediumDate' }} at {{ selectedBooking.venue }}</span>
              </div>
              <div>
                <span class="text-gray-400 block">Brand & Category</span>
                <span class="font-bold text-gray-850 dark:text-white">{{ getBrandLabel(selectedBooking.brandId) }} | {{ getCategoryLabel(selectedBooking.categoryId) }}</span>
              </div>
              <div>
                <span class="text-gray-400 block">Shoot Coordinator</span>
                <span class="font-bold text-gray-850 dark:text-white">{{ getCoordinatorLabel(selectedBooking.coordinatorId) }}</span>
              </div>
              <div>
                <span class="text-gray-400 block">Models Booked</span>
                <span class="font-bold text-indigo-600 dark:text-indigo-400 text-xs">{{ getModelsNames(selectedBooking.modelIds) }}</span>
              </div>
              <div>
                <span class="text-gray-400 block">Contract Amount</span>
                <span class="font-bold text-gray-850 dark:text-white text-sm">₹{{ selectedBooking.sellingPrice | number }}</span>
              </div>
            </div>

            <div class="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-xl">
              <span class="font-bold text-blue-600 dark:text-blue-400 block mb-1">State Automations Active:</span>
              <ul class="list-disc pl-4 space-y-0.5 text-[10px]">
                <li>Models availability status: locked to <span class="font-bold">Booked</span>.</li>
                <li>Invoice generated: <span class="font-bold">Auto Pending</span>.</li>
                <li>Ledger statement: <span class="font-bold">Auto Debited</span>.</li>
              </ul>
            </div>

            <div class="flex justify-end gap-2 pt-4">
              <button (click)="selectedBooking = null" class="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">Close Panel</button>
            </div>
          </div>
        }
      </app-modal>

      <!-- Edit / Add Modal Form -->
      <app-modal [isOpen]="isFormOpen" (close)="isFormOpen = false">
        <div class="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          <h3 class="text-lg font-bold text-gray-800 dark:text-white">
            Schedule Shoot Booking
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
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Shoot Date *</label>
              <input type="date" [(ngModel)]="formData.shootDate" name="shootDate" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Shoot Time *</label>
              <input type="text" [(ngModel)]="formData.shootTime" name="shootTime" placeholder="e.g. 09:00 AM - 06:00 PM" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Venue *</label>
              <input type="text" [(ngModel)]="formData.venue" name="venue" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Coordinator *</label>
              <select [(ngModel)]="formData.coordinatorId" name="coordinatorId" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white dark:bg-gray-900">
                @for (c of masters?.coordinators; track c.id) {
                  <option [value]="c.id">{{ c.name }}</option>
                }
              </select>
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Selling Price (₹) *</label>
              <input type="number" [(ngModel)]="formData.sellingPrice" name="sellingPrice" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
            </div>

            <!-- Model checklist -->
            <div class="col-span-2">
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Select Models to Book *</label>
              <div class="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto p-2 border border-gray-200 dark:border-gray-750 rounded-lg bg-gray-50 dark:bg-gray-850">
                @for (m of allModels; track m.id) {
                  <div class="flex items-center gap-2">
                    <input type="checkbox" [id]="'bm_'+m.id" [checked]="isModelSelected(m.id)" (change)="toggleModel(m.id)" class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer">
                    <label [for]="'bm_'+m.id" class="text-xs text-gray-700 dark:text-gray-350 select-none cursor-pointer">{{ m.name }} (₹{{ m.dayRate }}) - [{{ m.status }}]</label>
                  </div>
                }
              </div>
            </div>

            <div class="col-span-2">
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Special Instructions / Remarks</label>
              <textarea [(ngModel)]="formData.remarks" name="remarks" class="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm dark:border-gray-700 dark:text-white" rows="2"></textarea>
            </div>

            <div class="flex justify-end gap-3 col-span-2 mt-4 border-t border-gray-100 dark:border-gray-800 pt-4">
              <button type="button" (click)="isFormOpen = false" class="px-4 py-2 text-sm font-medium text-gray-500 border rounded-lg hover:bg-gray-50">Cancel</button>
              <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Save Booking</button>
            </div>
          </form>
        </div>
      </app-modal>
    </div>
  `
})
export class CrmBookingsComponent implements OnInit, OnDestroy {

  private sub = new Subscription();
  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  clients: Party[] = [];
  allModels: Model[] = [];
  masters: MastersData | null = null;
  searchQuery: string = '';

  // Detail Modal view
  selectedBooking: Booking | null = null;

  // Form states
  isFormOpen = false;
  formData: Partial<Booking> = { modelIds: [] };

  constructor(private crmStorage: CrmStorageService) { }

  ngOnInit() {
    this.sub.add(this.crmStorage.getBookings$().subscribe(list => {
      this.bookings = list;
      this.filterBookings();
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

  getStatusColor(status: Booking['status']): 'success' | 'warning' | 'error' | 'info' {
    if (status === 'Confirmed') return 'success';
    if (status === 'Tentative') return 'warning';
    if (status === 'Hold') return 'info';
    return 'error';
  }

  getClientName(id: string): string {
    const c = this.clients.find(p => p.id === id);
    return c ? c.companyName : 'Unknown Client';
  }

  getBrandLabel(id: string): string {
    const item = this.masters?.brands.find(b => b.id === id);
    return item ? item.name : 'Other';
  }

  getCategoryLabel(id: string): string {
    const item = this.masters?.categories.find(c => c.id === id);
    return item ? item.name : 'Other';
  }

  getCoordinatorLabel(id: string): string {
    const item = this.masters?.coordinators.find(c => c.id === id);
    return item ? item.name : 'None';
  }

  getModelsNames(ids: string[]): string {
    return this.allModels.filter(m => ids.includes(m.id)).map(m => m.name).join(', ') || 'None';
  }

  filterBookings() {
    if (!this.searchQuery) {
      this.filteredBookings = this.bookings;
      return;
    }
    const q = this.searchQuery.toLowerCase();
    this.filteredBookings = this.bookings.filter(b =>
      b.bookingNo.toLowerCase().includes(q) ||
      this.getClientName(b.customerId).toLowerCase().includes(q) ||
      b.venue.toLowerCase().includes(q)
    );
  }

  viewBookingDetails(b: Booking) {
    this.selectedBooking = b;
  }

  // Model Selection checklist helpers
  isModelSelected(id: string): boolean {
    return this.formData.modelIds?.includes(id) || false;
  }

  toggleModel(id: string) {
    this.formData.modelIds = this.formData.modelIds || [];
    const idx = this.formData.modelIds.indexOf(id);
    if (idx > -1) {
      this.formData.modelIds.splice(idx, 1);
    } else {
      this.formData.modelIds.push(id);
    }
  }

  // Action Cancel booking
  cancelBooking(id: string) {
    if (confirm('Are you sure you want to cancel this booking assignment? This will release the models back to Available status.')) {
      this.crmStorage.cancelBooking(id);
    }
  }

  // CRUD MODALS
  openAddModal() {
    this.formData = {
      customerId: this.clients[0]?.id || '',
      brandId: this.masters?.brands[0]?.id || '',
      categoryId: this.masters?.categories[0]?.id || '',
      coordinatorId: this.masters?.coordinators[0]?.id || '',
      shootDate: new Date().toISOString().split('T')[0],
      shootTime: '09:00 AM - 06:00 PM',
      venue: '',
      sellingPrice: 40000,
      remarks: '',
      modelIds: [],
      status: 'Confirmed'
    };
    this.isFormOpen = true;
  }

  submitForm() {
    if (this.formData.customerId && this.formData.modelIds && this.formData.modelIds.length > 0 && this.formData.shootDate) {
      this.crmStorage.saveBooking(this.formData as Booking);
      this.isFormOpen = false;
    } else {
      alert('Please fill out all required fields and select at least one Model.');
    }
  }

  deleteBooking(id: string) {
    if (confirm('Are you sure you want to completely delete this booking record? (Does not undo invoice generation automatically)')) {
      this.crmStorage.deleteBooking(id);
    }
  }
}
