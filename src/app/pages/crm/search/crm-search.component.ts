import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ModalComponent } from '../../../shared/components/ui/modal/modal.component';
import { BadgeComponent } from '../../../shared/components/ui/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';

import {
  CrmStorageService,
  Model,
  Party,
  MastersData,
  Quotation
} from '../../../shared/services/crm-storage.service';

@Component({
  selector: 'app-crm-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageBreadcrumbComponent,
    ModalComponent,
    BadgeComponent,
    ButtonComponent
  ],
  template: `
    <div class="space-y-6">
      <app-page-breadcrumb pageTitle="Smart Model Search Engine" />

      <!-- Main Layout: Sidebar + Results Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        <!-- Left Filter Panel -->
        <div class="p-6 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800 space-y-6 h-fit">
          <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
            <h3 class="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider">Search Filters</h3>
            <button (click)="resetFilters()" class="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">Reset</button>
          </div>

          <!-- Gender -->
          <div class="space-y-2">
            <label class="block text-xs font-bold text-gray-400 uppercase">Gender</label>
            <div class="flex gap-4">
              <label class="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                <input type="checkbox" [(ngModel)]="filters.male" (change)="applyFilters()" class="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"> Male
              </label>
              <label class="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                <input type="checkbox" [(ngModel)]="filters.female" (change)="applyFilters()" class="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"> Female
              </label>
            </div>
          </div>

          <!-- Age Range -->
          <div class="space-y-2">
            <label class="block text-xs font-bold text-gray-400 uppercase">Age Range</label>
            <div class="flex items-center gap-2">
              <input type="number" [(ngModel)]="filters.ageMin" (input)="applyFilters()" placeholder="Min" class="w-1/2 h-9 px-2 rounded-lg border border-gray-300 bg-transparent text-xs dark:border-gray-700 dark:text-white">
              <span class="text-gray-400 text-xs">-</span>
              <input type="number" [(ngModel)]="filters.ageMax" (input)="applyFilters()" placeholder="Max" class="w-1/2 h-9 px-2 rounded-lg border border-gray-300 bg-transparent text-xs dark:border-gray-700 dark:text-white">
            </div>
          </div>

          <!-- Height Range -->
          <div class="space-y-2">
            <label class="block text-xs font-bold text-gray-400 uppercase">Height (cm)</label>
            <div class="flex items-center gap-2">
              <input type="number" [(ngModel)]="filters.heightMin" (input)="applyFilters()" placeholder="Min" class="w-1/2 h-9 px-2 rounded-lg border border-gray-300 bg-transparent text-xs dark:border-gray-700 dark:text-white">
              <span class="text-gray-400 text-xs">-</span>
              <input type="number" [(ngModel)]="filters.heightMax" (input)="applyFilters()" placeholder="Max" class="w-1/2 h-9 px-2 rounded-lg border border-gray-300 bg-transparent text-xs dark:border-gray-700 dark:text-white">
            </div>
          </div>

          <!-- Day Rate (Budget) -->
          <div class="space-y-2">
            <label class="block text-xs font-bold text-gray-400 uppercase">Max Day Rate (₹)</label>
            <input type="number" [(ngModel)]="filters.maxDayRate" (input)="applyFilters()" placeholder="e.g. 50000" class="w-full h-9 px-2 rounded-lg border border-gray-300 bg-transparent text-xs dark:border-gray-700 dark:text-white">
          </div>

          <!-- Category -->
          <div class="space-y-2">
            <label class="block text-xs font-bold text-gray-400 uppercase">Model Category</label>
            <select [(ngModel)]="filters.category" (change)="applyFilters()" class="w-full h-9 px-2 rounded-lg border border-gray-300 bg-transparent text-xs dark:border-gray-700 dark:text-white dark:bg-gray-900">
              <option value="">All Categories</option>
              @for (cat of masters?.modelCategories; track cat.id) {
                <option [value]="cat.id">{{ cat.name }}</option>
              }
            </select>
          </div>

          <!-- Hair & Skin -->
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Hair</label>
              <input type="text" [(ngModel)]="filters.hair" (input)="applyFilters()" placeholder="e.g. Blonde" class="w-full h-9 px-2 rounded-lg border border-gray-300 bg-transparent text-xs dark:border-gray-700 dark:text-white">
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Skin Tone</label>
              <input type="text" [(ngModel)]="filters.skin" (input)="applyFilters()" placeholder="e.g. Fair" class="w-full h-9 px-2 rounded-lg border border-gray-300 bg-transparent text-xs dark:border-gray-700 dark:text-white">
            </div>
          </div>

          <!-- City & Nationality -->
          <div class="space-y-2">
            <label class="block text-xs font-bold text-gray-400 uppercase">Location & Origin</label>
            <input type="text" [(ngModel)]="filters.city" (input)="applyFilters()" placeholder="City" class="w-full h-9 px-2 rounded-lg border border-gray-300 bg-transparent text-xs dark:border-gray-700 dark:text-white mb-2">
            <input type="text" [(ngModel)]="filters.nationality" (input)="applyFilters()" placeholder="Nationality" class="w-full h-9 px-2 rounded-lg border border-gray-300 bg-transparent text-xs dark:border-gray-700 dark:text-white">
          </div>

          <!-- Availability -->
          <div class="space-y-2">
            <label class="block text-xs font-bold text-gray-400 uppercase">Availability Status</label>
            <select [(ngModel)]="filters.status" (change)="applyFilters()" class="w-full h-9 px-2 rounded-lg border border-gray-300 bg-transparent text-xs dark:border-gray-700 dark:text-white dark:bg-gray-900">
              <option value="">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Booked">Booked</option>
              <option value="Active">Active</option>
            </select>
          </div>
        </div>

        <!-- Right Results Panel -->
        <div class="lg:col-span-3 space-y-4">
          <!-- Top Results Bar -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800">
            <span class="text-sm font-semibold text-gray-500 dark:text-gray-400">Found {{ results.length }} Matching Models</span>
            
            <div class="flex items-center gap-3">
              <!-- Bulk Select Summary / Checkout -->
              @if (selectedModelIds.size > 0) {
                <div class="flex items-center gap-2 p-1 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-lg text-xs">
                  <span class="font-semibold text-blue-600 dark:text-blue-400 px-2">{{ selectedModelIds.size }} Selected</span>
                  <button (click)="openBulkShortlist()" class="px-3 py-1.5 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition font-medium">Create Shortlist</button>
                  <button (click)="clearBulkSelection()" class="text-gray-400 hover:text-red-500 px-1 font-bold">×</button>
                </div>
              }

              <!-- Grid/List Switch -->
              <div class="flex items-center gap-0.5 rounded-lg bg-gray-100 dark:bg-gray-900 p-0.5 text-xs">
                <button
                  (click)="viewMode = 'grid'"
                  [ngClass]="viewMode === 'grid' ? 'shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800 font-semibold' : 'text-gray-500 dark:text-gray-400'"
                  class="px-3 py-1.5 rounded-md transition hover:text-gray-900 dark:hover:text-white"
                >
                  Grid
                </button>
                <button
                  (click)="viewMode = 'list'"
                  [ngClass]="viewMode === 'list' ? 'shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800 font-semibold' : 'text-gray-500 dark:text-gray-400'"
                  class="px-3 py-1.5 rounded-md transition hover:text-gray-900 dark:hover:text-white"
                >
                  List
                </button>
              </div>
            </div>
          </div>

          <!-- Cards View -->
          @if (viewMode === 'grid') {
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              @for (model of results; track model.id) {
                <div class="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:shadow-lg transition cursor-pointer flex flex-col group relative" (click)="setQuickPreview(model)">
                  <!-- Checkbox Overlay for Bulk Select -->
                  <div class="absolute top-3 left-3 z-10" (click)="$event.stopPropagation()">
                    <input type="checkbox" [checked]="selectedModelIds.has(model.id)" (change)="toggleBulkSelect(model.id)" class="w-5 h-5 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer">
                  </div>

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
                      <h4 class="text-base font-bold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">{{ model.name }}</h4>
                      <p class="text-xs text-gray-400 mt-0.5">{{ model.gender }} | {{ model.age }} Yrs | {{ model.height }} cm</p>
                      <p class="text-xs text-gray-500 mt-2 font-medium">📍 {{ model.city }} ({{ model.nationality }})</p>
                      <div class="flex flex-wrap gap-1 mt-2">
                        @for (catId of model.categoryIds.slice(0, 2); track catId) {
                          <span class="text-[9px] bg-gray-100 dark:bg-gray-850 text-gray-500 px-1.5 py-0.5 rounded">{{ getCategoryLabel(catId) }}</span>
                        }
                      </div>
                    </div>
                    <div class="border-t border-gray-100 dark:border-gray-800 mt-3 pt-3 flex items-center justify-between">
                      <span class="text-xs text-gray-400">Day Rate</span>
                      <span class="text-sm font-bold text-gray-800 dark:text-white">₹{{ model.dayRate | number }}</span>
                    </div>
                  </div>
                </div>
              } @empty {
                <div class="text-center py-16 col-span-3 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl">
                  <p class="text-sm text-gray-400">No models match the filters.</p>
                </div>
              }
            </div>
          } @else {
            <!-- List View Table -->
            <div class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
              <div class="max-w-full overflow-x-auto">
                <table class="min-w-full">
                  <thead class="border-b border-gray-100 dark:border-white/[0.05]">
                    <tr class="bg-gray-50 dark:bg-gray-850">
                      <th class="px-5 py-3 text-start w-10">
                        <input type="checkbox" [checked]="isAllResultsSelected()" (change)="toggleAllResults()" class="w-4.5 h-4.5 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer">
                      </th>
                      <th class="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400">Model</th>
                      <th class="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400">Physical stats</th>
                      <th class="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400">Day Rate</th>
                      <th class="px-5 py-3 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400">Availability</th>
                      <th class="px-5 py-3 font-semibold text-gray-500 text-center text-theme-xs dark:text-gray-400">Preview</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    @for (model of results; track model.id) {
                      <tr class="hover:bg-gray-50/50 dark:hover:bg-gray-850/50 transition cursor-pointer" (click)="setQuickPreview(model)">
                        <td class="px-5 py-4 text-start" (click)="$event.stopPropagation()">
                          <input type="checkbox" [checked]="selectedModelIds.has(model.id)" (change)="toggleBulkSelect(model.id)" class="w-4.5 h-4.5 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer">
                        </td>
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
                              <span class="font-semibold text-gray-800 dark:text-white/90 block hover:text-blue-600 transition">{{ model.name }}</span>
                              <span class="block text-xs text-gray-400 mt-0.5">📍 {{ model.city }} ({{ model.nationality }})</span>
                            </div>
                          </div>
                        </td>
                        <td class="px-5 py-4 text-xs text-gray-600 dark:text-gray-300">
                          {{ model.gender }} | {{ model.age }} Yrs | {{ model.height }} cm | Hair: {{ model.hairColor || '-' }} | Skin: {{ model.skinTone || '-' }}
                        </td>
                        <td class="px-5 py-4 text-sm font-bold text-gray-800 dark:text-white">
                          ₹{{ model.dayRate | number }}
                        </td>
                        <td class="px-5 py-4">
                          <app-badge size="sm" [color]="getStatusColor(model.status)">{{ model.status }}</app-badge>
                        </td>
                        <td class="px-5 py-4 text-center" (click)="$event.stopPropagation()">
                          <button (click)="setQuickPreview(model)" class="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">Quick view</button>
                        </td>
                      </tr>
                    } @empty {
                      <tr><td colspan="6" class="px-5 py-8 text-center text-gray-400 text-sm">No models match the filter.</td></tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Quick Preview side-panel drawer Overlay -->
      @if (previewModel) {
        <div class="fixed inset-y-0 right-0 w-full sm:w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-2xl z-99999 flex flex-col justify-between p-6">
          <div class="space-y-6 overflow-y-auto pr-1">
            <!-- Header -->
            <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 class="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider">Quick Preview</h3>
              <button (click)="previewModel = null" class="text-gray-400 hover:text-gray-700 dark:hover:text-white text-xl font-bold">×</button>
            </div>

            <!-- Profile Banner -->
            <div class="h-64 bg-gray-100 dark:bg-gray-800 relative overflow-hidden rounded-xl group/preview">
              @if (previewModel.portfolioImages && previewModel.portfolioImages.length > 0) {
                <img [src]="previewModel.portfolioImages[0]" class="w-full h-full object-cover" alt="{{ previewModel.name }}">
              } @else {
                <div class="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center font-bold text-6xl text-blue-600 dark:text-blue-400 opacity-80">
                  {{ previewModel.name[0] }}
                </div>
              }
              <span class="absolute bottom-3 right-3 z-10">
                <app-badge size="sm" [color]="getStatusColor(previewModel.status)">{{ previewModel.status }}</app-badge>
              </span>
            </div>

            <!-- Stats -->
            <div>
              <h4 class="text-lg font-bold text-gray-800 dark:text-white">{{ previewModel.name }}</h4>
              <p class="text-xs text-gray-400">&#64;{{ previewModel.instagram || 'no_instagram' }}</p>
            </div>

            <div class="grid grid-cols-2 gap-4 text-xs">
              <div class="p-2 bg-gray-50 dark:bg-gray-850 rounded-lg">
                <span class="text-gray-400 block">Height</span>
                <span class="font-bold text-gray-800 dark:text-white">{{ previewModel.height }} cm</span>
              </div>
              <div class="p-2 bg-gray-50 dark:bg-gray-850 rounded-lg">
                <span class="text-gray-400 block">Age</span>
                <span class="font-bold text-gray-800 dark:text-white">{{ previewModel.age }} Years</span>
              </div>
              <div class="p-2 bg-gray-50 dark:bg-gray-850 rounded-lg">
                <span class="text-gray-400 block">Hair Color</span>
                <span class="font-bold text-gray-800 dark:text-white">{{ previewModel.hairColor || '-' }}</span>
              </div>
              <div class="p-2 bg-gray-50 dark:bg-gray-850 rounded-lg">
                <span class="text-gray-400 block">Skin Tone</span>
                <span class="font-bold text-gray-800 dark:text-white">{{ previewModel.skinTone || '-' }}</span>
              </div>
              <div class="p-2 bg-gray-50 dark:bg-gray-850 rounded-lg">
                <span class="text-gray-400 block">City</span>
                <span class="font-bold text-gray-800 dark:text-white">{{ previewModel.city }}</span>
              </div>
              <div class="p-2 bg-gray-50 dark:bg-gray-850 rounded-lg">
                <span class="text-gray-400 block">Nationality</span>
                <span class="font-bold text-gray-800 dark:text-white">{{ previewModel.nationality }}</span>
              </div>
            </div>

            <div class="space-y-2 text-xs">
              <p><span class="text-gray-400 font-medium">Category Map:</span>
                @for (cId of previewModel.categoryIds; track cId) {
                  <span class="inline-block bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded mr-1 mt-1">{{ getCategoryLabel(cId) }}</span>
                }
              </p>
              <p><span class="text-gray-400 font-medium">Agency Vendor:</span> {{ getVendorName(previewModel.vendorId) }}</p>
              <p><span class="text-gray-400 font-medium">Day Rate:</span> <span class="text-sm font-bold text-gray-800 dark:text-white">₹{{ previewModel.dayRate | number }}</span></p>
            </div>

            <!-- Media Showcase -->
            <div class="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <h5 class="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider">Portfolio Preview</h5>
              
              <!-- Images -->
              <div class="space-y-2">
                <span class="text-[10px] font-bold text-gray-500 uppercase">Photos ({{ previewModel.portfolioImages.length }})</span>
                @if (previewModel.portfolioImages && previewModel.portfolioImages.length > 0) {
                  <div class="grid grid-cols-3 gap-2">
                    @for (img of previewModel.portfolioImages; track $index) {
                      <div class="relative rounded-lg overflow-hidden aspect-[3/4] bg-gray-150 border border-gray-200 dark:border-gray-800 cursor-zoom-in" (click)="activeLightboxImage = img">
                        <img [src]="img" class="w-full h-full object-cover hover:scale-105 transition duration-300" alt="Preview Image">
                      </div>
                    }
                  </div>
                } @else {
                  <p class="text-[10px] text-gray-400 italic">No photos available.</p>
                }
              </div>

              <!-- Videos -->
              <div class="space-y-2">
                <span class="text-[10px] font-bold text-gray-500 uppercase">Videos ({{ previewModel.portfolioVideos.length }})</span>
                @if (previewModel.portfolioVideos && previewModel.portfolioVideos.length > 0) {
                  <div class="space-y-2">
                    @for (vid of previewModel.portfolioVideos; track $index) {
                      <div class="rounded-lg overflow-hidden border border-gray-250 dark:border-gray-800 bg-black aspect-video relative">
                        <video [src]="vid" controls preload="metadata" class="w-full h-full object-contain"></video>
                      </div>
                    }
                  </div>
                } @else {
                  <p class="text-[10px] text-gray-400 italic">No videos available.</p>
                }
              </div>
            </div>
          </div>

          <div class="border-t border-gray-100 dark:border-gray-800 pt-4 flex gap-2">
            <div class="flex-1">
              <app-button variant="outline" size="sm" className="w-full" (btnClick)="toggleBulkSelect(previewModel.id)">
                {{ selectedModelIds.has(previewModel.id) ? 'Deselect Model' : 'Select Model' }}
              </app-button>
            </div>
            <div class="flex-1">
              <app-button variant="primary" size="sm" className="w-full" (btnClick)="previewModel = null">Done</app-button>
            </div>
          </div>
        </div>
      }

      <!-- Lightbox Modal -->
      <app-modal [isOpen]="!!activeLightboxImage" (close)="activeLightboxImage = null">
        <div class="p-2 relative flex items-center justify-center max-h-[90vh]">
          <button (click)="activeLightboxImage = null" class="absolute top-4 right-4 bg-black/60 hover:bg-black/85 text-white p-2.5 rounded-full z-50">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
          <img *ngIf="activeLightboxImage" [src]="activeLightboxImage" class="max-w-full max-h-[80vh] rounded-lg object-contain shadow-2xl">
        </div>
      </app-modal>

      <!-- Bulk Actions / Shortlist Modal -->
      <app-modal [isOpen]="isShortlistOpen" (close)="isShortlistOpen = false">
        <div class="p-6 space-y-4">
          <h3 class="text-lg font-bold text-gray-800 dark:text-white">Create Selection Shortlist</h3>
          <p class="text-xs text-gray-500">You have selected {{ selectedModelIds.size }} models. Select client & brand to add them as holds/selections in quotations or send direct reminders.</p>
          
          <div class="space-y-3">
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Target Client *</label>
              <select [(ngModel)]="shortlistClient" class="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-xs dark:border-gray-700 dark:text-white dark:bg-gray-900">
                @for (c of clients; track c.id) {
                  <option [value]="c.id">{{ c.companyName }}</option>
                }
              </select>
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-gray-500 uppercase">Brand *</label>
              <select [(ngModel)]="shortlistBrand" class="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-xs dark:border-gray-700 dark:text-white dark:bg-gray-900">
                @for (b of masters?.brands; track b.id) {
                  <option [value]="b.id">{{ b.name }}</option>
                }
              </select>
            </div>
            <div class="p-3 bg-gray-50 dark:bg-gray-850 rounded-lg text-xs space-y-1">
              <p class="font-bold text-gray-400">Shortlisted Models:</p>
              @for (mId of getSelectedModelNamesList(); track mId) {
                <p>• {{ mId }}</p>
              }
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <button type="button" (click)="isShortlistOpen = false" class="px-4 py-2 text-sm font-medium text-gray-500 border rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="button" (click)="confirmBulkShortlist()" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Add to Quotation</button>
          </div>
        </div>
      </app-modal>
    </div>
  `
})
export class CrmSearchComponent implements OnInit, OnDestroy {

