import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ModalComponent } from '../../../shared/components/ui/modal/modal.component';
import { BadgeComponent } from '../../../shared/components/ui/badge/badge.component';

import {
  CrmStorageService,
  PaymentReceived,
  PaymentMade,
  Party,
  Model,
  Invoice
} from '../../../shared/services/crm-storage.service';

@Component({
  selector: 'app-crm-payments',
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
      <app-page-breadcrumb pageTitle="Payments Double Ledger" />

      <!-- Controls & Tabs Row -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800">
        <!-- Ledgers Tabs -->
        <div class="flex items-center gap-0.5 rounded-lg bg-gray-100 dark:bg-gray-900 p-0.5 text-xs">
          <button
            (click)="activeLedger = 'received'"
            [ngClass]="activeLedger === 'received' ? 'shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800 font-semibold' : 'text-gray-500 dark:text-gray-400'"
            class="px-4 py-2 rounded-md transition hover:text-gray-900 dark:hover:text-white"
          >
            Receipts (Received from Clients)
          </button>
          <button
            (click)="activeLedger = 'made'"
            [ngClass]="activeLedger === 'made' ? 'shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800 font-semibold' : 'text-gray-500 dark:text-gray-400'"
            class="px-4 py-2 rounded-md transition hover:text-gray-900 dark:hover:text-white"
          >
            Disbursements (Payouts to Models/Vendors)
          </button>
        </div>

        <!-- Action Button -->
        <button (click)="openAddModal()" [ngClass]="{'bg-green-600 hover:bg-green-700': activeLedger === 'received', 'bg-blue-600 hover:bg-blue-700': activeLedger === 'made'}" class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition">
          {{ activeLedger === 'received' ? '+ Record Receipt' : '+ Record Payout' }}
        </button>
      </div>

      <!-- Receipts Ledger (Received) -->
      @if (activeLedger === 'received') {
        <div class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div class="max-w-full overflow-x-auto">
            <table class="min-w-full">
              <thead class="border-b border-gray-100 dark:border-white/[0.05]">
                <tr class="bg-gray-50 dark:bg-gray-850 text-xs">
                  <th class="px-5 py-3 font-semibold text-gray-500 text-start dark:text-gray-400">TXN Ref / Date</th>
                  <th class="px-5 py-3 font-semibold text-gray-500 text-start dark:text-gray-400">Client / Customer</th>
                  <th class="px-5 py-3 font-semibold text-gray-500 text-start dark:text-gray-400">Invoice Link</th>
                  <th class="px-5 py-3 font-semibold text-gray-500 text-start dark:text-gray-400">Payment Mode</th>
                  <th class="px-5 py-3 font-semibold text-gray-500 text-start dark:text-gray-400">TDS Deducted</th>
                  <th class="px-5 py-3 font-semibold text-gray-500 text-right dark:text-gray-400">Net Amount</th>
                  <th class="px-5 py-3 font-semibold text-gray-500 text-center dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-white/[0.05] text-xs">
                @for (p of paymentsReceived; track p.id) {
                  <tr class="hover:bg-gray-50/50 dark:hover:bg-gray-850/50 transition">
                    <td class="px-5 py-4">
                      <span class="block font-bold text-gray-800 dark:text-white">{{ p.reference }}</span>
                      <span class="block text-gray-400 text-[10px] mt-0.5">{{ p.date | date:'mediumDate' }}</span>
                    </td>
                    <td class="px-5 py-4 font-semibold text-gray-700 dark:text-gray-300">
                      {{ getClientName(p.customerId) }}
                    </td>
                    <td class="px-5 py-4 font-medium text-blue-500">
                      {{ getInvoiceNo(p.invoiceId) }}
                    </td>
                    <td class="px-5 py-4">
                      <span class="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{{ p.mode }}</span>
                    </td>
                    <td class="px-5 py-4 text-red-500">
                      ₹{{ p.tdsDeduction | number }}
                    </td>
                    <td class="px-5 py-4 text-right font-bold text-green-600">
                      ₹{{ p.amount | number }}
                    </td>
                    <td class="px-5 py-4 text-center">
                      <button (click)="deleteReceipt(p.id)" class="p-1 text-gray-400 hover:text-red-600 rounded" title="Delete record">
                        <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="px-5 py-8 text-center text-gray-400">No receipts logged yet.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      } @else {
        <!-- Disbursements Ledger (Made) -->
        <div class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div class="max-w-full overflow-x-auto">
            <table class="min-w-full">
              <thead class="border-b border-gray-100 dark:border-white/[0.05]">
                <tr class="bg-gray-50 dark:bg-gray-850 text-xs">
                  <th class="px-5 py-3 font-semibold text-gray-500 text-start dark:text-gray-400">TXN Ref / Date</th>
                  <th class="px-5 py-3 font-semibold text-gray-500 text-start dark:text-gray-400">Paid To (Model / Agency)</th>
                  <th class="px-5 py-3 font-semibold text-gray-500 text-start dark:text-gray-400">Settlement Type</th>
                  <th class="px-5 py-3 font-semibold text-gray-500 text-start dark:text-gray-400">Payment Mode</th>
                  <th class="px-5 py-3 font-semibold text-gray-500 text-start dark:text-gray-400">TDS Deducted</th>
                  <th class="px-5 py-3 font-semibold text-gray-500 text-right dark:text-gray-400">Net Paid Out</th>
                  <th class="px-5 py-3 font-semibold text-gray-500 text-center dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-white/[0.05] text-xs">
                @for (p of paymentsMade; track p.id) {
                  <tr class="hover:bg-gray-50/50 dark:hover:bg-gray-850/50 transition">
                    <td class="px-5 py-4">
                      <span class="block font-bold text-gray-800 dark:text-white">{{ p.reference }}</span>
                      <span class="block text-gray-400 text-[10px] mt-0.5">{{ p.date | date:'mediumDate' }}</span>
                    </td>
                    <td class="px-5 py-4 font-semibold text-gray-700 dark:text-gray-300">
                      {{ getRecipientName(p) }}
                    </td>
                    <td class="px-5 py-4">
                      <app-badge size="sm" [color]="p.modelId ? 'info' : 'primary'">
                        {{ p.modelId ? 'Model payout' : 'Vendor payout' }}
                      </app-badge>
                    </td>
                    <td class="px-5 py-4">
                      <span class="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{{ p.mode }}</span>
                    </td>
                    <td class="px-5 py-4 text-red-500">
                      ₹{{ p.tdsDeduction | number }}
                    </td>
                    <td class="px-5 py-4 text-right font-bold text-amber-600">
                      ₹{{ p.amount | number }}
                    </td>
                    <td class="px-5 py-4 text-center">
                      <button (click)="deletePayout(p.id)" class="p-1 text-gray-400 hover:text-red-600 rounded" title="Delete record">
                        <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="px-5 py-8 text-center text-gray-400">No disbursements logged yet.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- Receipts Add Form Modal -->
      <app-modal [isOpen]="isReceiptOpen" (close)="isReceiptOpen = false">
        <div class="p-6 space-y-4">
          <h3 class="text-lg font-bold text-gray-800 dark:text-white">Record Client Receipt</h3>
          <form (submit)="saveReceipt()" class="space-y-4 text-xs">
            <div>
              <label class="block mb-1 font-semibold text-gray-500 uppercase">Customer *</label>
              <select [(ngModel)]="receiptForm.customerId" (change)="onReceiptCustomerChange()" name="recCust" required class="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-2 dark:border-gray-700 dark:text-white dark:bg-gray-900">
                @for (c of clients; track c.id) {
                  <option [value]="c.id">{{ c.companyName }}</option>
                }
              </select>
            </div>
            <div>
              <label class="block mb-1 font-semibold text-gray-500 uppercase">Link Invoice</label>
              <select [(ngModel)]="receiptForm.invoiceId" name="recInv" class="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-2 dark:border-gray-700 dark:text-white dark:bg-gray-900">
                <option value="">Independent Settlement (No Invoice Link)</option>
                @for (i of clientInvoices; track i.id) {
                  <option [value]="i.id">{{ i.invoiceNo }} (Grand Total: ₹{{ i.grandTotal }}, Due: ₹{{ i.grandTotal - i.amountPaid }})</option>
                }
              </select>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block mb-1 font-semibold text-gray-500 uppercase">Receipt Amount *</label>
                <input type="number" [(ngModel)]="receiptForm.amount" name="recAmt" required class="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 dark:border-gray-700 dark:text-white">
              </div>
              <div>
                <label class="block mb-1 font-semibold text-gray-500 uppercase">TDS Deducted</label>
                <input type="number" [(ngModel)]="receiptForm.tdsDeduction" name="recTds" class="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 dark:border-gray-700 dark:text-white">
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block mb-1 font-semibold text-gray-500 uppercase">Payment Mode *</label>
                <select [(ngModel)]="receiptForm.mode" name="recMode" required class="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-2 dark:border-gray-700 dark:text-white dark:bg-gray-900">
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
              <div>
                <label class="block mb-1 font-semibold text-gray-500 uppercase">Date *</label>
                <input type="date" [(ngModel)]="receiptForm.date" name="recDate" required class="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 dark:border-gray-700 dark:text-white">
              </div>
            </div>
            <div>
              <label class="block mb-1 font-semibold text-gray-500 uppercase">TXN Reference / Receipt No *</label>
              <input type="text" [(ngModel)]="receiptForm.reference" name="recRef" required class="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 dark:border-gray-700 dark:text-white" placeholder="UTR or receipt ID">
            </div>

            <div class="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button type="button" (click)="isReceiptOpen = false" class="px-4 py-2 text-sm font-medium text-gray-500 border rounded-lg hover:bg-gray-50">Cancel</button>
              <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">Save Receipt</button>
            </div>
          </form>
        </div>
      </app-modal>

      <!-- Disbursements Add Form Modal -->
      <app-modal [isOpen]="isPayoutOpen" (close)="isPayoutOpen = false">
        <div class="p-6 space-y-4">
          <h3 class="text-lg font-bold text-gray-800 dark:text-white">Record Disbursement Payout</h3>
          <form (submit)="savePayout()" class="space-y-4 text-xs">
            <div>
              <label class="block mb-1 font-semibold text-gray-500 uppercase">Payout Target Type *</label>
              <div class="flex gap-4 p-2 bg-gray-50 dark:bg-gray-850 border border-gray-150 dark:border-gray-800 rounded-lg">
                <label class="flex items-center gap-1 cursor-pointer">
                  <input type="radio" [(ngModel)]="payoutTargetType" value="model" name="pTarget" class="w-4 h-4 text-blue-600 focus:ring-blue-500"> Model Profile
                </label>
                <label class="flex items-center gap-1 cursor-pointer">
                  <input type="radio" [(ngModel)]="payoutTargetType" value="vendor" name="pTarget" class="w-4 h-4 text-blue-600 focus:ring-blue-500"> Agency Vendor
                </label>
              </div>
            </div>

            @if (payoutTargetType === 'model') {
              <div>
                <label class="block mb-1 font-semibold text-gray-500 uppercase">Select Model *</label>
                <select [(ngModel)]="payoutForm.modelId" name="pModel" required class="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-2 dark:border-gray-700 dark:text-white dark:bg-gray-900">
                  @for (m of models; track m.id) {
                    <option [value]="m.id">{{ m.name }} (Day Rate: ₹{{ m.dayRate }})</option>
                  }
                </select>
              </div>
            } @else {
              <div>
                <label class="block mb-1 font-semibold text-gray-500 uppercase">Select Agency Vendor *</label>
                <select [(ngModel)]="payoutForm.vendorId" name="pVendor" required class="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-2 dark:border-gray-700 dark:text-white dark:bg-gray-900">
                  @for (v of vendors; track v.id) {
                    <option [value]="v.id">{{ v.companyName }}</option>
                  }
                </select>
              </div>
            }

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block mb-1 font-semibold text-gray-500 uppercase">Payout Amount (₹) *</label>
                <input type="number" [(ngModel)]="payoutForm.amount" name="pAmt" required class="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 dark:border-gray-700 dark:text-white">
              </div>
              <div>
                <label class="block mb-1 font-semibold text-gray-500 uppercase">TDS Deducted (₹)</label>
                <input type="number" [(ngModel)]="payoutForm.tdsDeduction" name="pTds" class="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 dark:border-gray-700 dark:text-white">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block mb-1 font-semibold text-gray-500 uppercase">Payment Mode *</label>
                <select [(ngModel)]="payoutForm.mode" name="pMode" required class="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-2 dark:border-gray-700 dark:text-white dark:bg-gray-900">
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
              <div>
                <label class="block mb-1 font-semibold text-gray-500 uppercase">Date *</label>
                <input type="date" [(ngModel)]="payoutForm.date" name="pDate" required class="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 dark:border-gray-700 dark:text-white">
              </div>
            </div>

            <div>
              <label class="block mb-1 font-semibold text-gray-500 uppercase">TXN Reference / Receipt No *</label>
              <input type="text" [(ngModel)]="payoutForm.reference" name="pRef" required class="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 dark:border-gray-700 dark:text-white" placeholder="UTR or reference...">
            </div>

            <div class="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button type="button" (click)="isPayoutOpen = false" class="px-4 py-2 text-sm font-medium text-gray-500 border rounded-lg hover:bg-gray-50">Cancel</button>
              <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Record Payout</button>
            </div>
          </form>
        </div>
      </app-modal>
    </div>
  `
})
export class CrmPaymentsComponent implements OnInit, OnDestroy {

  private sub = new Subscription();
  paymentsReceived: PaymentReceived[] = [];
  paymentsMade: PaymentMade[] = [];
  clients: Party[] = [];
  vendors: Party[] = [];
  models: Model[] = [];
  invoices: Invoice[] = [];

  activeLedger: 'received' | 'made' = 'received';

  // Receipt Modal State
  isReceiptOpen = false;
  receiptForm: Partial<PaymentReceived> = {};
  clientInvoices: Invoice[] = [];

  // Payout Modal State
  isPayoutOpen = false;
  payoutTargetType: 'model' | 'vendor' = 'model';
  payoutForm: Partial<PaymentMade> = {};

  constructor(private crmStorage: CrmStorageService) { }

  ngOnInit() {
    this.sub.add(this.crmStorage.getPaymentsReceived$().subscribe(list => this.paymentsReceived = list));
    this.sub.add(this.crmStorage.getPaymentsMade$().subscribe(list => this.paymentsMade = list));
    this.sub.add(this.crmStorage.getParties$().subscribe(parties => {
      this.clients = parties.filter(p => p.partyType === 'Customer' || p.partyType === 'Customer + Vendor');
      this.vendors = parties.filter(p => p.partyType === 'Vendor' || p.partyType === 'Customer + Vendor');
    }));
    this.sub.add(this.crmStorage.getModels$().subscribe(list => this.models = list));
    this.sub.add(this.crmStorage.getInvoices$().subscribe(list => this.invoices = list));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  getClientName(id: string): string {
    const c = this.clients.find(p => p.id === id);
    return c ? c.companyName : 'Unknown Client';
  }

  getInvoiceNo(id?: string): string {
    if (!id) return 'Independent';
    const inv = this.invoices.find(i => i.id === id);
    return inv ? inv.invoiceNo : 'Unknown Invoice';
  }

  getRecipientName(pay: PaymentMade): string {
    if (pay.modelId) {
      const m = this.models.find(item => item.id === pay.modelId);
      return m ? m.name : 'Unknown Model';
    }
    if (pay.vendorId) {
      const v = this.vendors.find(item => item.id === pay.vendorId);
      return v ? v.companyName : 'Unknown Vendor';
    }
    return 'N/A';
  }

  // Open modals
  openAddModal() {
    if (this.activeLedger === 'received') {
      this.receiptForm = {
        customerId: this.clients[0]?.id || '',
        invoiceId: '',
        amount: 20000,
        tdsDeduction: 0,
        mode: 'Bank Transfer',
        reference: '',
        date: new Date().toISOString().split('T')[0]
      };
      this.onReceiptCustomerChange();
      this.isReceiptOpen = true;
    } else {
      this.payoutForm = {
        modelId: this.models[0]?.id || '',
        vendorId: '',
        amount: 15000,
        tdsDeduction: 0,
        mode: 'Bank Transfer',
        reference: '',
        date: new Date().toISOString().split('T')[0]
      };
      this.payoutTargetType = 'model';
      this.isPayoutOpen = true;
    }
  }

  onReceiptCustomerChange() {
    if (this.receiptForm.customerId) {
      // Find all invoices with balances > 0 for this client
      this.clientInvoices = this.invoices.filter(i => i.customerId === this.receiptForm.customerId && (i.grandTotal - i.amountPaid) > 0);
      this.receiptForm.invoiceId = this.clientInvoices[0]?.id || '';
    }
  }

  saveReceipt() {
    if (this.receiptForm.customerId && this.receiptForm.amount && this.receiptForm.reference && this.receiptForm.date) {
      this.crmStorage.savePaymentReceived(this.receiptForm as PaymentReceived);
      this.isReceiptOpen = false;
    }
  }

  savePayout() {
    // validation
    if (this.payoutForm.amount && this.payoutForm.reference && this.payoutForm.date) {
      if (this.payoutTargetType === 'model' && !this.payoutForm.modelId) {
        alert('Please select a model.');
        return;
      }
      if (this.payoutTargetType === 'vendor' && !this.payoutForm.vendorId) {
        alert('Please select a vendor.');
        return;
      }
      // Clean up target
      if (this.payoutTargetType === 'model') {
        this.payoutForm.vendorId = undefined;
      } else {
        this.payoutForm.modelId = undefined;
      }
      this.crmStorage.savePaymentMade(this.payoutForm as PaymentMade);
      this.isPayoutOpen = false;
    }
  }

  deleteReceipt(id: string) {
    if (confirm('Are you sure you want to remove this receipt transaction? (Does not automatically revert invoice balance)')) {
      this.crmStorage.deletePaymentReceived(id);
    }
  }

  deletePayout(id: string) {
    if (confirm('Are you sure you want to remove this payout transaction?')) {
      this.crmStorage.deletePaymentMade(id);
    }
  }
}
