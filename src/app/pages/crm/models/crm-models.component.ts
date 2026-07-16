import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ModalComponent } from '../../../shared/components/ui/modal/modal.component';
import { BadgeComponent } from '../../../shared/components/ui/badge/badge.component';

import {
  CrmStorageService,
  Model,
  Party,
  MastersData
} from '../../../shared/services/crm-storage.service';

@Component({
  selector: 'app-crm-models',
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
      <app-page-breadcrumb pageTitle="Model Management Directory" />

      <!-- Controls Row -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800">
        <!-- View Toggle & Search -->
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-0.5 rounded-lg bg-gray-100 dark:bg-gray-900 p-0.5 text-xs">
            <button
              (click)="viewMode = 'grid'"
              [ngClass]="viewMode === 'grid' ? 'shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800 font-semibold' : 'text-gray-500 dark:text-gray-400'"
              class="px-3 py-1.5 rounded-md transition hover:text-gray-900 dark:hover:text-white"
            >
              Grid View
            </button>
            <button
              (click)="viewMode = 'list'"
              [ngClass]="viewMode === 'list' ? 'shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800 font-semibold' : 'text-gray-500 dark:text-gray-400'"
              class="px-3 py-1.5 rounded-md transition hover:text-gray-900 dark:hover:text-white"
            >
              List View
            </button>
          </div>
          <input type="text" [(ngModel)]="searchQuery" (input)="filterModels()" placeholder="Search Name, City, Nationality..." class="h-10 px-4 rounded-lg border border-gray-300 bg-transparent text-sm dark:border-gray-700 dark:text-white placeholder:text-gray-400 focus:outline-none w-64">
        </div>

        <!-- Action buttons -->
        <div class="flex items-center gap-2">
          <button (click)="openImportModal()" class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
            📥 Import Models
          </button>
          <button (click)="openAddModal()" class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">
            + Add Model
          </button>
        </div>
      </div>

      <!-- Models Layout -->
      @if (viewMode === 'grid') {
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          @for (model of filteredModels; track model.id) {
            <div class="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:shadow-lg transition cursor-pointer flex flex-col" (click)="viewProfile(model)">
              <!-- Image Banner -->
              <div class="h-56 bg-gray-100 dark:bg-gray-800 relative overflow-hidden group/img">
                @if (model.portfolioImages && model.portfolioImages.length > 0) {
                  <img [src]="model.portfolioImages[0]" class="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500" alt="{{ model.name }}">
                } @else {
                  <div class="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center font-bold text-5xl text-blue-600 dark:text-blue-400 opacity-80">
                    {{ model.name[0] }}
                  </div>
                }
                <span class="absolute top-3 right-3 z-10">
                  <app-badge size="sm" [color]="getStatusColor(model.status)">{{ model.status }}</app-badge>
                </span>
              </div>
              <div class="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 class="text-base font-bold text-gray-800 dark:text-white">{{ model.name }}</h4>
                  <p class="text-xs text-gray-400 mt-0.5">{{ model.gender }} | {{ model.age }} Yrs | {{ model.height }} cm</p>
                  <p class="text-xs text-gray-500 mt-2 font-medium">📍 {{ model.city }} ({{ model.nationality }})</p>
                  <p class="text-xs text-blue-600 dark:text-blue-400 mt-1" *ngIf="model.instagram">📸 &#64;{{ model.instagram }}</p>
                </div>
                <div class="border-t border-gray-100 dark:border-gray-800 mt-3 pt-3 flex items-center justify-between">
                  <span class="text-xs text-gray-400">Day Rate</span>
                  <span class="text-sm font-bold text-gray-800 dark:text-white">₹{{ model.dayRate | number }}</span>
                </div>
              </div>
            </div>
          } @empty {
            <p class="text-sm text-gray-400 text-center py-12 col-span-4">No models match the filter criteria.</p>
          }
        </div>
      } @else {
        <!-- List Table View -->
        <div class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div class="max-w-full overflow-x-auto">
            <table class="min-w-full">
              <thead class="border-b border-gray-100 dark:border-white/[0.05]">
                <tr class="bg-gray-50 dark:bg-gray-850">
                  <th class="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400">Name</th>
                  <th class="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400">Physical Stats</th>
                  <th class="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400">Contact</th>
                  <th class="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400">Linked Vendor</th>
                  <th class="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400">Day Rate</th>
                  <th class="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</th>
                  <th class="px-5 py-3 font-semibold text-gray-500 text-center text-theme-xs dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-white/[0.05]">
                @for (model of filteredModels; track model.id) {
                  <tr class="hover:bg-gray-50/50 dark:hover:bg-gray-850/50 transition cursor-pointer" (click)="viewProfile(model)">
                    <td class="px-5 py-4 text-sm">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                          @if (model.portfolioImages && model.portfolioImages.length > 0) {
                            <img [src]="model.portfolioImages[0]" class="w-full h-full object-cover" alt="{{ model.name }}">
                          } @else {
                            <span class="font-bold text-blue-600 dark:text-blue-400 text-xs">{{ model.name[0] }}</span>
                          }
                        </div>
                        <div>
                          <span class="font-semibold text-gray-800 dark:text-white/90 block">{{ model.name }}</span>
                          <span class="block text-xs text-gray-400 mt-0.5">📍 {{ model.city }}, {{ model.nationality }}</span>
                        </div>
                      </div>
                    </td>
                    <td class="px-5 py-4 text-xs text-gray-600 dark:text-gray-300">
                      <p>Gender: {{ model.gender }}</p>
                      <p>Age: {{ model.age }} Yrs</p>
                      <p>Height: {{ model.height }} cm</p>
                    </td>
                    <td class="px-5 py-4 text-xs text-gray-600 dark:text-gray-300">
                      <p>📞 {{ model.mobile }}</p>
                      <p>✉️ {{ model.email }}</p>
                    </td>
                    <td class="px-5 py-4 text-xs text-gray-600 dark:text-gray-300">
                      {{ getVendorName(model.vendorId) }}
                    </td>
                    <td class="px-5 py-4 text-sm font-bold text-gray-800 dark:text-white">
                      ₹{{ model.dayRate | number }}
                    </td>
                    <td class="px-5 py-4">
                      <app-badge size="sm" [color]="getStatusColor(model.status)">{{ model.status }}</app-badge>
                    </td>
                    <td class="px-5 py-4 text-center" (click)="$event.stopPropagation()">
                      <div class="flex items-center justify-center gap-2">
                        <button (click)="openEditModal(model)" class="p-1 text-gray-400 hover:text-blue-600 rounded">
                          <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </button>
                        <button (click)="deleteModel(model.id)" class="p-1 text-gray-400 hover:text-red-600 rounded">
                          <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="px-5 py-8 text-center text-gray-400 text-sm">No models match the filter.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- Detailed Profile Modal -->
      <app-modal [isOpen]="!!selectedModel" (close)="selectedModel = null" [isFullscreen]="true" [className]="'bg-gray-50 dark:bg-gray-950 p-6 overflow-y-auto'">
        @if (selectedModel) {
          <div class="max-w-5xl mx-auto space-y-6 pt-8">
            <!-- Header banner -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800 gap-4">
              <div class="flex items-center gap-4">
                <div class="w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-md bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center font-bold text-3xl text-blue-600 dark:text-blue-400 flex-shrink-0">
                  @if (selectedModel.portfolioImages && selectedModel.portfolioImages.length > 0) {
                    <img [src]="selectedModel.portfolioImages[0]" class="w-full h-full object-cover" alt="{{ selectedModel.name }}">
                  } @else {
                    {{ selectedModel.name[0] }}
                  }
                </div>
                <div>
                  <h2 class="text-xl font-bold text-gray-800 dark:text-white">{{ selectedModel.name }}</h2>
                  <p class="text-xs text-gray-400 mt-1">Model ID: {{ selectedModel.id }} | Registered: {{ selectedModel.createdAt | date:'mediumDate' }}</p>
                </div>
              </div>
              <div class="flex gap-2">
                <app-badge size="md" [color]="getStatusColor(selectedModel.status)">{{ selectedModel.status }}</app-badge>
                <button (click)="openEditModal(selectedModel); selectedModel = null" class="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">Edit Profile</button>
                <button (click)="selectedModel = null" class="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700">Close</button>
              </div>
            </div>

            <!-- Profile Info Blocks -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- Physical stats -->
              <div class="p-6 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800 space-y-3">
                <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Physical Attributes</h4>
                <div class="text-xs space-y-2 text-gray-600 dark:text-gray-300">
                  <p><span class="font-medium text-gray-400 block">Gender</span> {{ selectedModel.gender }}</p>
                  <p><span class="font-medium text-gray-400 block">Age</span> {{ selectedModel.age }} Years</p>
                  <p><span class="font-medium text-gray-400 block">Height</span> {{ selectedModel.height }} cm</p>
                  <p><span class="font-medium text-gray-400 block">Hair Color</span> {{ selectedModel.hairColor || 'N/A' }}</p>
                  <p><span class="font-medium text-gray-400 block">Skin Tone</span> {{ selectedModel.skinTone || 'N/A' }}</p>
                  <p><span class="font-medium text-gray-400 block">Nationality</span> {{ selectedModel.nationality }}</p>
                </div>
              </div>

              <!-- Professional details -->
              <div class="p-6 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800 space-y-3">
                <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Professional & Vendor</h4>
                <div class="text-xs space-y-2 text-gray-600 dark:text-gray-300">
                  <p><span class="font-medium text-gray-400 block">Category Mappings</span> 
                    @for (catId of selectedModel.categoryIds; track catId) {
                      <span class="inline-block bg-gray-100 dark:bg-gray-850 px-2 py-0.5 rounded mr-1 text-[10px] mt-1">{{ getCategoryLabel(catId) }}</span>
                    }
                  </p>
                  <p><span class="font-medium text-gray-400 block">Experience</span> {{ selectedModel.experienceYears }} Years</p>
                  <p><span class="font-medium text-gray-400 block">Vendor Link</span> {{ getVendorName(selectedModel.vendorId) }}</p>
                  <p><span class="font-medium text-gray-400 block">Instagram</span> 
                    <a *ngIf="selectedModel.instagram" [href]="'https://instagram.com/'+selectedModel.instagram" target="_blank" class="text-blue-500 hover:underline">📸 &#64;{{ selectedModel.instagram }}</a>
                    <span *ngIf="!selectedModel.instagram">N/A</span>
                  </p>
                  <p><span class="font-medium text-gray-400 block">Shoot Day Rate</span> <span class="text-sm font-bold text-gray-800 dark:text-white">₹{{ selectedModel.dayRate | number }}</span></p>
                </div>
              </div>

              <!-- Settlement Details -->
              <div class="p-6 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800 space-y-3">
                <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Settlement & Bank Info</h4>
                <div class="text-xs space-y-2 text-gray-600 dark:text-gray-300">
                  <p><span class="font-medium text-gray-400 block">Bank Name</span> {{ selectedModel.bankDetails.bankName || 'N/A' }}</p>
                  <p><span class="font-medium text-gray-400 block">Account Holder</span> {{ selectedModel.bankDetails.accountName || 'N/A' }}</p>
                  <p><span class="font-medium text-gray-400 block">Account Number</span> {{ selectedModel.bankDetails.accountNumber || 'N/A' }}</p>
                  <p><span class="font-medium text-gray-400 block">IFSC / Branch</span> {{ selectedModel.bankDetails.ifsc || 'N/A' }} ({{ selectedModel.bankDetails.branch || 'N/A' }})</p>
                  <p><span class="font-medium text-gray-400 block">UPI ID</span> {{ selectedModel.bankDetails.upiId || 'N/A' }}</p>
                </div>
              </div>
            </div>

            <!-- Portfolio Media Gallery -->
            <div class="p-6 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800 space-y-6">
              <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                <div>
                  <h3 class="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider">Portfolio Media Gallery</h3>
                  <p class="text-[11px] text-gray-400 mt-0.5">High-definition headshots and showreel videos</p>
                </div>
                <span class="text-xs text-gray-500 font-medium">
                  📸 {{ selectedModel.portfolioImages.length }} Images | 🎥 {{ selectedModel.portfolioVideos.length }} Videos
                </span>
              </div>

              <!-- Images section -->
              <div class="space-y-3">
                <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Photos & Headshots</h4>
                @if (selectedModel.portfolioImages && selectedModel.portfolioImages.length > 0) {
                  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    @for (img of selectedModel.portfolioImages; track $index) {
                      <div class="relative group rounded-xl overflow-hidden aspect-[3/4] bg-gray-100 border border-gray-200 dark:border-gray-800 cursor-zoom-in" (click)="activeLightboxImage = img">
                        <img [src]="img" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" alt="Portfolio Image">
                        <div class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"/></svg>
                        </div>
                      </div>
                    }
                  </div>
                } @else {
                  <div class="p-8 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                    <p class="text-xs text-gray-400">No portfolio images uploaded for this model yet.</p>
                  </div>
                }
              </div>

              <!-- Videos section -->
              <div class="space-y-3">
                <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Showreels & Introduction Videos</h4>
                @if (selectedModel.portfolioVideos && selectedModel.portfolioVideos.length > 0) {
                  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    @for (vid of selectedModel.portfolioVideos; track $index) {
                      <div class="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-black shadow-sm aspect-video relative">
                        <video [src]="vid" controls preload="metadata" class="w-full h-full object-contain"></video>
                      </div>
                    }
                  </div>
                } @else {
                  <div class="p-8 text-center border-2 border-dashed border-gray-250 dark:border-gray-800 rounded-xl">
                    <p class="text-xs text-gray-400">No introduction videos uploaded for this model yet.</p>
                  </div>
                }
              </div>
            </div>
          </div>
        }
      </app-modal>

      <!-- Lightbox Modal -->
      <app-modal [isOpen]="!!activeLightboxImage" (close)="activeLightboxImage = null">
        <div class="p-2 relative flex items-center justify-center max-h-[90vh]">
          <button (click)="activeLightboxImage = null" class="absolute top-4 right-4 bg-black/60 hover:bg-black/85 text-white p-2.5 rounded-full z-50">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
          <img *ngIf="activeLightboxImage" [src]="activeLightboxImage" class="max-w-full max-h-[80vh] rounded-lg object-contain shadow-2xl">
        </div>
      </app-modal>

      <!-- Edit / Add Modal Form -->
      <app-modal [isOpen]="isFormOpen" (close)="isFormOpen = false">
        <div class="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          <h3 class="text-lg font-bold text-gray-800 dark:text-white">
            {{ editMode ? 'Edit Model Profile' : 'Add Model Profile' }}
          </h3>
          <form (submit)="submitForm()" class="grid grid-cols-2 gap-4">
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Full Name *</label>
              <input type="text" [(ngModel)]="formData.name" name="name" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Vendor (Agency)</label>
              <select [(ngModel)]="formData.vendorId" name="vendorId" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white dark:bg-gray-900">
                <option value="">Direct (No Vendor)</option>
                @for (v of vendors; track v.id) {
                  <option [value]="v.id">{{ v.companyName }}</option>
                }
              </select>
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Email *</label>
              <input type="email" [(ngModel)]="formData.email" name="email" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Mobile *</label>
              <input type="text" [(ngModel)]="formData.mobile" name="mobile" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Gender *</label>
              <select [(ngModel)]="formData.gender" name="gender" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white dark:bg-gray-900">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Age *</label>
              <input type="number" [(ngModel)]="formData.age" name="age" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Height (cm) *</label>
              <input type="number" [(ngModel)]="formData.height" name="height" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Hair Color</label>
              <input type="text" [(ngModel)]="formData.hairColor" name="hairColor" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Skin Tone</label>
              <input type="text" [(ngModel)]="formData.skinTone" name="skinTone" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Nationality *</label>
              <input type="text" [(ngModel)]="formData.nationality" name="nationality" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">City *</label>
              <input type="text" [(ngModel)]="formData.city" name="city" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Experience (Years)</label>
              <input type="number" [(ngModel)]="formData.experienceYears" name="experienceYears" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Day Rate (₹) *</label>
              <input type="number" [(ngModel)]="formData.dayRate" name="dayRate" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Instagram ID</label>
              <input type="text" [(ngModel)]="formData.instagram" name="instagram" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Model Status</label>
              <select [(ngModel)]="formData.status" name="status" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white dark:bg-gray-900">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Available">Available</option>
                <option value="Booked">Booked</option>
              </select>
            </div>

            <!-- Categories Checklist -->
            <div class="col-span-2">
              <label class="block mb-1 text-xs font-semibold text-gray-500 uppercase">Model Categories</label>
              <div class="flex flex-wrap gap-3 p-3 bg-gray-50 dark:bg-gray-850 rounded-lg border border-gray-200 dark:border-gray-700">
                @for (c of masters?.modelCategories; track c.id) {
                  <div class="flex items-center gap-1.5">
                    <input type="checkbox" [id]="'cat_'+c.id" [checked]="isCategorySelected(c.id)" (change)="toggleCategory(c.id)" class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500">
                    <label [for]="'cat_'+c.id" class="text-xs text-gray-700 dark:text-gray-300">{{ c.name }}</label>
                  </div>
                }
              </div>
            </div>

            <!-- Bank account sub-form -->
            <div class="col-span-2 border-t border-gray-100 dark:border-gray-800 pt-3">
              <h5 class="text-xs font-bold text-gray-400 uppercase mb-2">Settlement Account Details</h5>
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Bank Name</label>
              <input type="text" [(ngModel)]="formData.bankDetails!.bankName" name="bankName" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Account Holder</label>
              <input type="text" [(ngModel)]="formData.bankDetails!.accountName" name="accountName" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Account Number</label>
              <input type="text" [(ngModel)]="formData.bankDetails!.accountNumber" name="accountNumber" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">IFSC Code</label>
              <input type="text" [(ngModel)]="formData.bankDetails!.ifsc" name="ifsc" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Branch Name</label>
              <input type="text" [(ngModel)]="formData.bankDetails!.branch" name="branch" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">UPI ID</label>
              <input type="text" [(ngModel)]="formData.bankDetails!.upiId" name="upiId" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white">
            </div>

            <!-- Portfolio Media Section in Form -->
            <div class="col-span-2 border-t border-gray-100 dark:border-gray-800 pt-4 mt-2">
              <h5 class="text-xs font-bold text-gray-400 uppercase mb-2">Portfolio Photos & Videos</h5>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Image upload and list -->
                <div class="p-4 bg-gray-50 dark:bg-gray-850 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
                  <div class="flex items-center justify-between">
                    <label class="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">Portfolio Images</label>
                    <span class="text-[10px] text-gray-400">{{ formData.portfolioImages?.length || 0 }} uploaded</span>
                  </div>
                  <div class="flex gap-2">
                    <input type="file" #imageInput multiple accept="image/*" (change)="onImagesSelected($event)" class="hidden">
                    <button type="button" (click)="imageInput.click()" class="flex-1 px-3 py-2 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 text-xs font-semibold rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition text-center">
                      📸 Choose Images
                    </button>
                    <input type="text" placeholder="Or paste image URL" #imageUrlInput (keydown.enter)="$event.preventDefault(); addImageUrl(imageUrlInput.value); imageUrlInput.value=''" class="w-1/2 px-3 py-2 border border-gray-300 bg-transparent rounded-lg text-xs dark:border-gray-700 dark:text-white placeholder:text-gray-400 focus:outline-none">
                  </div>
                  <!-- Preview list of images with remove option -->
                  @if (formData.portfolioImages && formData.portfolioImages.length > 0) {
                    <div class="grid grid-cols-4 gap-2 pt-2 max-h-36 overflow-y-auto">
                      @for (img of formData.portfolioImages; track $index) {
                        <div class="relative rounded-lg overflow-hidden aspect-square border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 group/thumb">
                          <img [src]="img" class="w-full h-full object-cover" alt="Thumb">
                          <button type="button" (click)="removeImage($index)" class="absolute top-1 right-1 p-0.5 bg-red-600 text-white rounded-full hover:bg-red-700 opacity-0 group-hover/thumb:opacity-100 transition z-10 shadow">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                          </button>
                        </div>
                      }
                    </div>
                  } @else {
                    <p class="text-[11px] text-gray-400 text-center py-4">No images uploaded yet.</p>
                  }
                </div>

                <!-- Video upload and list -->
                <div class="p-4 bg-gray-50 dark:bg-gray-850 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
                  <div class="flex items-center justify-between">
                    <label class="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">Portfolio Videos</label>
                    <span class="text-[10px] text-gray-400">{{ formData.portfolioVideos?.length || 0 }} uploaded</span>
                  </div>
                  <div class="flex gap-2">
                    <input type="file" #videoInput multiple accept="video/*" (change)="onVideosSelected($event)" class="hidden">
                    <button type="button" (click)="videoInput.click()" class="flex-1 px-3 py-2 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 text-xs font-semibold rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition text-center">
                      🎥 Choose Videos
                    </button>
                    <input type="text" placeholder="Or paste video URL" #videoUrlInput (keydown.enter)="$event.preventDefault(); addVideoUrl(videoUrlInput.value); videoUrlInput.value=''" class="w-1/2 px-3 py-2 border border-gray-300 bg-transparent rounded-lg text-xs dark:border-gray-700 dark:text-white placeholder:text-gray-400 focus:outline-none">
                  </div>
                  <!-- Preview list of videos with remove option -->
                  @if (formData.portfolioVideos && formData.portfolioVideos.length > 0) {
                    <div class="space-y-1.5 pt-2 max-h-36 overflow-y-auto">
                      @for (vid of formData.portfolioVideos; track $index) {
                        <div class="flex items-center justify-between p-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                          <span class="text-[10px] truncate max-w-[80%] text-gray-600 dark:text-gray-300">{{ vid.startsWith('data:') ? 'Local Uploaded Video' : vid }}</span>
                          <button type="button" (click)="removeVideo($index)" class="p-1 text-red-500 hover:text-red-700 rounded transition">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                          </button>
                        </div>
                      }
                    </div>
                  } @else {
                    <p class="text-[11px] text-gray-400 text-center py-4">No videos uploaded yet.</p>
                  }
                </div>
              </div>
            </div>

            <div class="flex justify-end gap-3 col-span-2 mt-4 border-t border-gray-100 dark:border-gray-800 pt-4">
              <button type="button" (click)="isFormOpen = false" class="px-4 py-2 text-sm font-medium text-gray-500 border rounded-lg hover:bg-gray-50">Cancel</button>
              <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Save Profile</button>
            </div>
          </form>
        </div>
      </app-modal>

      <!-- Excel Import Simulator Modal -->
      <app-modal [isOpen]="isImportOpen" (close)="isImportOpen = false">
        <div class="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          <h3 class="text-lg font-bold text-gray-800 dark:text-white">Excel Bulk Import Simulator</h3>
          <p class="text-xs text-gray-500">Paste model data in CSV or JSON format to simulate bulk Excel uploads. System validates fields and checks for duplicate mobile or email contacts.</p>

          <div class="space-y-3">
            <label class="block text-xs font-bold text-gray-400 uppercase">Mock Excel Data (JSON Array)</label>
            <textarea [(ngModel)]="importDataText" class="w-full h-44 rounded-lg border border-gray-300 bg-transparent p-3 font-mono text-xs dark:border-gray-700 dark:text-white focus:outline-none" placeholder="[ { 'name': 'Model Name', 'email': 'email@example.com', 'mobile': '9898989898', ... } ]"></textarea>
            <div class="flex justify-between">
              <button type="button" (click)="loadDemoImportData()" class="text-xs text-blue-600 hover:underline">Load Sample Import Data</button>
              <button type="button" (click)="processImport()" class="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition">Validate & Upload Excel</button>
            </div>
          </div>

          <!-- Error and Success Validation report -->
          @if (importReport) {
            <div class="p-4 bg-gray-50 dark:bg-gray-850 rounded-xl border border-gray-200 dark:border-gray-800 space-y-2">
              <h4 class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Excel Validation Report</h4>
              <div class="text-xs space-y-1">
                <p class="text-green-600 dark:text-green-400 font-semibold">✓ Successfully Imported: {{ importReport.addedCount }} records</p>
                <p class="text-red-500 font-semibold">✗ Duplicate Records Discarded: {{ importReport.duplicateCount }} records</p>
                @if (importReport.errors.length > 0) {
                  <div class="mt-2 text-red-400 space-y-1">
                    <p class="font-bold">Errors Detail Log:</p>
                    @for (err of importReport.errors; track $index) {
                      <p>• {{ err }}</p>
                    }
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </app-modal>
    </div>
  `
})
export class CrmModelsComponent implements OnInit, OnDestroy {

  private sub = new Subscription();
  models: Model[] = [];
  filteredModels: Model[] = [];
  vendors: Party[] = [];
  masters: MastersData | null = null;
  searchQuery: string = '';
  viewMode: 'grid' | 'list' = 'grid';

  // Detail Profile view
  selectedModel: Model | null = null;

  activeLightboxImage: string | null = null;

  // Form states
  isFormOpen = false;
  editMode = false;
  formData: Partial<Model> = {
    bankDetails: { bankName: '', accountName: '', accountNumber: '', ifsc: '', branch: '', upiId: '' },
    categoryIds: [],
    portfolioImages: [],
    portfolioVideos: []
  };

  // Import states
  isImportOpen = false;
  importDataText: string = '';
  importReport: { addedCount: number, duplicateCount: number, errors: string[] } | null = null;

  constructor(private crmStorage: CrmStorageService) { }

  ngOnInit() {
    this.sub.add(this.crmStorage.getModels$().subscribe(list => {
      this.models = list;
      this.filterModels();
    }));
    this.sub.add(this.crmStorage.getParties$().subscribe(parties => {
      this.vendors = parties.filter(p => p.partyType === 'Vendor' || p.partyType === 'Customer + Vendor');
    }));
    this.sub.add(this.crmStorage.getMasters$().subscribe(data => this.masters = data));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  getStatusColor(status: Model['status']): 'success' | 'warning' | 'error' | 'info' {
    if (status === 'Available') return 'success';
    if (status === 'Booked') return 'error';
    if (status === 'Active') return 'info';
    return 'warning';
  }

  getVendorName(id?: string): string {
    if (!id) return 'Direct / Independent';
    const v = this.vendors.find(p => p.id === id);
    return v ? v.companyName : 'Unknown Vendor';
  }

  getCategoryLabel(catId: string): string {
    const item = this.masters?.modelCategories.find(mc => mc.id === catId);
    return item ? item.name : 'Other';
  }

  filterModels() {
    if (!this.searchQuery) {
      this.filteredModels = this.models;
      return;
    }
    const q = this.searchQuery.toLowerCase();
    this.filteredModels = this.models.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.city.toLowerCase().includes(q) ||
      m.nationality.toLowerCase().includes(q)
    );
  }

  viewProfile(model: Model) {
    this.selectedModel = model;
  }

  // Categories checklist helpers
  isCategorySelected(catId: string): boolean {
    return this.formData.categoryIds?.includes(catId) || false;
  }

  toggleCategory(catId: string) {
    this.formData.categoryIds = this.formData.categoryIds || [];
    const idx = this.formData.categoryIds.indexOf(catId);
    if (idx > -1) {
      this.formData.categoryIds.splice(idx, 1);
    } else {
      this.formData.categoryIds.push(catId);
    }
  }

  // CRUD MODALS
  openAddModal() {
    this.editMode = false;
    this.formData = {
      gender: 'Female',
      age: 22,
      height: 170,
      status: 'Available',
      categoryIds: [],
      dayRate: 25000,
      portfolioImages: [],
      portfolioVideos: [],
      bankDetails: { bankName: '', accountName: '', accountNumber: '', ifsc: '', branch: '', upiId: '' }
    };
    this.isFormOpen = true;
  }

  openEditModal(model: Model) {
    this.editMode = true;
    this.formData = JSON.parse(JSON.stringify(model));
    this.formData.bankDetails = this.formData.bankDetails || { bankName: '', accountName: '', accountNumber: '', ifsc: '', branch: '', upiId: '' };
    this.formData.categoryIds = this.formData.categoryIds || [];
    this.formData.portfolioImages = this.formData.portfolioImages || [];
    this.formData.portfolioVideos = this.formData.portfolioVideos || [];
    this.isFormOpen = true;
  }

  submitForm() {
    if (this.formData.name && this.formData.email && this.formData.mobile) {
      this.crmStorage.saveModel(this.formData as Model);
      this.isFormOpen = false;
    }
  }

  deleteModel(id: string) {
    if (confirm('Are you sure you want to remove this model profile?')) {
      this.crmStorage.deleteModel(id);
    }
  }

  // IMPORT MODELS EXCEL SIMULATION
  openImportModal() {
    this.isImportOpen = true;
    this.importDataText = '';
    this.importReport = null;
  }

  loadDemoImportData() {
    const demoArray = [
      {
        name: "Chloe Vartanian",
        email: "chloe@fashionmodels.net",
        mobile: "33698765432",
        gender: "Female",
        age: 23,
        height: 177,
        nationality: "France",
        city: "Paris",
        dayRate: 40000,
        experienceYears: 4,
        hairColor: "Blonde",
        skinTone: "Fair"
      },
      {
        name: "Aria Dubois", // Duplicate warning demo (already in seed data)
        email: "aria.dubois@models.com",
        mobile: "33612345678",
        gender: "Female",
        age: 24,
        height: 178,
        nationality: "France",
        city: "Paris",
        dayRate: 45000
      },
      {
        name: "Rohan Khanna",
        email: "rohan.khanna@models.in",
        mobile: "9988112233",
        gender: "Male",
        age: 26,
        height: 184,
        nationality: "India",
        city: "Mumbai",
        dayRate: 35000,
        experienceYears: 5
      },
      {
        name: "Invalid Model Entry", // Missing required fields demo
        email: "",
        mobile: "",
        gender: "Female",
        age: 20
      }
    ];
    this.importDataText = JSON.stringify(demoArray, null, 2);
  }

  processImport() {
    try {
      const data = JSON.parse(this.importDataText);
      if (!Array.isArray(data)) {
        alert('Please paste a valid JSON Array of objects.');
        return;
      }
      this.importReport = this.crmStorage.bulkImportModels(data);
    } catch (e) {
      alert('Error parsing JSON text. Please check the format.');
    }
  }

  onImagesSelected(event: any) {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.formData.portfolioImages = this.formData.portfolioImages || [];
          this.formData.portfolioImages.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  onVideosSelected(event: any) {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 2 * 1024 * 1024) {
          alert(`Warning: The video "${file.name}" is larger than 2MB. To prevent exceeding local storage limits, you can paste video URLs or upload smaller videos.`);
        }
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.formData.portfolioVideos = this.formData.portfolioVideos || [];
          this.formData.portfolioVideos.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  addImageUrl(url: string) {
    if (url && url.trim()) {
      this.formData.portfolioImages = this.formData.portfolioImages || [];
      this.formData.portfolioImages.push(url.trim());
    }
  }

  addVideoUrl(url: string) {
    if (url && url.trim()) {
      this.formData.portfolioVideos = this.formData.portfolioVideos || [];
      this.formData.portfolioVideos.push(url.trim());
    }
  }

  removeImage(index: number) {
    if (this.formData.portfolioImages) {
      this.formData.portfolioImages.splice(index, 1);
    }
  }

  removeVideo(index: number) {
    if (this.formData.portfolioVideos) {
      this.formData.portfolioVideos.splice(index, 1);
    }
  }
}
