import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ModalComponent } from '../../../shared/components/ui/modal/modal.component';
import { BadgeComponent } from '../../../shared/components/ui/badge/badge.component';

import {
  CrmStorageService,
  Invoice,
  Party,
  PaymentReceived
} from '../../../shared/services/crm-storage.service';

@Component({
  selector: 'app-crm-invoices',
  standalone: true,
  imports: [
    CommonModule,
    PageBreadcrumbComponent,
    ModalComponent,
    BadgeComponent,
    FormsModule
  ],
  template: `
    <div class="space-y-6">
      <app-page-breadcrumb pageTitle="Invoice Book & Receivables" />

      <!-- Controls Row -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800">
        <!-- Filters -->
        <div class="flex flex-wrap gap-2 text-xs">
          <button (click)="setFilter('All')" [ngClass]="{'bg-blue-600 text-white': activeFilter === 'All', 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300': activeFilter !== 'All'}" class="px-4 py-2 rounded-lg font-medium transition">
            All ({{ invoices.length }})
          </button>
          <button (click)="setFilter('Pending')" [ngClass]="{'bg-blue-600 text-white': activeFilter === 'Pending', 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300': activeFilter !== 'Pending'}" class="px-4 py-2 rounded-lg font-medium transition">
            Pending ({{ getCount('Pending') }})
          </button>
          <button (click)="setFilter('Partial')" [ngClass]="{'bg-blue-600 text-white': activeFilter === 'Partial', 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300': activeFilter !== 'Partial'}" class="px-4 py-2 rounded-lg font-medium transition">
            Partial ({{ getCount('Partial') }})
          </button>
          <button (click)="setFilter('Paid')" [ngClass]="{'bg-blue-600 text-white': activeFilter === 'Paid', 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300': activeFilter !== 'Paid'}" class="px-4 py-2 rounded-lg font-medium transition">
            Paid ({{ getCount('Paid') }})
          </button>
          <button (click)="setFilter('Overdue')" [ngClass]="{'bg-blue-600 text-white': activeFilter === 'Overdue', 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300': activeFilter !== 'Overdue'}" class="px-4 py-2 rounded-lg font-medium transition">
            Overdue ({{ getCount('Overdue') }})
          </button>
        </div>

        <!-- Search -->
        <input type="text" [(ngModel)]="searchQuery" (input)="filterInvoices()" placeholder="Search Invoice No or Client..." class="h-10 px-4 rounded-lg border border-gray-300 bg-transparent text-sm dark:border-gray-700 dark:text-white placeholder:text-gray-400 focus:outline-none w-64">
      </div>

      <!-- Invoices Table -->
      <div class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div class="max-w-full overflow-x-auto">
          <table class="min-w-full">
            <thead class="border-b border-gray-100 dark:border-white/[0.05]">
              <tr class="bg-gray-50 dark:bg-gray-850">
                <th class="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400">Invoice No / Date</th>
                <th class="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400">Client Company</th>
                <th class="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400">Tax Base</th>
                <th class="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400">Total Value</th>
                <th class="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400">Received Balance</th>
                <th class="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</th>
                <th class="px-5 py-3 font-semibold text-gray-500 text-center text-theme-xs dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-white/[0.05]">
              @for (inv of filteredInvoices; track inv.id) {
                <tr class="hover:bg-gray-50/50 dark:hover:bg-gray-850/50 transition cursor-pointer" (click)="viewInvoiceDetails(inv)">
                  <td class="px-5 py-4">
                    <span class="block font-semibold text-gray-800 dark:text-white/90 text-sm">{{ inv.invoiceNo }}</span>
                    <span class="block text-gray-400 text-xs mt-0.5">📅 Date: {{ inv.date | date:'mediumDate' }}</span>
                  </td>
                  <td class="px-5 py-4 text-xs font-semibold text-gray-700 dark:text-gray-250">
                    {{ getClientName(inv.customerId) }}
                  </td>
                  <td class="px-5 py-4 text-xs text-gray-500">
                    <p>Base: ₹{{ inv.subTotal | number }}</p>
                    <p>Tax: ₹{{ (inv.cgst + inv.sgst + inv.igst) | number }}</p>
                  </td>
                  <td class="px-5 py-4 text-sm font-bold text-gray-800 dark:text-white">
                    ₹{{ inv.grandTotal | number }}
                  </td>
                  <td class="px-5 py-4 text-xs">
                    <p class="text-green-600 font-semibold">Paid: ₹{{ inv.amountPaid | number }}</p>
                    <p class="text-red-500 font-bold mt-0.5">Due: ₹{{ inv.grandTotal - inv.amountPaid | number }}</p>
                  </td>
                  <td class="px-5 py-4">
                    <app-badge size="sm" [color]="getStatusColor(inv.status)">{{ inv.status }}</app-badge>
                  </td>
                  <td class="px-5 py-4 text-center" (click)="$event.stopPropagation()">
                    <div class="flex items-center justify-center gap-2">
                      @if (inv.grandTotal - inv.amountPaid > 0) {
                        <button (click)="openReceivePaymentModal(inv)" class="px-3 py-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition">
                          💵 Pay
                        </button>
                      } @else {
                        <span class="text-xs text-green-500 font-bold">Paid</span>
                      }
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="px-5 py-8 text-center text-gray-400 text-sm">No invoices recorded.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Invoice Details Sheet & Tax separation modal -->
      <app-modal [isOpen]="!!selectedInvoice" (close)="selectedInvoice = null">
        @if (selectedInvoice) {
          <div class="p-6 space-y-4 text-xs text-gray-600 dark:text-gray-300">
            <h3 class="text-base font-bold text-gray-850 dark:text-white">Invoice Tax Invoice: {{ selectedInvoice.invoiceNo }}</h3>
            
            <div class="p-4 bg-gray-50 dark:bg-gray-850 rounded-xl space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-400">Client:</span>
                <span class="font-bold text-gray-800 dark:text-white">{{ getClientName(selectedInvoice.customerId) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Shoot Date reference:</span>
                <span class="font-bold text-gray-800 dark:text-white">{{ selectedInvoice.date | date:'mediumDate' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Taxable base value:</span>
                <span class="font-bold text-gray-800 dark:text-white">₹{{ selectedInvoice.subTotal | number }}</span>
              </div>

              <!-- State Tax separations -->
              <div class="border-t border-gray-200 dark:border-gray-800 pt-2 space-y-1">
                @if (isLocalClient(selectedInvoice.customerId)) {
                  <div class="flex justify-between text-indigo-500 font-medium">
                    <span>CGST (9.0%):</span>
                    <span>₹{{ (selectedInvoice.cgst + selectedInvoice.sgst + selectedInvoice.igst) / 2 | number }}</span>
                  </div>
                  <div class="flex justify-between text-indigo-500 font-medium">
                    <span>SGST (9.0%):</span>
                    <span>₹{{ (selectedInvoice.cgst + selectedInvoice.sgst + selectedInvoice.igst) / 2 | number }}</span>
                  </div>
                } @else {
                  <div class="flex justify-between text-amber-500 font-medium">
                    <span>IGST (18.0%):</span>
                    <span>₹{{ (selectedInvoice.cgst + selectedInvoice.sgst + selectedInvoice.igst) | number }}</span>
                  </div>
                }
                <div class="flex justify-between">
                  <span>Round off adjustments:</span>
                  <span>₹{{ selectedInvoice.roundOff | number }}</span>
                </div>
              </div>

              <div class="flex justify-between border-t border-gray-200 dark:border-gray-800 pt-2 text-sm font-bold text-gray-800 dark:text-white">
                <span>Total Invoice Value:</span>
                <span>₹{{ selectedInvoice.grandTotal | number }}</span>
              </div>
            </div>

            <!-- Payments trail -->
            <div class="space-y-2">
              <h4 class="font-bold text-gray-400 uppercase">Received Payments Log</h4>
              <div class="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                @for (p of getInvoicePayments(selectedInvoice.id); track p.id) {
                  <div class="p-2 bg-green-50/50 dark:bg-green-950/20 border border-green-100 dark:border-green-900 rounded-lg flex justify-between">
                    <div>
                      <span class="font-semibold text-green-700 dark:text-green-400">₹{{ p.amount | number }}</span>
                      <span class="text-theme-xs text-gray-400 block">Ref: {{ p.reference }} | Date: {{ p.date | date:'shortDate' }}</span>
                    </div>
                    <span class="text-gray-400 font-semibold">{{ p.mode }}</span>
                  </div>
                } @empty {
                  <p class="text-gray-400 italic">No payments logged against this invoice.</p>
                }
              </div>
            </div>

            <div class="flex justify-end gap-2 pt-2">
              <button (click)="selectedInvoice = null" class="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">Close</button>
            </div>
          </div>
        }
      </app-modal>

      <!-- Record Payment Modal -->
      <app-modal [isOpen]="isPaymentOpen" (close)="isPaymentOpen = false">
        @if (paymentTarget) {
          <div class="p-6 space-y-4">
            <h3 class="text-lg font-bold text-gray-800 dark:text-white">Record Invoice Payment</h3>
            <p class="text-xs text-gray-500">Record settlement amount for invoice <span class="font-semibold">{{ paymentTarget.invoiceNo }}</span>.</p>
            
            <form (submit)="submitPayment()" class="space-y-4 text-xs">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block mb-1 font-semibold text-gray-500 uppercase">Grand total</label>
                  <div class="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg font-bold text-gray-700 dark:text-white">₹{{ paymentTarget.grandTotal | number }}</div>
                </div>
                <div>
                  <label class="block mb-1 font-semibold text-gray-500 uppercase">Outstanding Due</label>
                  <div class="p-2.5 bg-red-50 dark:bg-red-950/30 text-red-500 rounded-lg font-bold">₹{{ paymentTarget.grandTotal - paymentTarget.amountPaid | number }}</div>
                </div>
              </div>

              <div>
                <label class="block mb-1 font-semibold text-gray-500 uppercase">Receipt Amount (₹) *</label>
                <input type="number" [(ngModel)]="paymentForm.amount" name="payAmount" required class="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-xs dark:border-gray-700 dark:text-white">
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block mb-1 font-semibold text-gray-500 uppercase">Payment Mode *</label>
                  <select [(ngModel)]="paymentForm.mode" name="payMode" required class="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-2 text-xs dark:border-gray-700 dark:text-white dark:bg-gray-900">
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
                <div>
                  <label class="block mb-1 font-semibold text-gray-500 uppercase">TDS Deducted (₹)</label>
                  <input type="number" [(ngModel)]="paymentForm.tdsDeduction" name="payTds" class="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-xs dark:border-gray-700 dark:text-white">
                </div>
              </div>

              <div>
                <label class="block mb-1 font-semibold text-gray-500 uppercase">TXN Reference / Receipt No *</label>
                <input type="text" [(ngModel)]="paymentForm.reference" name="payRef" required class="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-xs dark:border-gray-700 dark:text-white" placeholder="UTR or reference...">
              </div>

              <div>
                <label class="block mb-1 font-semibold text-gray-500 uppercase">Payment Date *</label>
                <input type="date" [(ngModel)]="paymentForm.date" name="payDate" required class="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-xs dark:border-gray-700 dark:text-white">
              </div>

              <div class="flex justify-end gap-3 pt-3 border-t border-gray-150 dark:border-gray-800">
                <button type="button" (click)="isPaymentOpen = false" class="px-4 py-2 text-sm font-medium text-gray-500 border rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">Record Settlement</button>
              </div>
            </form>
          </div>
        }
      </app-modal>
    </div>
  `
})
export class CrmInvoicesComponent implements OnInit, OnDestroy {

