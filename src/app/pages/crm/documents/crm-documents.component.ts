import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ModalComponent } from '../../../shared/components/ui/modal/modal.component';

import {
  CrmStorageService,
  DocumentRecord
} from '../../../shared/services/crm-storage.service';

@Component({
  selector: 'app-crm-documents',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageBreadcrumbComponent,
    ModalComponent,
  ],
  template: `
    <div class="space-y-6">
      <app-page-breadcrumb pageTitle="Documents Vault" />

      <!-- Top Drag and Drop Simulator Card -->
      <div class="p-8 bg-white rounded-2xl border-2 border-dashed border-gray-300 dark:bg-white/[0.03] dark:border-gray-800 text-center space-y-4 hover:border-blue-500 transition cursor-pointer relative" (click)="fileInput.click()">
        <input type="file" #fileInput (change)="onFileSimulated($event)" class="hidden">
        
        <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-600 mx-auto">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
        </div>
        <div>
          <h4 class="text-sm font-bold text-gray-800 dark:text-white">Simulate Drag & Drop Files here or Click to Browse</h4>
          <p class="text-xs text-gray-400 mt-1">Accepts agreements, GST sheets, PAN PDFs, or portfolios up to 25MB.</p>
        </div>
      </div>

      <!-- Categories Drawers Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <!-- Agreements Category Drawer -->
        <div class="p-6 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800 space-y-4 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2 mb-3">
              <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Agreements ({{ getCount('Agreement') }})</h4>
              <span class="text-lg">📄</span>
            </div>
            <div class="space-y-2 max-h-[250px] overflow-y-auto pr-1">
              @for (doc of getDocsByType('Agreement'); track doc.id) {
                <div (click)="previewDoc(doc)" class="p-2.5 bg-gray-50 dark:bg-gray-850 hover:bg-gray-100/50 rounded-xl flex justify-between items-center cursor-pointer transition text-xs">
                  <div class="truncate pr-2">
                    <span class="font-semibold text-gray-850 dark:text-gray-300 block truncate">{{ doc.fileName }}</span>
                    <span class="text-gray-400 text-[10px]">{{ doc.fileSize }} | {{ doc.uploadedAt | date:'shortDate' }}</span>
                  </div>
                  <span class="text-blue-500 font-bold text-lg">&rarr;</span>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Identity / Tax Category Drawer -->
        <div class="p-6 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800 space-y-4 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2 mb-3">
              <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Identity & GST ({{ getCount('GST') + getCount('PAN') }})</h4>
              <span class="text-lg">🆔</span>
            </div>
            <div class="space-y-2 max-h-[250px] overflow-y-auto pr-1">
              @for (doc of getIdentityDocs(); track doc.id) {
                <div (click)="previewDoc(doc)" class="p-2.5 bg-gray-50 dark:bg-gray-850 hover:bg-gray-100/50 rounded-xl flex justify-between items-center cursor-pointer transition text-xs">
                  <div class="truncate pr-2">
                    <span class="font-semibold text-gray-850 dark:text-gray-300 block truncate">{{ doc.fileName }}</span>
                    <span class="text-gray-400 text-[10px]">{{ doc.fileSize }} | {{ doc.uploadedAt | date:'shortDate' }}</span>
                  </div>
                  <span class="text-blue-500 font-bold text-lg">&rarr;</span>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Portfolios & Contracts Category Drawer -->
        <div class="p-6 bg-white rounded-2xl border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800 space-y-4 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2 mb-3">
              <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Portfolios & Contracts ({{ getCount('Portfolio') + getCount('Contract') + getCount('Other') }})</h4>
              <span class="text-lg">💼</span>
            </div>
            <div class="space-y-2 max-h-[250px] overflow-y-auto pr-1">
              @for (doc of getPortfolioContractsDocs(); track doc.id) {
                <div (click)="previewDoc(doc)" class="p-2.5 bg-gray-50 dark:bg-gray-850 hover:bg-gray-100/50 rounded-xl flex justify-between items-center cursor-pointer transition text-xs">
                  <div class="truncate pr-2">
                    <span class="font-semibold text-gray-850 dark:text-gray-300 block truncate">{{ doc.fileName }}</span>
                    <span class="text-gray-400 text-[10px]">{{ doc.fileSize }} | {{ doc.uploadedAt | date:'shortDate' }}</span>
                  </div>
                  <span class="text-blue-500 font-bold text-lg">&rarr;</span>
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Add Simulated Document Form Modal -->
      <app-modal [isOpen]="isUploadFormOpen" (close)="isUploadFormOpen = false">
        <div class="p-6 space-y-4">
          <h3 class="text-lg font-bold text-gray-800 dark:text-white">Save Uploaded Document</h3>
          <form (submit)="saveDocument()" class="space-y-4 text-xs">
            <div>
              <label class="block mb-1 font-semibold text-gray-500 uppercase">Document Name *</label>
              <input type="text" [(ngModel)]="uploadForm.fileName" name="docName" required class="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 dark:border-gray-700 dark:text-white">
            </div>
            <div>
              <label class="block mb-1 font-semibold text-gray-500 uppercase">Document Type *</label>
              <select [(ngModel)]="uploadForm.fileType" name="docType" required class="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-2 dark:border-gray-700 dark:text-white dark:bg-gray-900">
                <option value="Agreement">Agreement</option>
                <option value="GST">GST Registration</option>
                <option value="PAN">PAN Card Scan</option>
                <option value="Contract">Shoot Contract</option>
                <option value="Portfolio">Portfolio Lookbook</option>
                <option value="Other">Other Document</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block mb-1 font-semibold text-gray-500 uppercase">Simulated File Size</label>
                <input type="text" [(ngModel)]="uploadForm.fileSize" name="docSize" readonly class="h-10 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
              </div>
              <div>
                <label class="block mb-1 font-semibold text-gray-500 uppercase">File Extension</label>
                <input type="text" [(ngModel)]="formFileExtension" name="docExt" readonly class="h-10 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 dark:border-gray-700 dark:bg-gray-850 dark:text-white">
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-3 border-t border-gray-150 dark:border-gray-800">
              <button type="button" (click)="isUploadFormOpen = false" class="px-4 py-2 text-sm font-medium text-gray-500 border rounded-lg hover:bg-gray-50">Cancel</button>
              <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Save Document</button>
            </div>
          </form>
        </div>
      </app-modal>

      <!-- Document Preview Modal Drawer -->
      <app-modal [isOpen]="!!selectedDoc" (close)="selectedDoc = null">
        @if (selectedDoc) {
          <div class="p-6 space-y-4 text-xs text-gray-600 dark:text-gray-300">
            <h3 class="text-base font-bold text-gray-800 dark:text-white">Document Preview</h3>
            
            <div class="p-4 bg-gray-50 dark:bg-gray-850 rounded-xl space-y-3">
              <div class="flex items-center gap-3">
                <span class="text-3xl">📄</span>
                <div>
                  <h4 class="font-bold text-gray-800 dark:text-white text-sm truncate max-w-[200px]">{{ selectedDoc.fileName }}</h4>
                  <span class="text-gray-400 block text-[10px]">{{ selectedDoc.fileSize }} | Extension: {{ getFileExtension(selectedDoc.fileName) }}</span>
                </div>
              </div>

              <div class="pt-2 border-t border-gray-200 dark:border-gray-800 space-y-1">
                <p><span class="text-gray-400 font-medium">Type:</span> {{ selectedDoc.fileType }}</p>
                <p><span class="text-gray-400 font-medium">Uploaded At:</span> {{ selectedDoc.uploadedAt | date:'mediumDate' }}</p>
                <p><span class="text-gray-400 font-medium">Status:</span> <span class="text-green-500 font-bold">Verified</span></p>
              </div>
            </div>

            <div class="flex justify-between items-center pt-3 border-t border-gray-150 dark:border-gray-800">
              <button (click)="deleteDoc(selectedDoc.id)" class="px-3 py-2 text-red-650 hover:bg-red-50 rounded-lg font-semibold">
                Delete
              </button>
              <div class="flex gap-2">
                <button (click)="simulateDownload(selectedDoc)" class="px-3 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50">
                  📥 Download
                </button>
                <button (click)="selectedDoc = null" class="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold">
                  Done
                </button>
              </div>
            </div>
          </div>
        }
      </app-modal>
    </div>
  `
})
export class CrmDocumentsComponent implements OnInit, OnDestroy {

