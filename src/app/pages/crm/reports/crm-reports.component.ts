import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NgApexchartsModule } from 'ng-apexcharts';

import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../../shared/components/common/component-card/component-card.component';
import { ModalComponent } from '../../../shared/components/ui/modal/modal.component';
import { BadgeComponent } from '../../../shared/components/ui/badge/badge.component';

import {
  CrmStorageService,
} from '../../../shared/services/crm-storage.service';

@Component({
  selector: 'app-crm-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgApexchartsModule,
    PageBreadcrumbComponent
  ],
  template: `
    <div class="space-y-6">
      <app-page-breadcrumb pageTitle="Financial Reports & Analytics" />

      <!-- High level KPIs row -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="p-6 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800">
          <span class="text-xs font-semibold text-gray-400 block mb-1">Total Revenue (Receipts)</span>
          <h3 class="text-2xl font-bold text-gray-800 dark:text-white">₹{{ totalRevenue | number:'1.0-0' }}</h3>
          <span class="text-theme-xs text-gray-500 block mt-2">Cash flow received</span>
        </div>
        <div class="p-6 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800">
          <span class="text-xs font-semibold text-gray-400 block mb-1">Total Expenses (Payouts)</span>
          <h3 class="text-2xl font-bold text-gray-800 dark:text-white">₹{{ totalExpenses | number:'1.0-0' }}</h3>
          <span class="text-theme-xs text-gray-500 block mt-2">Paid to models/vendors</span>
        </div>
        <div class="p-6 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800">
          <span class="text-xs font-semibold text-gray-400 block mb-1">Net Margin (Profit)</span>
          <h3 class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">₹{{ totalProfit | number:'1.0-0' }}</h3>
          <span class="text-theme-xs text-emerald-500 block mt-2">Margin: {{ profitMargin | number:'1.1-1' }}%</span>
        </div>
        <div class="p-6 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800">
          <span class="text-xs font-semibold text-gray-400 block mb-1">Outstanding Receivables</span>
          <h3 class="text-2xl font-bold text-red-500">₹{{ outstandingReceivables | number:'1.0-0' }}</h3>
          <span class="text-theme-xs text-gray-500 block mt-2">Unpaid client invoices</span>
        </div>
      </div>

      <!-- Graphical Analysis -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Monthly comparison -->
        <div class="lg:col-span-2 p-6 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800">
          <h3 class="text-base font-semibold text-gray-800 dark:text-white mb-4">Cash Receipts vs Model Payouts Trend</h3>
          <apx-chart
            [series]="trendChartOptions.series!"
            [chart]="trendChartOptions.chart!"
            [xaxis]="trendChartOptions.xaxis!"
            [colors]="trendChartOptions.colors!"
            [stroke]="trendChartOptions.stroke!"
            [yaxis]="trendChartOptions.yaxis!"
            [dataLabels]="trendChartOptions.dataLabels!">
          </apx-chart>
        </div>

        <!-- Category share visual -->
        <div class="p-6 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800 flex flex-col justify-between">
          <h3 class="text-base font-semibold text-gray-800 dark:text-white mb-4">Casting Category Share</h3>
          <div class="flex-1 flex items-center justify-center">
            <apx-chart
              [series]="donutChartOptions.series!"
              [chart]="donutChartOptions.chart!"
              [labels]="donutChartOptions.labels!"
              [colors]="donutChartOptions.colors!"
              [legend]="donutChartOptions.legend!"
              [responsive]="donutChartOptions.responsive!">
            </apx-chart>
          </div>
        </div>
      </div>

      <!-- Breakdowns Tables -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Brand Performance -->
        <div class="p-6 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800">
          <h3 class="text-base font-semibold text-gray-800 dark:text-white mb-4">Brand Performance Sheet</h3>
          <div class="overflow-x-auto">
            <table class="min-w-full text-xs">
              <thead>
                <tr class="border-b border-gray-150 dark:border-gray-800 text-gray-400 text-left font-bold">
                  <th class="pb-2.5">Brand Name</th>
                  <th class="pb-2.5 text-center">Shoots</th>
                  <th class="pb-2.5 text-right">Revenue Generated</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50 dark:divide-gray-850">
                @for (item of brandPerformances; track item.brandId) {
                  <tr>
                    <td class="py-2.5 font-semibold text-gray-700 dark:text-gray-300">{{ item.name }}</td>
                    <td class="py-2.5 text-center">{{ item.shootCount }}</td>
                    <td class="py-2.5 text-right font-bold text-gray-800 dark:text-white">₹{{ item.revenue | number }}</td>
                  </tr>
                } @empty {
                  <tr><td colspan="3" class="text-center py-4 text-gray-400">No brand logs found.</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Nationality Day Rates Breakdown -->
        <div class="p-6 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800">
          <h3 class="text-base font-semibold text-gray-800 dark:text-white mb-4">Nationality Day-Rate Margin Breakdown</h3>
          <div class="overflow-x-auto">
            <table class="min-w-full text-xs">
              <thead>
                <tr class="border-b border-gray-150 dark:border-gray-800 text-gray-400 text-left font-bold">
                  <th class="pb-2.5">Nationality Group</th>
                  <th class="pb-2.5 text-center">Models Count</th>
                  <th class="pb-2.5 text-right">Avg Day Rate</th>
                  <th class="pb-2.5 text-right">Highest Day Rate</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50 dark:divide-gray-850">
                @for (item of nationalityBreakdowns; track item.nationality) {
                  <tr>
                    <td class="py-2.5 font-semibold text-gray-700 dark:text-gray-300">{{ item.nationality }}</td>
                    <td class="py-2.5 text-center">{{ item.count }} Models</td>
                    <td class="py-2.5 text-right font-medium">₹{{ item.avgRate | number:'1.0-0' }}</td>
                    <td class="py-2.5 text-right font-bold text-indigo-500">₹{{ item.highestRate | number }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CrmReportsComponent implements OnInit, OnDestroy {

  private sub = new Subscription();

  // Financial aggregates
  totalRevenue = 0;
  totalExpenses = 0;
  totalProfit = 0;
  profitMargin = 0;
  outstandingReceivables = 0;

  // Breakdowns arrays
  brandPerformances: { brandId: string; name: string; shootCount: number; revenue: number }[] = [];
  nationalityBreakdowns: { nationality: string; count: number; avgRate: number; highestRate: number }[] = [];

  // Chart configs
  trendChartOptions: any = {};
  donutChartOptions: any = {};

  constructor(private crmStorage: CrmStorageService) { }

  ngOnInit() {
    this.sub.add(
      this.crmStorage.getBookings$().subscribe(() => this.calculateReports())
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  calculateReports() {
    const bookings = this.crmStorage['bookings$'].value;
    const invoices = this.crmStorage['invoices$'].value;
    const paymentsReceived = this.crmStorage['paymentsReceived$'].value;
    const paymentsMade = this.crmStorage['paymentsMade$'].value;
    const models = this.crmStorage['models$'].value;
    const masters = this.crmStorage['masters$'].value;

    // 1. Core Financial calculations
    this.totalRevenue = paymentsReceived.reduce((acc, p) => acc + p.amount, 0);
    this.totalExpenses = paymentsMade.reduce((acc, p) => acc + p.amount, 0);
    this.totalProfit = this.totalRevenue - this.totalExpenses;
    this.profitMargin = this.totalRevenue > 0 ? (this.totalProfit / this.totalRevenue) * 100 : 0;

    this.outstandingReceivables = invoices.reduce((acc, inv) => {
      const pending = inv.grandTotal - inv.amountPaid;
      return acc + (pending > 0 ? pending : 0);
    }, 0);

    // 2. Brand performance mapping
    const brandMap = new Map<string, { count: number; sum: number }>();
    bookings.forEach(b => {
      const val = brandMap.get(b.brandId) || { count: 0, sum: 0 };
      val.count++;
      val.sum += b.sellingPrice;
      brandMap.set(b.brandId, val);
    });
    this.brandPerformances = Array.from(brandMap.entries()).map(([brandId, entry]) => {
      const brandObj = masters?.brands.find(b => b.id === brandId);
      return {
        brandId,
        name: brandObj ? brandObj.name : 'Unknown Brand',
        shootCount: entry.count,
        revenue: entry.sum
      };
    }).sort((a, b) => b.revenue - a.revenue);

    // 3. Nationality stats breakdown
    const natMap = new Map<string, { count: number; sum: number; max: number }>();
    models.forEach(m => {
      const entry = natMap.get(m.nationality) || { count: 0, sum: 0, max: 0 };
      entry.count++;
      entry.sum += m.dayRate;
      entry.max = Math.max(entry.max, m.dayRate);
      natMap.set(m.nationality, entry);
    });
    this.nationalityBreakdowns = Array.from(natMap.entries()).map(([nat, val]) => ({
      nationality: nat,
      count: val.count,
      avgRate: val.sum / val.count,
      highestRate: val.max
    })).sort((a, b) => b.avgRate - a.avgRate);

    // 4. Category breakdown counts for donut chart
    const catMap = new Map<string, number>();
    bookings.forEach(b => {
      catMap.set(b.categoryId, (catMap.get(b.categoryId) || 0) + 1);
    });
    const donutLabels = Array.from(catMap.keys()).map(cId => {
      const catObj = masters?.categories.find(c => c.id === cId);
      return catObj ? catObj.name : 'Other';
    });
    const donutSeries = Array.from(catMap.values());

    // 5. Initialize Charts configs
    this.initChartConfigs(donutLabels, donutSeries);
  }

  initChartConfigs(donutLabels: string[], donutSeries: number[]) {
    // Receipts vs Payouts trend
    this.trendChartOptions = {
      series: [
        {
          name: 'Revenue Inflow (₹)',
          data: [94400, 118000, 141600, 95000, 110000, 130000, 125000, 140000, 155000, 160000, 148000, 175000]
        },
        {
          name: 'Payout Outflow (₹)',
          data: [50000, 65000, 80000, 55000, 60000, 70000, 75000, 85000, 90000, 100000, 92000, 115000]
        }
      ],
      chart: {
        fontFamily: 'Outfit, sans-serif',
        type: 'bar',
        height: 280,
        toolbar: { show: false }
      },
      colors: ['#10b981', '#f59e0b'],
      stroke: { width: 0 },
      dataLabels: { enabled: false },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      },
      yaxis: {
        labels: {
          formatter: (val: number) => '₹' + (val / 1000) + 'k'
        }
      }
    };

    // Donut chart config
    this.donutChartOptions = {
      series: donutSeries.length > 0 ? donutSeries : [3, 2, 1],
      chart: {
        fontFamily: 'Outfit, sans-serif',
        type: 'donut',
        height: 250
      },
      labels: donutLabels.length > 0 ? donutLabels : ['Editorial', 'Commercial', 'Runway'],
      colors: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'],
      legend: {
        position: 'bottom',
        fontSize: '11px'
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: 'bottom'
            }
          }
        }
      ]
    };
  }
}
