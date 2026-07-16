import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';

import {
  CrmStorageService,
  CrmSettings
} from '../../../shared/services/crm-storage.service';

@Component({
  selector: 'app-crm-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageBreadcrumbComponent
  ],
  template: `
    <div class="space-y-6">
      <app-page-breadcrumb pageTitle="General & API Settings" />

      <!-- Main Config Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Left 2 columns: Config Form -->
        <div class="lg:col-span-2 p-6 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800 space-y-6">
          <h3 class="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider">CRM System Configuration</h3>
          
          <form (submit)="saveSettings()" class="space-y-6 text-xs">
            <!-- 1. Agency Details -->
            <div class="space-y-4">
              <h4 class="font-bold text-gray-400 uppercase">Agency Profile Details</h4>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block mb-1.5 font-semibold text-gray-500 uppercase">Agency Name *</label>
                  <input type="text" [(ngModel)]="settings.companyName" name="agName" required class="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 dark:border-gray-700 dark:text-white">
                </div>
                <div>
                  <label class="block mb-1.5 font-semibold text-gray-500 uppercase">Registered GSTIN *</label>
                  <input type="text" [(ngModel)]="settings.gstNumber" name="agGst" required class="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 dark:border-gray-700 dark:text-white">
                </div>
                <div>
                  <label class="block mb-1.5 font-semibold text-gray-500 uppercase">Agency Email *</label>
                  <input type="email" [(ngModel)]="settings.email" name="agEmail" required class="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 dark:border-gray-700 dark:text-white">
                </div>
                <div>
                  <label class="block mb-1.5 font-semibold text-gray-500 uppercase">Agency Phone *</label>
                  <input type="text" [(ngModel)]="settings.phone" name="agPhone" required class="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 dark:border-gray-700 dark:text-white">
                </div>
                <div class="col-span-2">
                  <label class="block mb-1.5 font-semibold text-gray-500 uppercase">Billing Address *</label>
                  <textarea [(ngModel)]="settings.address" name="agAddr" required class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 dark:border-gray-700 dark:text-white" rows="2"></textarea>
                </div>
              </div>
            </div>

            <!-- 2. Invoice prefixes config -->
            <div class="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-4">
              <h4 class="font-bold text-gray-400 uppercase">Document Serialization Series</h4>
              <div class="grid grid-cols-3 gap-4">
                <div>
                  <label class="block mb-1.5 font-semibold text-gray-500 uppercase">Invoice Prefix *</label>
                  <input type="text" [(ngModel)]="settings.invoicePrefix" name="agInvPref" required class="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 dark:border-gray-700 dark:text-white">
                </div>
                <div>
                  <label class="block mb-1.5 font-semibold text-gray-500 uppercase">Quotation Prefix *</label>
                  <input type="text" [(ngModel)]="settings.quotationPrefix" name="agQtPref" required class="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 dark:border-gray-700 dark:text-white">
                </div>
                <div>
                  <label class="block mb-1.5 font-semibold text-gray-500 uppercase">Booking Prefix *</label>
                  <input type="text" [(ngModel)]="settings.bookingPrefix" name="agBkPref" required class="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 dark:border-gray-700 dark:text-white">
                </div>
              </div>
            </div>

            <!-- 3. Gateway Configuration keys -->
            <div class="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-4">
              <h4 class="font-bold text-gray-400 uppercase">Automation Dispatch Credentials</h4>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block mb-1.5 font-semibold text-gray-500 uppercase">Email Gateway Token</label>
                  <input type="text" [(ngModel)]="settings.emailGatewayToken" name="agSmtp" class="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 dark:border-gray-700 dark:text-white" placeholder="email-gateway-token">
                </div>
                <div>
                  <label class="block mb-1.5 font-semibold text-gray-500 uppercase">WhatsApp Gateway Token</label>
                  <input type="password" [(ngModel)]="settings.whatsappGatewayToken" name="agTwilio" class="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 dark:border-gray-700 dark:text-white" placeholder="whatsapp-gateway-token">
                </div>
              </div>
            </div>

            <div class="flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800 pt-4">
              <button type="submit" class="px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow">
                Save System Settings
              </button>
            </div>
          </form>
        </div>

        <!-- Right 1 column: Summary info -->
        <div class="space-y-6">
          <!-- Automation active card -->
          <div class="p-6 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800 space-y-4">
            <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Gateway Automations Status</h4>
            <div class="space-y-3 text-xs">
              <div class="flex justify-between items-center">
                <span>WhatsApp Notification Gateway</span>
                <span class="text-[9px] font-bold text-green-600">● ACTIVE</span>
              </div>
              <div class="flex justify-between items-center">
                <span>Email SMTP Dispatcher</span>
                <span class="text-[9px] font-bold text-green-600">● ACTIVE</span>
              </div>
              <div class="flex justify-between items-center">
                <span>Auto-ledger reconciliation</span>
                <span class="text-[9px] font-bold text-green-600">● ACTIVE</span>
              </div>
              <div class="flex justify-between items-center">
                <span>Casting Pipeline reminders</span>
                <span class="text-[9px] font-bold text-yellow-600">● HOLD</span>
              </div>
            </div>
          </div>

          <!-- Reset / Seed backup database -->
          <div class="p-6 bg-white rounded-2xl border border-red-200 dark:bg-white/[0.03] dark:border-red-900/30 space-y-4">
            <h4 class="text-xs font-bold text-red-500 uppercase tracking-wider">Database Backup & Recovery</h4>
            <p class="text-theme-xs text-gray-400">Flush simulated LocalStorage databases or seed fresh mocks to test performance pipelines.</p>
            <div class="flex flex-col gap-2">
              <button (click)="reseedDatabase()" class="w-full py-2 border border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 font-semibold rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/20 text-xs">
                🔄 Reset & Reseed Database
              </button>
              <button (click)="flushDatabase()" class="w-full py-2 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400 text-xs">
                🚨 Flush Local Database
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class CrmSettingsComponent implements OnInit, OnDestroy {

  private sub = new Subscription();
  settings: CrmSettings = {
    companyName: '',
    gstNumber: '',
    email: '',
    phone: '',
    address: '',
    bankName: '',
    accountName: '',
    accountNumber: '',
    ifsc: '',
    branch: '',
    quotationPrefix: '',
    bookingPrefix: '',
    invoicePrefix: '',
    whatsappGatewayToken: '',
    emailGatewayToken: '',
    paymentGatewayKey: ''
  };

  constructor(private crmStorage: CrmStorageService) { }

  ngOnInit() {
    this.sub.add(this.crmStorage.getSettings$().subscribe(data => {
      if (data) {
        this.settings = JSON.parse(JSON.stringify(data));
      }
    }));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  saveSettings() {
    if (this.settings.companyName && this.settings.invoicePrefix) {
      this.crmStorage.saveSettings(this.settings);
      alert('System configuration settings saved successfully!');
    }
  }

  reseedDatabase() {
    if (confirm('Are you sure you want to reset the CRM state and seed fresh mockups? Unsaved edits will be lost.')) {
      this.crmStorage.reseedData();
      alert('CRM database seed reset successfully!');
    }
  }

  flushDatabase() {
    if (confirm('Are you sure you want to flush all databases? All records will be completely deleted.')) {
      this.crmStorage.clearAllData();
      alert('Database flushed successfully!');
    }
  }
}