  private sub = new Subscription();
  models: Model[] = [];
  results: Model[] = [];
  vendors: Party[] = [];
  clients: Party[] = [];
  masters: MastersData | null = null;

  // View state
  viewMode: 'grid' | 'list' = 'grid';
  selectedModelIds = new Set<string>();

  // Filter configuration
  filters = {
    male: false,
    female: false,
    ageMin: null as number | null,
    ageMax: null as number | null,
    heightMin: null as number | null,
    heightMax: null as number | null,
    maxDayRate: null as number | null,
    category: '',
    hair: '',
    skin: '',
    city: '',
    nationality: '',
    status: ''
  };

  // Preview Drawer
  previewModel: Model | null = null;
  activeLightboxImage: string | null = null;

  // Shortlist Modal
  isShortlistOpen = false;
  shortlistClient: string = '';
  shortlistBrand: string = '';

  constructor(private crmStorage: CrmStorageService) { }

  ngOnInit() {
    this.sub.add(this.crmStorage.getModels$().subscribe(list => {
      this.models = list;
      this.applyFilters();
    }));
    this.sub.add(this.crmStorage.getParties$().subscribe(parties => {
      this.vendors = parties.filter(p => p.partyType === 'Vendor' || p.partyType === 'Customer + Vendor');
      this.clients = parties.filter(p => p.partyType === 'Customer' || p.partyType === 'Customer + Vendor');
      this.shortlistClient = this.clients[0]?.id || '';
    }));
    this.sub.add(this.crmStorage.getMasters$().subscribe(data => {
      this.masters = data;
      this.shortlistBrand = data?.brands[0]?.id || '';
    }));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  getStatusColor(status: Model['status']): 'success' | 'warning' | 'error' | 'primary' {
    if (status === 'Available') return 'success';
    if (status === 'Booked') return 'error';
    if (status === 'Active') return 'primary';
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

  resetFilters() {
    this.filters = {
      male: false,
      female: false,
      ageMin: null,
      ageMax: null,
      heightMin: null,
      heightMax: null,
      maxDayRate: null,
      category: '',
      hair: '',
      skin: '',
      city: '',
      nationality: '',
      status: ''
    };
    this.applyFilters();
  }

  applyFilters() {
    this.results = this.models.filter(m => {
      // Gender
      if (this.filters.male && !this.filters.female && m.gender !== 'Male') return false;
      if (this.filters.female && !this.filters.male && m.gender !== 'Female') return false;

      // Age
      if (this.filters.ageMin !== null && m.age < this.filters.ageMin) return false;
      if (this.filters.ageMax !== null && m.age > this.filters.ageMax) return false;

      // Height
      if (this.filters.heightMin !== null && m.height < this.filters.heightMin) return false;
      if (this.filters.heightMax !== null && m.height > this.filters.heightMax) return false;

      // Day Rate
      if (this.filters.maxDayRate !== null && m.dayRate > this.filters.maxDayRate) return false;

      // Category
      if (this.filters.category && !m.categoryIds.includes(this.filters.category)) return false;

      // Hair & Skin
      if (this.filters.hair && (!m.hairColor || !m.hairColor.toLowerCase().includes(this.filters.hair.toLowerCase()))) return false;
      if (this.filters.skin && (!m.skinTone || !m.skinTone.toLowerCase().includes(this.filters.skin.toLowerCase()))) return false;

      // Location & Origin
      if (this.filters.city && (!m.city || !m.city.toLowerCase().includes(this.filters.city.toLowerCase()))) return false;
      if (this.filters.nationality && (!m.nationality || !m.nationality.toLowerCase().includes(this.filters.nationality.toLowerCase()))) return false;

      // Availability Status
      if (this.filters.status && m.status !== this.filters.status) return false;

      return true;
    });
  }

  // Bulk Selection
  toggleBulkSelect(id: string) {
    if (this.selectedModelIds.has(id)) {
      this.selectedModelIds.delete(id);
    } else {
      this.selectedModelIds.add(id);
    }
  }

  isAllResultsSelected(): boolean {
    return this.results.length > 0 && this.results.every(m => this.selectedModelIds.has(m.id));
  }

  toggleAllResults() {
    if (this.isAllResultsSelected()) {
      this.results.forEach(m => this.selectedModelIds.delete(m.id));
    } else {
      this.results.forEach(m => this.selectedModelIds.add(m.id));
    }
  }

  clearBulkSelection() {
    this.selectedModelIds.clear();
  }

  // Quick preview Drawer
  setQuickPreview(model: Model) {
    this.previewModel = model;
  }

  // Shortlist Modal Actions
  openBulkShortlist() {
    this.isShortlistOpen = true;
  }

  getSelectedModelNamesList(): string[] {
    return this.models.filter(m => this.selectedModelIds.has(m.id)).map(m => m.name);
  }

  confirmBulkShortlist() {
    if (!this.shortlistClient) {
      alert('Please select a client.');
      return;
    }

    // Auto-generate Quotation with selected models
    const selectedModels: any[] = [];
    this.selectedModelIds.forEach(id => {
      const model = this.models.find(m => m.id === id);
      if (model) {
        selectedModels.push({
          modelId: id,
          sellingPrice: model.dayRate * 1.2, // add 20% default markup
          remarks: 'Shortlisted via Smart Search',
          status: 'Hold'
        });
      }
    });

    const newQuotation: Quotation = {
      id: '',
      quotationNo: '',
      date: new Date().toISOString().split('T')[0],
      customerId: this.shortlistClient,
      brandId: this.shortlistBrand,
      categoryId: this.masters?.categories[0]?.id || '',
      validityDays: 15,
      terms: 'Standard agency terms: 50% advance payment.',
      enableGst: true,
      gstRate: 18,
      taxAmount: 0,
      grandTotal: 0,
      models: selectedModels,
      status: 'Sent',
      followUps: [],
      createdAt: ''
    };

    this.crmStorage.saveQuotation(newQuotation);
    this.selectedModelIds.clear();
    this.isShortlistOpen = false;
    alert('Quotation generated successfully with shortlisted models!');
  }
}