  private sub = new Subscription();
  documents: DocumentRecord[] = [];

  // Preview target
  selectedDoc: DocumentRecord | null = null;

  // Add document upload form state
  isUploadFormOpen = false;
  uploadForm: Partial<DocumentRecord> = {};
  formFileExtension = '';

  constructor(private crmStorage: CrmStorageService) { }

  ngOnInit() {
    this.sub.add(this.crmStorage.getDocuments$().subscribe(list => this.documents = list));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  getFileExtension(fileName: string): string {
    return fileName.split('.').pop()?.toUpperCase() || 'PDF';
  }

  getCount(type: string): number {
    return this.documents.filter(d => d.fileType === type).length;
  }

  getDocsByType(type: string): DocumentRecord[] {
    return this.documents.filter(d => d.fileType === type);
  }

  getIdentityDocs(): DocumentRecord[] {
    return this.documents.filter(d => d.fileType === 'GST' || d.fileType === 'PAN');
  }

  getPortfolioContractsDocs(): DocumentRecord[] {
    return this.documents.filter(d => d.fileType === 'Portfolio' || d.fileType === 'Contract' || d.fileType === 'Other');
  }

  // Simulated drop change
  onFileSimulated(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];

      // Load file metadata
      const rawSize = file.size;
      const sizeStr = rawSize > 1024 * 1024
        ? (rawSize / (1024 * 1024)).toFixed(1) + ' MB'
        : (rawSize / 1024).toFixed(0) + ' KB';
      const nameParts = file.name.split('.');
      const ext = nameParts[nameParts.length - 1].toUpperCase();

      this.uploadForm = {
        fileName: file.name,
        fileType: 'Agreement',
        fileSize: sizeStr
      };
      this.formFileExtension = ext;
      this.isUploadFormOpen = true;
    }
  }

  saveDocument() {
    if (this.uploadForm.fileName && this.uploadForm.fileType) {
      this.uploadForm.uploadedAt = new Date().toISOString();
      this.uploadForm.url = '#';
      this.crmStorage.saveDocument(this.uploadForm as DocumentRecord);
      this.isUploadFormOpen = false;
    }
  }

  previewDoc(doc: DocumentRecord) {
    this.selectedDoc = doc;
  }

  simulateDownload(doc: DocumentRecord) {
    alert(`File "${doc.fileName}" download simulated successfully! Check your browser downloads folder.`);
  }

  deleteDoc(id: string) {
    if (confirm('Are you sure you want to permanently delete this document from the vault?')) {
      this.crmStorage.deleteDocument(id);
      this.selectedDoc = null;
    }
  }
}
