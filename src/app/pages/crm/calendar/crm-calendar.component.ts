import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ModalComponent } from '../../../shared/components/ui/modal/modal.component';
import { BadgeComponent } from '../../../shared/components/ui/badge/badge.component';

import {
  CrmStorageService,
  Booking,
  Party,
  Model
} from '../../../shared/services/crm-storage.service';

@Component({
  selector: 'app-crm-calendar',
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
      <app-page-breadcrumb pageTitle="Interactive Shoot Calendar" />

      <!-- Calendar Header Filters -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800">
        <!-- View selection -->
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-0.5 rounded-lg bg-gray-100 dark:bg-gray-900 p-0.5 text-xs">
            <button
              (click)="viewMode = 'month'"
              [ngClass]="viewMode === 'month' ? 'shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800 font-semibold' : 'text-gray-500 dark:text-gray-400'"
              class="px-3 py-1.5 rounded-md transition hover:text-gray-900 dark:hover:text-white"
            >
              Month
            </button>
            <button
              (click)="viewMode = 'week'"
              [ngClass]="viewMode === 'week' ? 'shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800 font-semibold' : 'text-gray-500 dark:text-gray-400'"
              class="px-3 py-1.5 rounded-md transition hover:text-gray-900 dark:hover:text-white"
            >
              Week
            </button>
            <button
              (click)="viewMode = 'day'"
              [ngClass]="viewMode === 'day' ? 'shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800 font-semibold' : 'text-gray-500 dark:text-gray-400'"
              class="px-3 py-1.5 rounded-md transition hover:text-gray-900 dark:hover:text-white"
            >
              Day
            </button>
          </div>
          <span class="text-sm font-bold text-gray-800 dark:text-white">{{ getCalendarTitle() }}</span>
        </div>

        <!-- Status filters toggles -->
        <div class="flex flex-wrap gap-2 text-xs">
          <label class="flex items-center gap-1 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900 px-2 py-1 rounded-lg cursor-pointer">
            <input type="checkbox" [(ngModel)]="filters.confirmed" class="w-3.5 h-3.5 text-green-600 rounded"> Confirmed
          </label>
          <label class="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900 px-2 py-1 rounded-lg cursor-pointer">
            <input type="checkbox" [(ngModel)]="filters.tentative" class="w-3.5 h-3.5 text-yellow-600 rounded"> Tentative
          </label>
          <label class="flex items-center gap-1 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900 px-2 py-1 rounded-lg cursor-pointer">
            <input type="checkbox" [(ngModel)]="filters.hold" class="w-3.5 h-3.5 text-blue-600 rounded"> Hold
          </label>
          <label class="flex items-center gap-1 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900 px-2 py-1 rounded-lg cursor-pointer">
            <input type="checkbox" [(ngModel)]="filters.cancelled" class="w-3.5 h-3.5 text-red-600 rounded"> Cancelled
          </label>
        </div>

        <!-- Prev/Next Navigation -->
        <div class="flex gap-2">
          <button (click)="navigateCalendar(-1)" class="p-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-850 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition">&larr;</button>
          <button (click)="today()" class="px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-semibold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 transition">Today</button>
          <button (click)="navigateCalendar(1)" class="p-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-850 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition">&rarr;</button>
        </div>
      </div>

      <!-- CALENDAR BOARD CONTENT -->
      <div class="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden p-6">
        
        <!-- 1. MONTH VIEW -->
        @if (viewMode === 'month') {
          <div class="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden text-center text-xs">
            <!-- Week days headers -->
            @for (dayName of ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; track dayName) {
              <div class="bg-gray-50 dark:bg-gray-850 py-3 font-semibold text-gray-600 dark:text-gray-300">{{ dayName }}</div>
            }

            <!-- Month days grids -->
            @for (cell of monthCells; track cell.index) {
              <div [ngClass]="{'bg-white dark:bg-gray-900': cell.isCurrentMonth, 'bg-gray-50/50 dark:bg-gray-850/30 text-gray-400': !cell.isCurrentMonth}" class="min-h-[110px] p-2 flex flex-col justify-between text-left transition hover:bg-blue-50/20 dark:hover:bg-blue-950/10">
                <span class="font-semibold text-xs mb-2" [ngClass]="{
                  'text-gray-700 dark:text-gray-200': cell.isCurrentMonth,
                  'text-gray-400 dark:text-gray-650': !cell.isCurrentMonth
                }">{{ cell.day }}</span>
                
                <!-- Shoot Badges for this day -->
                <div class="space-y-1.5 overflow-y-auto max-h-[80px] flex-1">
                  @for (b of getBookingsForDate(cell.dateString); track b.id) {
                    <div (click)="previewBooking(b)" [ngClass]="getBookingBadgeClass(b.status)" class="p-1 rounded text-[10px] font-medium leading-tight truncate cursor-pointer shadow-sm">
                      <span class="font-bold">{{ b.bookingNo }}</span>: {{ getClientName(b.customerId) }}
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        }

        <!-- 2. WEEK VIEW -->
        @if (viewMode === 'week') {
          <div class="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden text-center text-xs">
            @for (wDay of weekCells; track wDay.dateString) {
              <div class="bg-white dark:bg-gray-900 min-h-[300px] p-3 text-left flex flex-col">
                <div class="border-b border-gray-150 dark:border-gray-800 pb-2 mb-2">
                  <span class="block text-gray-400 font-medium">{{ wDay.dayName }}</span>
                  <span class="text-sm font-bold text-gray-800 dark:text-white">{{ wDay.date | date:'mediumDate' }}</span>
                </div>

                <div class="space-y-2 flex-1 overflow-y-auto">
                  @for (b of getBookingsForDate(wDay.dateString); track b.id) {
                    <div (click)="previewBooking(b)" [ngClass]="getBookingBadgeClass(b.status)" class="p-2 rounded-lg text-[10px] font-medium cursor-pointer shadow-sm space-y-1">
                      <div class="flex justify-between font-bold">
                        <span>{{ b.bookingNo }}</span>
                        <span>{{ b.shootTime }}</span>
                      </div>
                      <p class="truncate">{{ getClientName(b.customerId) }}</p>
                      <p class="truncate text-[9px] text-gray-400">📍 {{ b.venue }}</p>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        }

        <!-- 3. DAY VIEW -->
        @if (viewMode === 'day') {
          <div class="max-w-2xl mx-auto space-y-4">
            <div class="p-4 bg-gray-50 dark:bg-gray-850 rounded-xl border border-gray-150 dark:border-gray-800 text-center">
              <span class="text-xs text-gray-400 uppercase font-semibold">Active Assignments on</span>
              <h4 class="text-lg font-bold text-gray-800 dark:text-white">{{ currentDate | date:'fullDate' }}</h4>
            </div>

            <div class="space-y-3">
              @for (b of getBookingsForDate(getCurrentDateString()); track b.id) {
                <div (click)="previewBooking(b)" class="p-4 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-xl flex items-center justify-between cursor-pointer hover:shadow-md transition">
                  <div class="space-y-1">
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-bold text-gray-800 dark:text-white">{{ b.bookingNo }}</span>
                      <app-badge size="sm" [color]="getStatusColor(b.status)">{{ b.status }}</app-badge>
                    </div>
                    <p class="text-xs text-gray-500">Client: <span class="font-semibold text-gray-700 dark:text-gray-300">{{ getClientName(b.customerId) }}</span></p>
                    <p class="text-[10px] text-gray-450">⏰ Time Slot: {{ b.shootTime }} | Venue: {{ b.venue }}</p>
                    <p class="text-[10px] text-indigo-500 font-semibold">Models Assigned: {{ getModelsNames(b.modelIds) }}</p>
                  </div>
                  <div class="text-right">
                    <span class="text-sm font-bold text-gray-800 dark:text-white">₹{{ b.sellingPrice | number }}</span>
                    <p class="text-[9px] text-gray-400">Total Value</p>
                  </div>
                </div>
              } @empty {
                <p class="text-xs text-gray-400 py-12 text-center">No shoots scheduled for this day.</p>
              }
            </div>
          </div>
        }
      </div>
      
      <!-- Preview dialog Modal -->
      <app-modal [isOpen]="!!previewedBooking" (close)="previewedBooking = null">
        @if (previewedBooking) {
          <div class="p-6 space-y-4 text-xs text-gray-600 dark:text-gray-300">
            <h3 class="text-base font-bold text-gray-850 dark:text-white">Shoot Calendar Details</h3>
            <div class="space-y-2 border-t border-gray-100 dark:border-gray-800 pt-3">
              <p><span class="text-gray-400 font-medium">Booking No:</span> <span class="font-bold text-gray-800 dark:text-white">{{ previewedBooking.bookingNo }}</span></p>
              <p><span class="text-gray-400 font-medium">Client:</span> {{ getClientName(previewedBooking.customerId) }}</p>
              <p><span class="text-gray-400 font-medium">Date & Time:</span> {{ previewedBooking.shootDate | date:'mediumDate' }} ({{ previewedBooking.shootTime }})</p>
              <p><span class="text-gray-400 font-medium">Venue Location:</span> {{ previewedBooking.venue }}</p>
              <p><span class="text-gray-400 font-medium">Casting Models:</span> <span class="text-indigo-600 dark:text-indigo-400 font-semibold">{{ getModelsNames(previewedBooking.modelIds) }}</span></p>
              <p><span class="text-gray-400 font-medium">Status:</span> 
                <app-badge size="sm" [color]="getStatusColor(previewedBooking.status)">{{ previewedBooking.status }}</app-badge>
              </p>
            </div>
            <div class="flex justify-end pt-3 border-t border-gray-100 dark:border-gray-800">
              <button (click)="previewedBooking = null" class="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">Close</button>
            </div>
          </div>
        }
      </app-modal>
    </div>
  `
})
export class CrmCalendarComponent implements OnInit, OnDestroy {

  private sub = new Subscription();
  bookings: Booking[] = [];
  clients: Party[] = [];
  allModels: Model[] = [];

  // Calendar parameters
  currentDate = new Date();
  viewMode: 'month' | 'week' | 'day' = 'month';

  // Toggle Filters
  filters = {
    confirmed: true,
    tentative: true,
    hold: true,
    cancelled: false
  };

  // Rendering cells cache
  monthCells: { day: number; dateString: string; isCurrentMonth: boolean; index: number }[] = [];
  weekCells: { date: Date; dateString: string; dayName: string }[] = [];

  // Preview target
  previewedBooking: Booking | null = null;

  constructor(private crmStorage: CrmStorageService) { }

  ngOnInit() {
    window.scrollTo(0, 0);
    this.sub.add(this.crmStorage.getBookings$().subscribe(list => {
      this.bookings = list;
      this.calculateCalendarCells();
    }));
    this.sub.add(this.crmStorage.getParties$().subscribe(parties => {
      this.clients = parties.filter(p => p.partyType === 'Customer' || p.partyType === 'Customer + Vendor');
    }));
    this.sub.add(this.crmStorage.getModels$().subscribe(models => this.allModels = models));
    this.calculateCalendarCells();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  // Navigation handlers
  today() {
    this.currentDate = new Date();
    this.calculateCalendarCells();
  }

  navigateCalendar(offset: number) {
    if (this.viewMode === 'month') {
      this.currentDate.setMonth(this.currentDate.getMonth() + offset);
    } else if (this.viewMode === 'week') {
      this.currentDate.setDate(this.currentDate.getDate() + offset * 7);
    } else {
      this.currentDate.setDate(this.currentDate.getDate() + offset);
    }
    this.calculateCalendarCells();
  }

  getCalendarTitle(): string {
    if (this.viewMode === 'month') {
      return this.currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    if (this.viewMode === 'week') {
      const start = new Date(this.currentDate);
      start.setDate(start.getDate() - start.getDay());
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return this.currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }

  getCurrentDateString(): string {
    return this.currentDate.toISOString().split('T')[0];
  }

  // Calculate coordinates
  calculateCalendarCells() {
    // 1. Month Cells calculations
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const cells: typeof this.monthCells = [];

    // Pre-month cells
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dStr = new Date(year, month - 1, prevMonthDays - i).toISOString().split('T')[0];
      cells.push({ day: prevMonthDays - i, dateString: dStr, isCurrentMonth: false, index: cells.length });
    }

    // Current month cells
    for (let i = 1; i <= totalDays; i++) {
      // safe date creation ISO string
      const dStr = new Date(year, month, i, 12, 0, 0).toISOString().split('T')[0];
      cells.push({ day: i, dateString: dStr, isCurrentMonth: true, index: cells.length });
    }

    // Post-month cells
    const remaining = 42 - cells.length; // keep standard 6 grid rows (42 cells)
    for (let i = 1; i <= remaining; i++) {
      const dStr = new Date(year, month + 1, i, 12, 0, 0).toISOString().split('T')[0];
      cells.push({ day: i, dateString: dStr, isCurrentMonth: false, index: cells.length });
    }
    this.monthCells = cells;

    // 2. Week Cells calculations
    const wCells: typeof this.weekCells = [];
    const base = new Date(this.currentDate);
    const dayOfWeek = base.getDay();
    base.setDate(base.getDate() - dayOfWeek); // set to sunday
    const dayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    for (let i = 0; i < 7; i++) {
      const wDate = new Date(base);
      wDate.setDate(wDate.getDate() + i);
      wCells.push({
        date: wDate,
        dateString: wDate.toISOString().split('T')[0],
        dayName: dayLabels[i]
      });
    }
    this.weekCells = wCells;
  }

  getBookingsForDate(dateStr: string): Booking[] {
    return this.bookings.filter(b => {
      if (b.shootDate !== dateStr) return false;

      // Status filters
      if (b.status === 'Confirmed' && !this.filters.confirmed) return false;
      if (b.status === 'Tentative' && !this.filters.tentative) return false;
      if (b.status === 'Hold' && !this.filters.hold) return false;
      if (b.status === 'Cancelled' && !this.filters.cancelled) return false;

      return true;
    });
  }

  getBookingBadgeClass(status: Booking['status']): string {
    if (status === 'Confirmed') return 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400';
    if (status === 'Tentative') return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-450';
    if (status === 'Hold') return 'bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400';
    return 'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400 line-through';
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

  getModelsNames(ids: string[]): string {
    return this.allModels.filter(m => ids.includes(m.id)).map(m => m.name).join(', ') || 'None';
  }

  previewBooking(b: Booking) {
    this.previewedBooking = b;
  }
}
