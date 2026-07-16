import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ModalComponent } from '../../../shared/components/ui/modal/modal.component';

import {
  CrmStorageService,
  MastersData
} from '../../../shared/services/crm-storage.service';

@Component({
  selector: 'app-crm-masters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageBreadcrumbComponent,
    ModalComponent
  ],
  template: `
    <div class="space-y-6">
      <app-page-breadcrumb pageTitle="Reusable Masters Settings" />

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Master Tables Navigation Left -->
        <div class="p-6 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800 space-y-2 h-fit">
          <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Choose Master List</h3>
          
          @for (m of masterTables; track m.id) {
            <button (click)="selectMaster(m.id)" [ngClass]="{'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 font-bold': activeMasterId === m.id, 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-850': activeMasterId !== m.id}" class="w-full text-left px-4 py-2.5 rounded-lg text-xs transition">
              {{ m.name }}
            </button>
          }
        </div>

        <!-- Master Items CRUD List Right -->
        <div class="lg:col-span-3 p-6 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800 space-y-4">
          <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
            <h3 class="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider">{{ getActiveMasterName() }} Directory</h3>
            <button (click)="openAddModal()" class="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg">
              + Add Item
            </button>
          </div>

          <div class="overflow-hidden rounded-xl border border-gray-150 dark:border-white/[0.05] bg-white dark:bg-white/[0.03] text-xs">
            <table class="min-w-full">
              <thead>
                <tr class="bg-gray-50 dark:bg-gray-850 text-gray-500 font-bold border-b border-gray-100 dark:border-white/[0.05]">
                  <th class="px-5 py-3 text-left">Code / ID</th>
                  <th class="px-5 py-3 text-left">Name / Description</th>
                  <th class="px-5 py-3 text-center w-24">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-white/[0.05]">
                @for (item of getActiveItems(); track item.id) {
                  <tr class="hover:bg-gray-50/50 dark:hover:bg-gray-850/50 transition">
                    <td class="px-5 py-3 font-semibold text-gray-400">{{ item.id }}</td>
                    <td class="px-5 py-3 font-bold text-gray-700 dark:text-gray-300">{{ item.name }}</td>
                    <td class="px-5 py-3 text-center">
                      <button (click)="deleteItem(item.id)" class="text-red-500 hover:underline font-semibold">Delete</button>
                    </td>
                  </tr>
                } @empty {
                  <tr><td colspan="3" class="px-5 py-8 text-center text-gray-400">No master items loaded.</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Add Modal -->
      <app-modal [isOpen]="isFormOpen" (close)="isFormOpen = false">
        <div class="p-6 space-y-4">
          <h3 class="text-lg font-bold text-gray-800 dark:text-white">Add Master Line</h3>
          <form (submit)="saveItem()" class="space-y-4 text-xs">
            <div>
              <label class="block mb-1.5 font-semibold text-gray-500 uppercase">Item ID (Short Code) *</label>
              <input type="text" [(ngModel)]="formId" name="fId" required placeholder="e.g. CITY_PUNE or BR_GUCCI" class="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 dark:border-gray-700 dark:text-white">
            </div>
            <div>
              <label class="block mb-1.5 font-semibold text-gray-500 uppercase">Item Name *</label>
              <input type="text" [(ngModel)]="formName" name="fName" required placeholder="e.g. Pune or Gucci" class="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 dark:border-gray-700 dark:text-white">
            </div>

            <div class="flex justify-end gap-3 pt-3 border-t border-gray-150 dark:border-gray-800">
              <button type="button" (click)="isFormOpen = false" class="px-4 py-2 text-sm font-medium text-gray-500 border rounded-lg hover:bg-gray-50">Cancel</button>
              <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Save Item</button>
            </div>
          </form>
        </div>
      </app-modal>
    </div>
  `
})
export class CrmMastersComponent implements OnInit, OnDestroy {

  private sub = new Subscription();
  masters: MastersData | null = null;

  masterTables = [
    { id: 'brands', name: 'Brands' },
    { id: 'categories', name: 'Shoot Categories' },
    { id: 'modelCategories', name: 'Model Categories' },
    { id: 'cities', name: 'Cities' },
    { id: 'coordinators', name: 'Coordinators' }
  ];

  activeMasterId = 'brands';

  // Form states
  isFormOpen = false;
  formId = '';
  formName = '';

  constructor(private crmStorage: CrmStorageService) { }

  ngOnInit() {
    this.sub.add(this.crmStorage.getMasters$().subscribe(data => this.masters = data));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  selectMaster(id: string) {
    this.activeMasterId = id;
  }

  getActiveMasterName(): string {
    const table = this.masterTables.find(t => t.id === this.activeMasterId);
    return table ? table.name : '';
  }

  getActiveItems(): { id: string; name: string }[] {
    if (!this.masters) return [];
    const val = (this.masters as any)[this.activeMasterId];
    return Array.isArray(val) ? val : [];
  }

  openAddModal() {
    this.formId = '';
    this.formName = '';
    this.isFormOpen = true;
  }

  saveItem() {
    if (this.formId && this.formName && this.masters) {
      const items = this.getActiveItems();
      // check duplicates
      if (items.some(i => i.id === this.formId)) {
        alert('Item Code already exists.');
        return;
      }

      items.push({ id: this.formId, name: this.formName });
      this.crmStorage.saveMasters(this.masters);
      this.isFormOpen = false;
    }
  }

  deleteItem(id: string) {
    if (confirm('Are you sure you want to remove this Master reference?')) {
      if (this.masters) {
        const items = this.getActiveItems();
        const index = items.findIndex(i => i.id === id);
        if (index > -1) {
          items.splice(index, 1);
          this.crmStorage.saveMasters(this.masters);
        }
      }
    }
  }
}