  private sub = new Subscription();
  invoices: Invoice[] = [];
  filteredInvoices: Invoice[] = [];
  clients: Party[] = [];
  allPayments: PaymentReceived[] = [];

  activeFilter: 'All' | Invoice['status'] = 'All';
  searchQuery: string = '';

  // Detail target
  selectedInvoice: Invoice | null = null;

  // Payment popup state
  isPaymentOpen = false;
  paymentTarget: Invoice | null = null;
  paymentForm: Partial<PaymentReceived> = {};

  constructor(private crmStorage: CrmStorageService) { }

  ngOnInit() {
    this.sub.add(this.crmStorage.getInvoices$().subscribe(list => {
      this.invoices = list;
      this.filterInvoices();
      if (this.selectedInvoice) {
        const fresh = list.find(i => i.id === this.selectedInvoice!.id);
        if (fresh) this.selectedInvoice = fresh;
      }
    }));
    this.sub.add(this.crmStorage.getParties$().subscribe(parties => {
      this.clients = parties.filter(p => p.partyType === 'Customer' || p.partyType === 'Customer + Vendor');
    }));
    this.sub.add(this.crmStorage.getPaymentsReceived$().subscribe(list => this.allPayments = list));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  getStatusColor(status: Invoice['status']): 'success' | 'warning' | 'error' | 'info' {
    if (status === 'Paid') return 'success';
    if (status === 'Pending') return 'warning';
    if (status === 'Partial') return 'info';
    return 'error';
  }

  getClientName(id: string): string {
    const c = this.clients.find(p => p.id === id);
    return c ? c.companyName : 'Unknown Client';
  }

  isLocalClient(clientId: string): boolean {
    const c = this.clients.find(p => p.id === clientId);
    // Mock local: if state is Maharashtra (standard setup)
    return c ? c.state.toLowerCase() === 'maharashtra' : true;
  }

  getInvoicePayments(invoiceId: string): PaymentReceived[] {
    return this.allPayments.filter(p => p.invoiceId === invoiceId);
  }

  getCount(status: Invoice['status']): number {
    return this.invoices.filter(i => i.status === status).length;
  }

  setFilter(filter: 'All' | Invoice['status']) {
    this.activeFilter = filter;
    this.filterInvoices();
  }

  filterInvoices() {
    let list = this.invoices;
    if (this.activeFilter !== 'All') {
      list = list.filter(i => i.status === this.activeFilter);
    }
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(i =>
        i.invoiceNo.toLowerCase().includes(q) ||
        this.getClientName(i.customerId).toLowerCase().includes(q)
      );
    }
    this.filteredInvoices = list;
  }

  viewInvoiceDetails(inv: Invoice) {
    this.selectedInvoice = inv;
  }

  // Receive Payment Modal actions
  openReceivePaymentModal(inv: Invoice) {
    this.paymentTarget = inv;
    this.paymentForm = {
      invoiceId: inv.id,
      customerId: inv.customerId,
      amount: inv.grandTotal - inv.amountPaid, // default to remaining balance
      tdsDeduction: 0,
      mode: 'Bank Transfer',
      reference: '',
      date: new Date().toISOString().split('T')[0]
    };
    this.isPaymentOpen = true;
  }

  submitPayment() {
    if (this.paymentTarget && this.paymentForm.amount && this.paymentForm.reference && this.paymentForm.date) {
      this.crmStorage.savePaymentReceived(this.paymentForm as PaymentReceived);
      this.isPaymentOpen = false;
      this.paymentTarget = null;
    }
  }
}
