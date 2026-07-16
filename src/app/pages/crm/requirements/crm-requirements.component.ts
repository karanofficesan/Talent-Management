import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ModalComponent } from '../../../shared/components/ui/modal/modal.component';
import { BadgeComponent } from '../../../shared/components/ui/badge/badge.component';

import {
  CrmStorageService,
  Requirement,
  Party,
  MastersData,
  FollowUp
} from '../../../shared/services/crm-storage.service';

@Component({
  selector: 'app-crm-requirements',
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
      <app-page-breadcrumb pageTitle="Client Requirements & Castings" />

      <!-- Controls Row -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800">
        <!-- Search -->
        <input type="text" [(ngModel)]="searchQuery" (input)="filterReqs()" placeholder="Search Project or Location..." class="h-10 px-4 rounded-lg border border-gray-300 bg-transparent text-sm dark:border-gray-700 dark:text-white placeholder:text-gray-400 focus:outline-none w-72">
        
        <!-- Add Button -->
        <button (click)="openAddModal()" class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">
          + Add Requirement
        </button>
      </div>

      <!-- Requirements Table -->
      <div class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div class="max-w-full overflow-x-auto">
          <table class="min-w-full">
            <thead class="border-b border-gray-100 dark:border-white/[0.05]">
              <tr class="bg-gray-50 dark:bg-gray-850">
                <th class="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400">Project / Client</th>
                <th class="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400">Specs Required</th>
                <th class="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400">Shoot Date & Location</th>
                <th class="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400">Budget</th>
                <th class="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400">Follow-ups</th>
                <th class="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</th>
                <th class="px-5 py-3 font-semibold text-gray-500 text-center text-theme-xs dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-white/[0.05]">
              @for (req of filteredReqs; track req.id) {
                <tr class="hover:bg-gray-50/50 dark:hover:bg-gray-850/50 transition cursor-pointer" (click)="viewPipelineDetails(req)">
                  <td class="px-5 py-4">
                    <span class="block font-semibold text-gray-800 dark:text-white/90 text-sm">{{ req.project }}</span>
                    <span class="block text-gray-400 text-xs mt-0.5">👤 Client: {{ getClientName(req.clientId) }}</span>
                  </td>
                  <td class="px-5 py-4 text-xs text-gray-600 dark:text-gray-300">
                    <p>Category: {{ getCategoryLabel(req.categoryId) }}</p>
                    <p>Preference: {{ req.gender }} ({{ req.noOfModels }} models)</p>
                  </td>
                  <td class="px-5 py-4 text-xs text-gray-600 dark:text-gray-300">
                    <p>📅 {{ req.shootDate | date:'mediumDate' }}</p>
                    <p>📍 {{ req.location }}</p>
                  </td>
                  <td class="px-5 py-4 text-sm font-bold text-gray-800 dark:text-white">
                    ₹{{ req.budget | number }}
                  </td>
                  <td class="px-5 py-4 text-xs">
                    <span class="text-blue-500 font-semibold">{{ req.followUps.length }} Contact logs</span>
                    @if (req.followUps.length > 0) {
                      <span class="block text-gray-400 mt-0.5">Next: {{ getLatestFollowUpDate(req.followUps) | date:'shortDate' }}</span>
                    }
                  </td>
                  <td class="px-5 py-4">
                    <app-badge size="sm" [color]="getStatusColor(req.status)">{{ req.status }}</app-badge>
                  </td>
                  <td class="px-5 py-4 text-center" (click)="$event.stopPropagation()">
                    <div class="flex items-center justify-center gap-2">
                      <button (click)="openEditModal(req)" class="p-1 text-gray-400 hover:text-blue-600 rounded">
                        <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
                      <button (click)="deleteReq(req.id)" class="p-1 text-gray-400 hover:text-red-600 rounded">
                        <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="px-5 py-8 text-center text-gray-400 text-sm">No casting requirements found.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Follow-up Timeline & Pipeline Drawer -->
      <app-modal [isOpen]="!!selectedReq" (close)="selectedReq = null" [isFullscreen]="true" [className]="'bg-gray-50 dark:bg-gray-950 p-6 overflow-y-auto'">
        @if (selectedReq) {
          <div class="max-w-4xl mx-auto space-y-6 pt-8">
            <!-- Header Block -->
            <div class="p-6 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800 flex justify-between items-center">
              <div>
                <span class="text-xs font-semibold text-blue-600 uppercase">Casting Pipeline Details</span>
                <h2 class="text-xl font-bold text-gray-800 dark:text-white mt-1">{{ selectedReq.project }}</h2>
                <p class="text-xs text-gray-400 mt-1">Client: {{ getClientName(selectedReq.clientId) }} | Budget: ₹{{ selectedReq.budget | number }}</p>
              </div>
              <button (click)="selectedReq = null" class="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700">Close Pipeline</button>
            </div>

            <!-- Follow-up Add Form & Chronological Timeline -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <!-- Timeline Form -->
              <div class="p-6 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800 space-y-4">
                <h3 class="text-sm font-bold text-gray-800 dark:text-white uppercase">Add New Follow-Up Contact</h3>
                <form (submit)="submitFollowUp()" class="space-y-4 text-xs">
                  <div>
                    <label class="block mb-1 font-semibold text-gray-500 uppercase">Contact Date *</label>
                    <input type="date" [(ngModel)]="newFollow.date" name="followDate" required class="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-xs dark:border-gray-700 dark:text-white">
                  </div>
                  <div>
                    <label class="block mb-1 font-semibold text-gray-500 uppercase">Discussion log *</label>
                    <textarea [(ngModel)]="newFollow.discussion" name="followDisc" required class="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-xs dark:border-gray-700 dark:text-white" rows="4" placeholder="Log details of call/chat..."></textarea>
                  </div>
                  <div>
                    <label class="block mb-1 font-semibold text-gray-500 uppercase">Next Follow-Up Date</label>
                    <input type="date" [(ngModel)]="newFollow.nextFollowUpDate" name="followNext" class="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-xs dark:border-gray-700 dark:text-white">
                  </div>
                  <div class="flex items-center gap-2 pt-2">
                    <input type="checkbox" id="followRem" [(ngModel)]="newFollow.reminder" name="followReminder" class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500">
                    <label for="followRem" class="font-semibold text-gray-600 dark:text-gray-400">Set Calendar reminder</label>
                  </div>
                  <div class="pt-4 flex justify-end">
                    <button type="submit" class="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Save Log Entry</button>
                  </div>
                </form>
              </div>

              <!-- Timeline Display -->
              <div class="p-6 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800 space-y-4">
                <h3 class="text-sm font-bold text-gray-800 dark:text-white uppercase">Pipeline Interaction Log ({{ selectedReq.followUps.length }})</h3>
                
                <div class="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-150 dark:before:bg-gray-800 overflow-y-auto max-h-[400px] pr-2">
                  @for (f of getSortedFollowUps(selectedReq.followUps); track f.id) {
                    <div class="relative">
                      <!-- Bullet -->
                      <div class="absolute -left-[22px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white bg-blue-600 dark:border-gray-900 shadow"></div>
                      <div class="bg-gray-50 dark:bg-gray-850 border border-gray-100 dark:border-gray-800 p-3 rounded-xl">
                        <div class="flex justify-between items-center">
                          <span class="text-[10px] font-semibold text-gray-400">{{ f.date | date:'mediumDate' }}</span>
                          @if (f.reminder && f.nextFollowUpDate) {
                            <span class="text-[9px] bg-red-100 text-red-600 dark:bg-red-950/20 dark:text-red-400 px-1.5 py-0.5 rounded font-bold">
                              ⏰ Alert: {{ f.nextFollowUpDate | date:'shortDate' }}
                            </span>
                          }
                        </div>
                        <p class="text-xs text-gray-700 dark:text-gray-300 mt-2 whitespace-pre-line">{{ f.discussion }}</p>
                      </div>
                    </div>
                  } @empty {
                    <p class="text-xs text-gray-400 py-8 text-center">No logs generated. Write a follow-up log to build the pipeline.</p>
                  }
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
            {{ editMode ? 'Edit Casting Requirement' : 'Add Casting Requirement' }}
          </h3>
          <form (submit)="submitForm()" class="grid grid-cols-2 gap-4">
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Client *</label>
              <select [(ngModel)]="formData.clientId" name="clientId" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white dark:bg-gray-900">
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
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Project Name *</label>
              <input type="text" [(ngModel)]="formData.project" name="project" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Shoot Date *</label>
              <input type="date" [(ngModel)]="formData.shootDate" name="shootDate" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Location *</label>
              <input type="text" [(ngModel)]="formData.location" name="location" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Gender Preference</label>
              <select [(ngModel)]="formData.gender" name="gender" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white dark:bg-gray-900">
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
                <option value="All">All</option>
              </select>
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Models Required *</label>
              <input type="number" [(ngModel)]="formData.noOfModels" name="noOfModels" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Budget (₹) *</label>
              <input type="number" [(ngModel)]="formData.budget" name="budget" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Status</label>
              <select [(ngModel)]="formData.status" name="status" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white dark:bg-gray-900">
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div class="col-span-2">
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Experience (Years) & Other Requirements</label>
              <textarea [(ngModel)]="formData.requirements" name="requirements" class="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm dark:border-gray-700 dark:text-white" rows="3"></textarea>
            </div>
            
            <div class="flex justify-end gap-3 col-span-2 mt-4 border-t border-gray-100 dark:border-gray-800 pt-4">
              <button type="button" (click)="isFormOpen = false" class="px-4 py-2 text-sm font-medium text-gray-500 border rounded-lg hover:bg-gray-50">Cancel</button>
              <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Save Requirement</button>
            </div>
          </form>
        </div>
      </app-modal>
    </div>
  `
})
export class CrmRequirementsComponent implements OnInit, OnDestroy {

  private sub = new Subscription();
  reqs: Requirement[] = [];
  filteredReqs: Requirement[] = [];
  clients: Party[] = [];
  masters: MastersData | null = null;
  searchQuery: string = '';

  // Pipeline follow-ups drawer
  selectedReq: Requirement | null = null;
  newFollow: Partial<FollowUp> = {};

  // Form states
  isFormOpen = false;
  editMode = false;
  formData: Partial<Requirement> = {};

  constructor(private crmStorage: CrmStorageService) { }

  ngOnInit() {
    this.sub.add(this.crmStorage.getRequirements$().subscribe(list => {
      this.reqs = list;
      this.filterReqs();
      if (this.selectedReq) {
        const fresh = list.find(r => r.id === this.selectedReq!.id);
        if (fresh) this.selectedReq = fresh;
      }
    }));
    this.sub.add(this.crmStorage.getParties$().subscribe(parties => {
      this.clients = parties.filter(p => p.partyType === 'Customer' || p.partyType === 'Customer + Vendor');
    }));
    this.sub.add(this.crmStorage.getMasters$().subscribe(data => this.masters = data));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  getStatusColor(status: Requirement['status']): 'success' | 'primary' | 'error' {
    if (status === 'Open') return 'success';
    if (status === 'In Progress') return 'primary';
    return 'error';
  }

  getClientName(id: string): string {
    const c = this.clients.find(p => p.id === id);
    return c ? c.companyName : 'Unknown Client';
  }

  getCategoryLabel(catId: string): string {
    const item = this.masters?.categories.find(c => c.id === catId);
    return item ? item.name : 'Other';
  }

  getLatestFollowUpDate(followUps: FollowUp[]): string | null {
    if (followUps.length === 0) return null;
    const sorted = [...followUps].sort((a, b) => b.nextFollowUpDate.localeCompare(a.nextFollowUpDate));
    return sorted[0].nextFollowUpDate;
  }

  getSortedFollowUps(followUps: FollowUp[]): FollowUp[] {
    return [...followUps].sort((a, b) => b.date.localeCompare(a.date)); // latest first
  }

  filterReqs() {
    if (!this.searchQuery) {
      this.filteredReqs = this.reqs;
      return;
    }
    const q = this.searchQuery.toLowerCase();
    this.filteredReqs = this.reqs.filter(r =>
      r.project.toLowerCase().includes(q) ||
      r.location.toLowerCase().includes(q)
    );
  }

  // Pipeline Followups drawer details
  viewPipelineDetails(req: Requirement) {
    this.selectedReq = req;
    this.newFollow = {
      date: new Date().toISOString().split('T')[0],
      discussion: '',
      nextFollowUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days default
      reminder: true
    };
  }

  submitFollowUp() {
    if (this.selectedReq && this.newFollow.date && this.newFollow.discussion) {
      this.crmStorage.addRequirementFollowUp(this.selectedReq.id, this.newFollow as FollowUp);
      // Reset followUp form
      this.newFollow = {
        date: new Date().toISOString().split('T')[0],
        discussion: '',
        nextFollowUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        reminder: true
      };
    }
  }

  // CRUD MODALS
  openAddModal() {
    this.editMode = false;
    this.formData = {
      clientId: this.clients[0]?.id || '',
      brandId: this.masters?.brands[0]?.id || '',
      categoryId: this.masters?.categories[0]?.id || '',
      gender: 'Female',
      noOfModels: 1,
      budget: 50000,
      status: 'Open',
      shootDate: new Date().toISOString().split('T')[0],
      requirements: ''
    };
    this.isFormOpen = true;
  }

  openEditModal(req: Requirement) {
    this.editMode = true;
    this.formData = JSON.parse(JSON.stringify(req));
    this.isFormOpen = true;
  }

  submitForm() {
    if (this.formData.project && this.formData.clientId && this.formData.shootDate) {
      this.crmStorage.saveRequirement(this.formData as Requirement);
      this.isFormOpen = false;
    }
  }

  deleteReq(id: string) {
    if (confirm('Are you sure you want to remove this casting requirement?')) {
      this.crmStorage.deleteRequirement(id);
    }
  }
}
