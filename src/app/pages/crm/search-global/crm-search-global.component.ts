import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { BadgeComponent } from '../../../shared/components/ui/badge/badge.component';

import {
  CrmStorageService,
  Model,
  Party,
  Invoice,
  Booking
} from '../../../shared/services/crm-storage.service';

@Component({
  selector: 'app-crm-search-global',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageBreadcrumbComponent,
    BadgeComponent
  ],
  template: `
    <div class="space-y-6">
      <app-page-breadcrumb pageTitle="Unified CRM Global Search" />

      <!-- Centered search bar -->
      <div class="max-w-2xl mx-auto space-y-4">
        <div class="relative">
          <input type="text" [(ngModel)]="query" (input)="onSearch()" placeholder="Search Models, Clients, Bookings, or Invoices..." class="h-14 w-full rounded-2xl border border-gray-300 bg-white px-5 pr-12 text-base dark:border-gray-800 dark:bg-white/[0.03] dark:text-white placeholder:text-gray-400 focus:outline-none shadow-md">
          <span class="absolute right-4 top-4 text-gray-450 text-xl">🔍</span>
        </div>
      </div>

      <!-- Results grouping -->
      @if (query) {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <!-- 1. Models Matches -->
          <div class="p-6 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800 space-y-4">
            <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider">Models Found ({{ matchModels.length }})</h3>
            <div class="space-y-2 max-h-[300px] overflow-y-auto pr-1 text-xs">
              @for (m of matchModels; track m.id) {
                <div class="p-3 bg-gray-50 dark:bg-gray-850 rounded-xl flex justify-between items-center hover:bg-gray-100/50 transition">
                  <div>
                    <span class="font-bold text-gray-850 dark:text-white text-sm">{{ m.name }}</span>
                    <span class="text-gray-400 block text-[10px]">{{ m.gender }} | {{ m.city }} | Day Rate: ₹{{ m.dayRate | number }}</span>
                  </div>
                  <app-badge size="sm" color="primary">{{ m.status }}</app-badge>
                </div>
              } @empty {
                <p class="text-gray-400 italic">No models match this query.</p>
              }
            </div>
          </div>

          <!-- 2. Parties Matches -->
          <div class="p-6 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800 space-y-4">
            <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider">Clients & Vendors Found ({{ matchParties.length }})</h3>
            <div class="space-y-2 max-h-[300px] overflow-y-auto pr-1 text-xs">
              @for (p of matchParties; track p.id) {
                <div class="p-3 bg-gray-50 dark:bg-gray-850 rounded-xl flex justify-between items-center hover:bg-gray-100/50 transition">
                  <div>
                    <span class="font-bold text-gray-850 dark:text-white text-sm">{{ p.companyName }}</span>
                    <span class="text-gray-400 block text-[10px]">Contact: {{ p.contactPerson }} | Mobile: {{ p.mobile }}</span>
                  </div>
                  <app-badge size="sm" color="info">{{ p.partyType }}</app-badge>
                </div>
              } @empty {
                <p class="text-gray-400 italic">No partners match this query.</p>
              }
            </div>
          </div>

          <!-- 3. Bookings Matches -->
          <div class="p-6 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800 space-y-4">
            <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider">Shoot Bookings Found ({{ matchBookings.length }})</h3>
            <div class="space-y-2 max-h-[300px] overflow-y-auto pr-1 text-xs">
              @for (b of matchBookings; track b.id) {
                <div class="p-3 bg-gray-50 dark:bg-gray-850 rounded-xl flex justify-between items-center hover:bg-gray-100/50 transition">
                  <div>
                    <span class="font-bold text-gray-850 dark:text-white text-sm">{{ b.bookingNo }}</span>
                    <span class="text-gray-400 block text-[10px]">Shoot Date: {{ b.shootDate | date:'mediumDate' }} | Venue: {{ b.venue }}</span>
                  </div>
                  <app-badge size="sm" color="info">{{ b.status }}</app-badge>
                </div>
              } @empty {
                <p class="text-gray-400 italic">No bookings match this query.</p>
              }
            </div>
          </div>

          <!-- 4. Invoices Matches -->
          <div class="p-6 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800 space-y-4">
            <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider">Invoices Found ({{ matchInvoices.length }})</h3>
            <div class="space-y-2 max-h-[300px] overflow-y-auto pr-1 text-xs">
              @for (i of matchInvoices; track i.id) {
                <div class="p-3 bg-gray-50 dark:bg-gray-850 rounded-xl flex justify-between items-center hover:bg-gray-100/50 transition">
                  <div>
                    <span class="font-bold text-gray-800 dark:text-white text-sm">{{ i.invoiceNo }}</span>
                    <span class="text-gray-400 block text-[10px]">Grand Total: ₹{{ i.grandTotal | number }} | Received: ₹{{ i.amountPaid | number }}</span>
                  </div>
                  <app-badge size="sm" color="success">{{ i.status }}</app-badge>
                </div>
              } @empty {
                <p class="text-gray-400 italic">No invoices match this query.</p>
              }
            </div>
          </div>
          
        </div>
      } @else {
        <!-- Call to Action -->
        <div class="text-center py-16 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl">
          <p class="text-sm text-gray-400">Start typing above to search across the CRM platform.</p>
        </div>
      }
    </div>
  `
})
export class CrmSearchGlobalComponent implements OnInit, OnDestroy {

  private sub = new Subscription();
  models: Model[] = [];
  parties: Party[] = [];
  bookings: Booking[] = [];
  invoices: Invoice[] = [];

  // query state
  query = '';

  // matches pools
  matchModels: Model[] = [];
  matchParties: Party[] = [];
  matchBookings: Booking[] = [];
  matchInvoices: Invoice[] = [];

  constructor(private crmStorage: CrmStorageService) { }

  ngOnInit() {
    this.sub.add(this.crmStorage.getModels$().subscribe(list => this.models = list));
    this.sub.add(this.crmStorage.getParties$().subscribe(list => this.parties = list));
    this.sub.add(this.crmStorage.getBookings$().subscribe(list => this.bookings = list));
    this.sub.add(this.crmStorage.getInvoices$().subscribe(list => this.invoices = list));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  onSearch() {
    if (!this.query) {
      this.matchModels = [];
      this.matchParties = [];
      this.matchBookings = [];
      this.matchInvoices = [];
      return;
    }
    const q = this.query.toLowerCase();

    this.matchModels = this.models.filter(m =>
      m.name.toLowerCase().includes(q) ||
      (m.city && m.city.toLowerCase().includes(q)) ||
      (m.instagram && m.instagram.toLowerCase().includes(q))
    );

    this.matchParties = this.parties.filter(p =>
      p.companyName.toLowerCase().includes(q) ||
      p.contactPerson.toLowerCase().includes(q)
    );

    this.matchBookings = this.bookings.filter(b =>
      b.bookingNo.toLowerCase().includes(q) ||
      b.venue.toLowerCase().includes(q)
    );

    this.matchInvoices = this.invoices.filter(i =>
      i.invoiceNo.toLowerCase().includes(q)
    );
  }
}
