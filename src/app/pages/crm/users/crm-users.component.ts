import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ModalComponent } from '../../../shared/components/ui/modal/modal.component';
import { BadgeComponent } from '../../../shared/components/ui/badge/badge.component';

import {
  CrmStorageService,
  UserAccount
} from '../../../shared/services/crm-storage.service';

@Component({
  selector: 'app-crm-users',
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
      <app-page-breadcrumb pageTitle="User Profiles & Role Configuration" />

      <!-- Controls Row -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800">
        <!-- Search -->
        <input type="text" [(ngModel)]="searchQuery" (input)="filterUsers()" placeholder="Search Name, Email..." class="h-10 px-4 rounded-lg border border-gray-300 bg-transparent text-sm dark:border-gray-700 dark:text-white placeholder:text-gray-400 focus:outline-none w-72">
        
        <!-- Add Button -->
        <button (click)="openAddModal()" class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">
          + Add User Account
        </button>
      </div>

      <!-- Users Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        @for (user of filteredUsers; track user.id) {
          <div class="p-6 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800 flex flex-col justify-between hover:shadow-lg transition">
            <div class="space-y-4">
              <!-- Header info -->
              <div class="flex justify-between items-start">
                <div>
                  <h4 class="text-base font-bold text-gray-850 dark:text-white">{{ user.name }}</h4>
                  <span class="text-xs text-gray-400">{{ user.email }}</span>
                </div>
                <app-badge size="sm" [color]="getRoleColor(user.role)">{{ user.role }}</app-badge>
              </div>

              <!-- Permission badges -->
              <div class="space-y-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Assigned Permissions</span>
                <div class="flex flex-wrap gap-1.5 text-[9px] font-medium">
                  <span class="bg-gray-100 text-gray-750 px-2 py-0.5 rounded-md">Role Base Rules</span>
                </div>
              </div>
            </div>

            <!-- Footer actions -->
            <div class="pt-4 border-t border-gray-100 dark:border-gray-800 mt-4 flex justify-between items-center text-xs">
              <span class="text-gray-400">Status: <span class="text-green-500 font-bold">Active</span></span>
              <div class="flex gap-2">
                <button (click)="openEditModal(user)" class="text-blue-600 dark:text-blue-400 font-semibold hover:underline">Edit Role</button>
                <button (click)="deleteUser(user.id)" class="text-red-500 font-semibold hover:underline">Remove</button>
              </div>
            </div>
          </div>
        } @empty {
          <div class="text-center py-16 col-span-3 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl">
            <p class="text-sm text-gray-400">No users found.</p>
          </div>
        }
      </div>

      <!-- Add / Edit Modal -->
      <app-modal [isOpen]="isFormOpen" (close)="isFormOpen = false">
        <div class="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          <h3 class="text-lg font-bold text-gray-800 dark:text-white">
            {{ editMode ? 'Edit User Configuration' : 'Create User Profile' }}
          </h3>
          <form (submit)="submitForm()" class="space-y-4 text-xs">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block mb-1.5 font-semibold text-gray-500 uppercase">Full Name *</label>
                <input type="text" [(ngModel)]="formData.name" name="userName" required class="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 dark:border-gray-700 dark:text-white">
              </div>
              <div>
                <label class="block mb-1.5 font-semibold text-gray-500 uppercase">Email Address *</label>
                <input type="email" [(ngModel)]="formData.email" name="userEmail" required class="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 dark:border-gray-700 dark:text-white">
              </div>
            </div>

            <div>
              <label class="block mb-1.5 font-semibold text-gray-500 uppercase">System Role *</label>
              <select [(ngModel)]="formData.role" name="userRole" required class="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-2 dark:border-gray-700 dark:text-white dark:bg-gray-900">
                <option value="Super Admin">Super Admin</option>
                <option value="Admin">Admin</option>
                <option value="Talent Manager">Talent Manager</option>
                <option value="Finance">Finance</option>
                <option value="Viewer">Viewer (Read Only)</option>
              </select>
            </div>

            <div class="flex justify-end gap-3 pt-3 border-t border-gray-150 dark:border-gray-800">
              <button type="button" (click)="isFormOpen = false" class="px-4 py-2 text-sm font-medium text-gray-500 border rounded-lg hover:bg-gray-50">Cancel</button>
              <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Save User Account</button>
            </div>
          </form>
        </div>
      </app-modal>
    </div>
  `
})
export class CrmUsersComponent implements OnInit, OnDestroy {

  private sub = new Subscription();
  users: UserAccount[] = [];
  filteredUsers: UserAccount[] = [];
  searchQuery = '';

  // Form states
  isFormOpen = false;
  editMode = false;
  formData: Partial<UserAccount> = {};

  constructor(private crmStorage: CrmStorageService) { }

  ngOnInit() {
    this.sub.add(this.crmStorage.getUsers$().subscribe(list => {
      this.users = list;
      this.filterUsers();
    }));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  getRoleColor(role: UserAccount['role']): 'error' | 'success' | 'primary' | 'info' | 'warning' {
    if (role === 'Super Admin') return 'error';
    if (role === 'Admin') return 'success';
    if (role === 'Talent Manager') return 'primary';
    if (role === 'Finance') return 'info';
    return 'warning';
  }

  filterUsers() {
    if (!this.searchQuery) {
      this.filteredUsers = this.users;
      return;
    }
    const q = this.searchQuery.toLowerCase();
    this.filteredUsers = this.users.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  }

  // Modals actions
  openAddModal() {
    this.editMode = false;
    this.formData = {
      name: '',
      email: '',
      role: 'Talent Manager'
    };
    this.isFormOpen = true;
  }

  openEditModal(user: UserAccount) {
    this.editMode = true;
    this.formData = JSON.parse(JSON.stringify(user));
    this.isFormOpen = true;
  }

  submitForm() {
    if (this.formData.name && this.formData.email && this.formData.role) {
      this.crmStorage.saveUser(this.formData as UserAccount);
      this.isFormOpen = false;
    }
  }

  deleteUser(id: string) {
    if (confirm('Are you sure you want to disable and delete this user profile?')) {
      this.crmStorage.deleteUser(id);
    }
  }
}
