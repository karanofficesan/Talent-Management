import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// Interfaces mapping to the crm_design_system
export interface MasterItem {
  id: string;
  name: string;
}

export interface GstRateItem {
  id: string;
  name: string;
  rate: number;
}

export interface MastersData {
  brands: MasterItem[];
  categories: MasterItem[];
  modelCategories: MasterItem[];
  cities: MasterItem[];
  countries: MasterItem[];
  states: MasterItem[];
  paymentTerms: MasterItem[];
  gstRates: GstRateItem[];
  coordinators: MasterItem[];
  shootTypes: MasterItem[];
}

export type PartyType = 'Customer' | 'Vendor' | 'Customer + Vendor';

export interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  ifsc: string;
  branch: string;
  swiftCode?: string;
  upiId?: string;
}

export interface Party {
  id: string;
  companyName: string;
  contactPerson: string;
  mobile: string;
  email: string;
  website?: string;
  gstNumber?: string;
  pan?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  partyType: PartyType;
  paymentDueDays: number;
  creditLimit: number;
  currency: string;
  bankDetails: BankDetails;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface Model {
  id: string;
  name: string;
  vendorId?: string; // linked vendor
  email: string;
  mobile: string;
  gender: 'Male' | 'Female' | 'Other';
  age: number;
  height: number; // in cm
  hairColor: string;
  skinTone: string;
  nationality: string;
  city: string;
  experienceYears: number;
  instagram?: string;
  status: 'Active' | 'Inactive' | 'Available' | 'Booked';
  categoryIds: string[];
  portfolioImages: string[];
  portfolioVideos: string[];
  dayRate: number;
  bankDetails: BankDetails;
  createdAt: string;
}

export interface FollowUp {
  id: string;
  date: string;
  nextFollowUpDate: string;
  discussion: string;
  status: string;
  reminder: boolean;
}

export interface Requirement {
  id: string;
  clientId: string;
  brandId: string;
  categoryId: string;
  project: string;
  shootDate: string;
  location: string;
  gender: 'Male' | 'Female' | 'Other' | 'All';
  ageMin: number;
  ageMax: number;
  heightMin: number;
  heightMax: number;
  budget: number;
  nationality: string;
  experienceYears: number;
  noOfModels: number;
  requirements: string;
  remarks?: string;
  status: 'Open' | 'Closed' | 'In Progress';
  followUps: FollowUp[];
  createdAt: string;
}

export interface QuotationModel {
  modelId: string;
  sellingPrice: number;
  remarks?: string;
  status: 'Selected' | 'Rejected' | 'Hold';
}

export interface Quotation {
  id: string;
  quotationNo: string;
  date: string;
  customerId: string;
  brandId: string;
  categoryId: string;
  requirementId?: string;
  validityDays: number;
  terms: string;
  enableGst: boolean;
  gstRate: number;
  taxAmount: number;
  grandTotal: number;
  models: QuotationModel[];
  status: 'Sent' | 'Approved' | 'Rejected';
  followUps: FollowUp[];
  createdAt: string;
}

export interface Booking {
  id: string;
  bookingNo: string;
  customerId: string;
  brandId: string;
  categoryId: string;
  modelIds: string[];
  venue: string;
  shootDate: string;
  shootTime: string;
  coordinatorId: string;
  sellingPrice: number;
  remarks?: string;
  status: 'Tentative' | 'Hold' | 'Confirmed' | 'Cancelled';
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  bookingId: string;
  date: string;
  customerId: string;
  subTotal: number;
  enableGst: boolean;
  cgst: number;
  sgst: number;
  igst: number;
  roundOff: number;
  grandTotal: number;
  status: 'Pending' | 'Paid' | 'Partial' | 'Overdue';
  amountPaid: number;
  createdAt: string;
}

export interface PaymentReceived {
  id: string;
  customerId: string;
  invoiceId: string;
  amount: number;
  tdsDeduction: number;
  reference: string;
  mode: 'Bank Transfer' | 'UPI' | 'Cheque' | 'Cash';
  remarks?: string;
  date: string;
}

export interface PaymentMade {
  id: string;
  vendorId?: string;
  modelId: string;
  amount: number;
  tdsDeduction: number;
  reference: string;
  mode: string;
  remarks?: string;
  date: string;
}

export interface DocumentRecord {
  id: string;
  fileName: string;
  fileType: string; // 'Agreement' | 'GST' | 'PAN' | 'Contract' | 'Portfolio' | 'Invoice' | 'Others'
  fileSize: string;
  uploadedAt: string;
  linkedEntityId?: string; // id of party, model, invoice etc.
  linkedEntityType?: string;
  url: string; // base64 or mock blob url
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'Booking' | 'Invoice' | 'Payment' | 'Follow-up' | 'Overdue';
  isRead: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  action: 'Create' | 'Update' | 'Delete' | 'Approve' | 'Payment' | 'Booking' | 'Login' | 'Logout';
  module: string;
  description: string;
  userIP: string;
  timestamp: string;
}

export interface CrmSettings {
  companyName: string;
  gstNumber: string;
  email: string;
  phone: string;
  address: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  ifsc: string;
  branch: string;
  quotationPrefix: string;
  bookingPrefix: string;
  invoicePrefix: string;
  whatsappGatewayToken: string;
  emailGatewayToken: string;
  paymentGatewayKey: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Admin' | 'Talent Manager' | 'Finance' | 'Viewer';
  status: 'Active' | 'Inactive';
}

@Injectable({
  providedIn: 'root'
})
export class CrmStorageService {

  // Subjects for reactive updates
  private masters$ = new BehaviorSubject<MastersData | null>(null);
  private parties$ = new BehaviorSubject<Party[]>([]);
  private models$ = new BehaviorSubject<Model[]>([]);
  private requirements$ = new BehaviorSubject<Requirement[]>([]);
  private quotations$ = new BehaviorSubject<Quotation[]>([]);
  private bookings$ = new BehaviorSubject<Booking[]>([]);
  private invoices$ = new BehaviorSubject<Invoice[]>([]);
  private paymentsReceived$ = new BehaviorSubject<PaymentReceived[]>([]);
  private paymentsMade$ = new BehaviorSubject<PaymentMade[]>([]);
  private documents$ = new BehaviorSubject<DocumentRecord[]>([]);
  private notifications$ = new BehaviorSubject<SystemNotification[]>([]);
  private activityLogs$ = new BehaviorSubject<ActivityLog[]>([]);
  private settings$ = new BehaviorSubject<CrmSettings | null>(null);
  private users$ = new BehaviorSubject<UserAccount[]>([]);
  private currentUser$ = new BehaviorSubject<UserAccount | null>(null);

  constructor() {
    this.initDatabase();
  }

  // Database Initialization with Mock Data
  private initDatabase() {
    // 1. Masters
    if (!localStorage.getItem('crm_masters')) {
      const defaultMasters: MastersData = {
        brands: [
          { id: 'b1', name: 'Nike' },
          { id: 'b2', name: 'Zara' },
          { id: 'b3', name: 'Vogue' },
          { id: 'b4', name: 'H&M' }
        ],
        categories: [
          { id: 'cat1', name: 'Fashion Shoot' },
          { id: 'cat2', name: 'Commercial Ad' },
          { id: 'cat3', name: 'Runway/Ramp' },
          { id: 'cat4', name: 'Print Catalog' }
        ],
        modelCategories: [
          { id: 'mc1', name: 'Supermodel' },
          { id: 'mc2', name: 'Commercial Model' },
          { id: 'mc3', name: 'Fitness Model' },
          { id: 'mc4', name: 'Plus Size Model' }
        ],
        cities: [
          { id: 'c1', name: 'Mumbai' },
          { id: 'c2', name: 'Delhi' },
          { id: 'c3', name: 'Paris' },
          { id: 'c4', name: 'New York' }
        ],
        countries: [
          { id: 'co1', name: 'India' },
          { id: 'co2', name: 'France' },
          { id: 'co3', name: 'United States' }
        ],
        states: [
          { id: 's1', name: 'Maharashtra' },
          { id: 's2', name: 'Delhi' },
          { id: 's3', name: 'Ile-de-France' }
        ],
        paymentTerms: [
          { id: 'pt1', name: 'Immediate (Net 0)' },
          { id: 'pt2', name: 'Net 15 Days' },
          { id: 'pt3', name: 'Net 30 Days' },
          { id: 'pt4', name: 'Net 45 Days' }
        ],
        gstRates: [
          { id: 'gr1', name: 'Exempt (0%)', rate: 0 },
          { id: 'gr2', name: 'Services (18%)', rate: 18 },
          { id: 'gr3', name: 'Luxury (28%)', rate: 28 }
        ],
        coordinators: [
          { id: 'coo1', name: 'Ananya Sharma' },
          { id: 'coo2', name: 'Vikram Mehta' }
        ],
        shootTypes: [
          { id: 'st1', name: 'Outdoor Editorial' },
          { id: 'st2', name: 'Studio Editorial' },
          { id: 'st3', name: 'Ramp Walk' },
          { id: 'st4', name: 'Video Shoot' }
        ]
      };
      localStorage.setItem('crm_masters', JSON.stringify(defaultMasters));
    }
    this.masters$.next(JSON.parse(localStorage.getItem('crm_masters')!));

    // 2. Party Master
    if (!localStorage.getItem('crm_parties')) {
      const defaultParties: Party[] = [
        {
          id: 'p-1',
          companyName: 'Elite Fashion Brands Ltd',
          contactPerson: 'Sarah Jenkins',
          mobile: '9876543210',
          email: 'sarah@elitefashion.com',
          website: 'www.elitefashion.com',
          gstNumber: '27AAAAA1111A1Z1',
          pan: 'AAAAA1111A',
          address: '404 High Street Mall, Bandra West',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          pincode: '400050',
          partyType: 'Customer',
          paymentDueDays: 30,
          creditLimit: 500000,
          currency: 'INR',
          bankDetails: {
            bankName: 'HDFC Bank',
            accountName: 'Elite Fashion Brands Ltd',
            accountNumber: '5010020030040',
            ifsc: 'HDFC0000124',
            branch: 'Bandra West'
          },
          status: 'Active',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'p-2',
          companyName: 'Stellar Models Agency LLC',
          contactPerson: 'David Miller',
          mobile: '9811223344',
          email: 'billing@stellarmodels.com',
          website: 'www.stellarmodels.com',
          gstNumber: '07BBBBB2222B2Z2',
          pan: 'BBBBB2222B',
          address: 'Flat 102, Connaught Place',
          city: 'Delhi',
          state: 'Delhi',
          country: 'India',
          pincode: '110001',
          partyType: 'Vendor',
          paymentDueDays: 15,
          creditLimit: 200000,
          currency: 'INR',
          bankDetails: {
            bankName: 'ICICI Bank',
            accountName: 'Stellar Models Agency LLC',
            accountNumber: '000405006007',
            ifsc: 'ICIC0000004',
            branch: 'CP Delhi'
          },
          status: 'Active',
          createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'p-3',
          companyName: 'Vogue Publications & Agency',
          contactPerson: 'Jean-Luc Dubois',
          mobile: '33140506070',
          email: 'dubois@vogue.fr',
          website: 'www.vogue.fr',
          gstNumber: '',
          pan: '',
          address: '15 Rue du Faubourg Saint-Honoré',
          city: 'Paris',
          state: 'Ile-de-France',
          country: 'France',
          pincode: '75008',
          partyType: 'Customer + Vendor',
          paymentDueDays: 45,
          creditLimit: 1000000,
          currency: 'EUR',
          bankDetails: {
            bankName: 'BNP Paribas',
            accountName: 'Vogue Publications',
            accountNumber: 'FR763000200001',
            ifsc: 'BNPFR75',
            branch: 'Saint-Honoré Paris',
            swiftCode: 'BNPAFRPPXXX'
          },
          status: 'Active',
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      localStorage.setItem('crm_parties', JSON.stringify(defaultParties));
    }
    this.parties$.next(JSON.parse(localStorage.getItem('crm_parties')!));

    // 3. Model Management
    if (!localStorage.getItem('crm_models') || !localStorage.getItem('crm_models')?.includes('portfolioVideos') || !localStorage.getItem('crm_models')?.includes('unsplash.com')) {
      const defaultModels: Model[] = [
        {
          id: 'm-1',
          name: 'Aria Dubois',
          vendorId: 'p-3',
          email: 'aria.dubois@models.com',
          mobile: '33612345678',
          gender: 'Female',
          age: 24,
          height: 178,
          hairColor: 'Blonde',
          skinTone: 'Fair',
          nationality: 'France',
          city: 'Paris',
          experienceYears: 5,
          instagram: 'aria.dubois.official',
          status: 'Available',
          categoryIds: ['mc1', 'mc3'],
          portfolioImages: [
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800'
          ],
          portfolioVideos: ['https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-light-1240-large.mp4'],
          dayRate: 45000,
          bankDetails: {
            bankName: 'BNP Paribas',
            accountName: 'Aria Dubois',
            accountNumber: 'FR893004000002',
            ifsc: 'BNPFR75',
            branch: 'Main Branch Paris',
            swiftCode: 'BNPAFRPPXXX',
            upiId: 'aria@upi'
          },
          createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'm-2',
          name: 'Kabir Malhotra',
          vendorId: 'p-2',
          email: 'kabir.m@models.in',
          mobile: '9822334455',
          gender: 'Male',
          age: 27,
          height: 188,
          hairColor: 'Black',
          skinTone: 'Wheatish',
          nationality: 'India',
          city: 'Mumbai',
          experienceYears: 6,
          instagram: 'kabirmalhotra_fit',
          status: 'Booked',
          categoryIds: ['mc1', 'mc2'],
          portfolioImages: [
            'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=800'
          ],
          portfolioVideos: ['https://assets.mixkit.co/videos/preview/mixkit-young-woman-with-curly-hair-posing-40097-large.mp4'],
          dayRate: 60000,
          bankDetails: {
            bankName: 'State Bank of India',
            accountName: 'Kabir Malhotra',
            accountNumber: '302010104030',
            ifsc: 'SBIN0000213',
            branch: 'Juhu Mumbai',
            upiId: 'kabir@sbi'
          },
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'm-3',
          name: 'Elena Rostova',
          vendorId: '',
          email: 'elena.rostova@fashion.com',
          mobile: '9888776655',
          gender: 'Female',
          age: 22,
          height: 175,
          hairColor: 'Brown',
          skinTone: 'Olive',
          nationality: 'Russia',
          city: 'Mumbai',
          experienceYears: 3,
          instagram: 'elena_rostova',
          status: 'Available',
          categoryIds: ['mc2'],
          portfolioImages: [
            'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&q=80&w=800'
          ],
          portfolioVideos: ['https://assets.mixkit.co/videos/preview/mixkit-woman-walking-in-front-of-a-wall-with-drawings-34241-large.mp4'],
          dayRate: 35000,
          bankDetails: {
            bankName: 'HDFC Bank',
            accountName: 'Elena Rostova',
            accountNumber: '501004455221',
            ifsc: 'HDFC0000124',
            branch: 'Bandra Mumbai',
            upiId: 'elena@hdfc'
          },
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'm-4',
          name: 'Nisha Patil',
          vendorId: 'p-2',
          email: 'nisha@stellar.in',
          mobile: '9123456789',
          gender: 'Female',
          age: 25,
          height: 172,
          hairColor: 'Dark Brown',
          skinTone: 'Dusky',
          nationality: 'India',
          city: 'Delhi',
          experienceYears: 4,
          instagram: 'nisha_patil_model',
          status: 'Active',
          categoryIds: ['mc2', 'mc4'],
          portfolioImages: [
            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=800'
          ],
          portfolioVideos: [],
          dayRate: 30000,
          bankDetails: {
            bankName: 'Axis Bank',
            accountName: 'Nisha Patil',
            accountNumber: '9150100223344',
            ifsc: 'UTIB0000045',
            branch: 'South Ext Delhi',
            upiId: 'nisha@axis'
          },
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('crm_models', JSON.stringify(defaultModels));
    }
    this.models$.next(JSON.parse(localStorage.getItem('crm_models')!));

    // 4. Requirements
    if (!localStorage.getItem('crm_requirements')) {
      const defaultRequirements: Requirement[] = [
        {
          id: 'req-1',
          clientId: 'p-1',
          brandId: 'b1',
          categoryId: 'cat1',
          project: 'Nike Summer Activewear campaign',
          shootDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          location: 'Mumbai studio & beach shoot',
          gender: 'Female',
          ageMin: 20,
          ageMax: 28,
          heightMin: 170,
          heightMax: 182,
          budget: 150000,
          nationality: 'Any',
          experienceYears: 2,
          noOfModels: 2,
          requirements: 'Must have athletic build and active sports background.',
          remarks: 'Highly urgent booking from Nike team.',
          status: 'Open',
          followUps: [
            {
              id: 'fu-1',
              date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              nextFollowUpDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              discussion: 'Discussed rate card with client representative. They are fine with up to 60k/day.',
              status: 'Awaiting Shortlist',
              reminder: true
            }
          ],
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      localStorage.setItem('crm_requirements', JSON.stringify(defaultRequirements));
    }
    this.requirements$.next(JSON.parse(localStorage.getItem('crm_requirements')!));

    // 5. Quotations
    if (!localStorage.getItem('crm_quotations')) {
      const defaultQuotations: Quotation[] = [
        {
          id: 'q-1',
          quotationNo: 'QT-2026-0001',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          customerId: 'p-1',
          brandId: 'b2',
          categoryId: 'cat1',
          requirementId: '',
          validityDays: 15,
          terms: '50% advance, 50% on completion. Shoot images rights limited to 1 year.',
          enableGst: true,
          gstRate: 18,
          taxAmount: 18000,
          grandTotal: 118000,
          models: [
            { modelId: 'm-1', sellingPrice: 50000, remarks: 'Primary recommendation', status: 'Selected' },
            { modelId: 'm-3', sellingPrice: 50000, remarks: 'Backup recommendation', status: 'Hold' }
          ],
          status: 'Approved',
          followUps: [
            {
              id: 'qfu-1',
              date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              nextFollowUpDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              discussion: 'Client approved Aria Dubois. Setting up booking contracts.',
              status: 'Approved',
              reminder: false
            }
          ],
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      localStorage.setItem('crm_quotations', JSON.stringify(defaultQuotations));
    }
    this.quotations$.next(JSON.parse(localStorage.getItem('crm_quotations')!));

    // 6. Bookings
    if (!localStorage.getItem('crm_bookings')) {
      const defaultBookings: Booking[] = [
        {
          id: 'bkg-1',
          bookingNo: 'BK-2026-0001',
          customerId: 'p-1',
          brandId: 'b2',
          categoryId: 'cat1',
          modelIds: ['m-2'],
          venue: 'Studio 11, Film City, Goregaon',
          shootDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          shootTime: '09:00 AM - 06:00 PM',
          coordinatorId: 'coo1',
          sellingPrice: 120000,
          remarks: 'Zara Winter Collection Print shoot.',
          status: 'Confirmed',
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      localStorage.setItem('crm_bookings', JSON.stringify(defaultBookings));
    }
    this.bookings$.next(JSON.parse(localStorage.getItem('crm_bookings')!));

    // 7. Invoices
    if (!localStorage.getItem('crm_invoices')) {
      const defaultInvoices: Invoice[] = [
        {
          id: 'inv-1',
          invoiceNo: 'INV-2026-0001',
          bookingId: 'bkg-1',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          customerId: 'p-1',
          subTotal: 120000,
          enableGst: true,
          cgst: 10800,
          sgst: 10800,
          igst: 0,
          roundOff: 0,
          grandTotal: 141600,
          status: 'Pending',
          amountPaid: 0,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'inv-2',
          invoiceNo: 'INV-2026-0002',
          bookingId: '',
          date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          customerId: 'p-1',
          subTotal: 80000,
          enableGst: true,
          cgst: 7200,
          sgst: 7200,
          igst: 0,
          roundOff: 0,
          grandTotal: 94400,
          status: 'Paid',
          amountPaid: 94400,
          createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      localStorage.setItem('crm_invoices', JSON.stringify(defaultInvoices));
    }
    this.invoices$.next(JSON.parse(localStorage.getItem('crm_invoices')!));

    // 8. Payments Received
    if (!localStorage.getItem('crm_payments_received')) {
      const defaultPaymentsReceived: PaymentReceived[] = [
        {
          id: 'payr-1',
          customerId: 'p-1',
          invoiceId: 'inv-2',
          amount: 94400,
          tdsDeduction: 1600,
          reference: 'TXN102930291',
          mode: 'Bank Transfer',
          remarks: 'Received full payment for invoice 2, standard TDS deducted.',
          date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      ];
      localStorage.setItem('crm_payments_received', JSON.stringify(defaultPaymentsReceived));
    }
    this.paymentsReceived$.next(JSON.parse(localStorage.getItem('crm_payments_received')!));

    // 9. Payments Made
    if (!localStorage.getItem('crm_payments_made')) {
      const defaultPaymentsMade: PaymentMade[] = [
        {
          id: 'paym-1',
          vendorId: 'p-2',
          modelId: 'm-2',
          amount: 50000,
          tdsDeduction: 1000,
          reference: 'SBI2039203912',
          mode: 'Bank Transfer',
          remarks: 'Model payment for Kabir Malhotra, Zara Shoot.',
          date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      ];
      localStorage.setItem('crm_payments_made', JSON.stringify(defaultPaymentsMade));
    }
    this.paymentsMade$.next(JSON.parse(localStorage.getItem('crm_payments_made')!));

    // 10. Documents
    if (!localStorage.getItem('crm_documents')) {
      const defaultDocs: DocumentRecord[] = [
        {
          id: 'doc-1',
          fileName: 'Elite_Agreement_2026.pdf',
          fileType: 'Agreement',
          fileSize: '1.2 MB',
          uploadedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          linkedEntityId: 'p-1',
          linkedEntityType: 'Party',
          url: '#'
        },
        {
          id: 'doc-2',
          fileName: 'Zara_Shoot_Invoice_Signed.pdf',
          fileType: 'Invoice',
          fileSize: '840 KB',
          uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          linkedEntityId: 'inv-1',
          linkedEntityType: 'Invoice',
          url: '#'
        }
      ];
      localStorage.setItem('crm_documents', JSON.stringify(defaultDocs));
    }
    this.documents$.next(JSON.parse(localStorage.getItem('crm_documents')!));

    // 11. Settings
    if (!localStorage.getItem('crm_settings')) {
      const defaultSettings: CrmSettings = {
        companyName: 'Apex Talent & Model CRM Pvt Ltd',
        gstNumber: '27APEXM1020M1Z0',
        email: 'info@apextalent.com',
        phone: '+91 22 99887766',
        address: '501-502, Crescent Towers, Link Road, Andheri West, Mumbai, India',
        bankName: 'HDFC Bank',
        accountName: 'Apex Talent & Model CRM Pvt Ltd',
        accountNumber: '50200010203040',
        ifsc: 'HDFC0000047',
        branch: 'Andheri West Mumbai',
        quotationPrefix: 'QT-2026-',
        bookingPrefix: 'BK-2026-',
        invoicePrefix: 'INV-2026-',
        whatsappGatewayToken: 'WPP-GATEWAY-TEST-TOKEN',
        emailGatewayToken: 'SMTP-GATEWAY-TEST-TOKEN',
        paymentGatewayKey: 'RAZORPAY-TEST-KEY'
      };
      localStorage.setItem('crm_settings', JSON.stringify(defaultSettings));
    }
    this.settings$.next(JSON.parse(localStorage.getItem('crm_settings')!));

    // 12. Notifications
    if (!localStorage.getItem('crm_notifications')) {
      const defaultNotifications: SystemNotification[] = [
        {
          id: 'nt-1',
          title: 'Upcoming Shoot Reminder',
          message: 'Booking BK-2026-0001 with Kabir Malhotra is scheduled for tomorrow at Studio 11.',
          type: 'Booking',
          isRead: false,
          createdAt: new Date().toISOString()
        },
        {
          id: 'nt-2',
          title: 'Invoice Outstanding Alert',
          message: 'Invoice INV-2026-0001 for Elite Fashion Brands Ltd is pending payment.',
          type: 'Invoice',
          isRead: false,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      localStorage.setItem('crm_notifications', JSON.stringify(defaultNotifications));
    }
    this.notifications$.next(JSON.parse(localStorage.getItem('crm_notifications')!));

    // 13. Users
    if (!localStorage.getItem('crm_users')) {
      const defaultUsers: UserAccount[] = [
        { id: 'u-1', name: 'Super Admin User', email: 'admin@apextalent.com', role: 'Super Admin', status: 'Active' },
        { id: 'u-2', name: 'Rohan Sharma', email: 'rohan@apextalent.com', role: 'Talent Manager', status: 'Active' },
        { id: 'u-3', name: 'Megha Goel', email: 'megha@apextalent.com', role: 'Finance', status: 'Active' }
      ];
      localStorage.setItem('crm_users', JSON.stringify(defaultUsers));
    }
    this.users$.next(JSON.parse(localStorage.getItem('crm_users')!));
    this.currentUser$.next(this.users$.value[0]); // default to Super Admin

    // 14. Activity Logs
    if (!localStorage.getItem('crm_activity_logs')) {
      const defaultLogs: ActivityLog[] = [
        {
          id: 'log-1',
          action: 'Login',
          module: 'Auth',
          description: 'User admin@apextalent.com logged in successfully.',
          userIP: '192.168.1.100',
          timestamp: new Date().toISOString()
        },
        {
          id: 'log-2',
          action: 'Create',
          module: 'Booking',
          description: 'Booking BK-2026-0001 created for Elite Fashion Brands Ltd.',
          userIP: '192.168.1.100',
          timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      localStorage.setItem('crm_activity_logs', JSON.stringify(defaultLogs));
    }
    this.activityLogs$.next(JSON.parse(localStorage.getItem('crm_activity_logs')!));
  }

  // --- CRUD ACTIONS FOR SYSTEM ENTITIES ---

  // HELPERS
  private updateStorage(key: string, data: any, subject: BehaviorSubject<any>) {
    localStorage.setItem(key, JSON.stringify(data));
    subject.next(data);
  }

  private logActivity(action: ActivityLog['action'], module: string, description: string) {
    const logs = [...this.activityLogs$.value];
    const newLog: ActivityLog = {
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      action,
      module,
      description,
      userIP: '127.0.0.1',
      timestamp: new Date().toISOString()
    };
    logs.unshift(newLog);
    this.updateStorage('crm_activity_logs', logs, this.activityLogs$);
  }

  clearActivityLogs() {
    this.updateStorage('crm_activity_logs', [], this.activityLogs$);
  }

  createNotification(title: string, message: string, type: SystemNotification['type']) {
    const list = [...this.notifications$.value];
    const newNotif: SystemNotification = {
      id: 'nt-' + Math.random().toString(36).substr(2, 9),
      title,
      message,
      type,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    list.unshift(newNotif);
    this.updateStorage('crm_notifications', list, this.notifications$);
  }

  // GETTERS AS OBSERVABLES
  getMasters$(): Observable<MastersData | null> { return this.masters$.asObservable(); }
  getParties$(): Observable<Party[]> { return this.parties$.asObservable(); }
  getModels$(): Observable<Model[]> { return this.models$.asObservable(); }
  getRequirements$(): Observable<Requirement[]> { return this.requirements$.asObservable(); }
  getQuotations$(): Observable<Quotation[]> { return this.quotations$.asObservable(); }
  getBookings$(): Observable<Booking[]> { return this.bookings$.asObservable(); }
  getInvoices$(): Observable<Invoice[]> { return this.invoices$.asObservable(); }
  getPaymentsReceived$(): Observable<PaymentReceived[]> { return this.paymentsReceived$.asObservable(); }
  getPaymentsMade$(): Observable<PaymentMade[]> { return this.paymentsMade$.asObservable(); }
  getDocuments$(): Observable<DocumentRecord[]> { return this.documents$.asObservable(); }
  getNotifications$(): Observable<SystemNotification[]> { return this.notifications$.asObservable(); }
  getActivityLogs$(): Observable<ActivityLog[]> { return this.activityLogs$.asObservable(); }
  getSettings$(): Observable<CrmSettings | null> { return this.settings$.asObservable(); }
  getUsers$(): Observable<UserAccount[]> { return this.users$.asObservable(); }
  getCurrentUser$(): Observable<UserAccount | null> { return this.currentUser$.asObservable(); }

  // 1. Party Master CRUD
  saveParty(party: Party) {
    const list = [...this.parties$.value];
    const index = list.findIndex(p => p.id === party.id);
    if (index > -1) {
      list[index] = party;
      this.logActivity('Update', 'Party Master', `Updated Party: ${party.companyName}`);
    } else {
      party.id = 'p-' + Math.random().toString(36).substr(2, 9);
      party.createdAt = new Date().toISOString();
      list.push(party);
      this.logActivity('Create', 'Party Master', `Created Party: ${party.companyName}`);
    }
    this.updateStorage('crm_parties', list, this.parties$);
  }

  deleteParty(id: string) {
    const list = this.parties$.value.filter(p => p.id !== id);
    this.logActivity('Delete', 'Party Master', `Deleted Party ID: ${id}`);
    this.updateStorage('crm_parties', list, this.parties$);
  }

  // 2. Model CRUD
  saveModel(model: Model) {
    const list = [...this.models$.value];
    const index = list.findIndex(m => m.id === model.id);
    if (index > -1) {
      list[index] = model;
      this.logActivity('Update', 'Model Management', `Updated Model Profile: ${model.name}`);
    } else {
      model.id = 'm-' + Math.random().toString(36).substr(2, 9);
      model.createdAt = new Date().toISOString();
      list.push(model);
      this.logActivity('Create', 'Model Management', `Registered Model Profile: ${model.name}`);
    }
    this.updateStorage('crm_models', list, this.models$);
  }

  deleteModel(id: string) {
    const list = this.models$.value.filter(m => m.id !== id);
    this.logActivity('Delete', 'Model Management', `Deleted Model ID: ${id}`);
    this.updateStorage('crm_models', list, this.models$);
  }

  // 3. Masters CRUD (generic for simple Masters lists)
  saveMasterItem(type: keyof MastersData, item: MasterItem | GstRateItem) {
    const masters = { ...this.masters$.value } as MastersData;
    if (!masters) return;
    const list = masters[type] as any[];
    const index = list.findIndex(i => i.id === item.id);
    if (index > -1) {
      list[index] = item;
    } else {
      item.id = type.substring(0, 3) + '-' + Math.random().toString(36).substr(2, 9);
      list.push(item);
    }
    this.updateStorage('crm_masters', masters, this.masters$);
    this.logActivity('Update', 'Masters', `Updated Master list ${type} with item ${item.name}`);
  }

  deleteMasterItem(type: keyof MastersData, itemId: string) {
    const masters = { ...this.masters$.value } as MastersData;
    if (!masters) return;
    const list = (masters[type] as any[]).filter(i => i.id !== itemId);
    (masters as any)[type] = list;
    this.updateStorage('crm_masters', masters, this.masters$);
    this.logActivity('Delete', 'Masters', `Deleted from ${type} ID: ${itemId}`);
  }

  saveMasters(masters: MastersData) {
    this.updateStorage('crm_masters', masters, this.masters$);
    this.logActivity('Update', 'Masters', `Updated Masters settings`);
  }

  // 4. Requirement CRUD
  saveRequirement(req: Requirement) {
    const list = [...this.requirements$.value];
    const index = list.findIndex(r => r.id === req.id);
    if (index > -1) {
      list[index] = req;
      this.logActivity('Update', 'Requirements', `Updated Requirement: ${req.project}`);
    } else {
      req.id = 'req-' + Math.random().toString(36).substr(2, 9);
      req.createdAt = new Date().toISOString();
      req.followUps = req.followUps || [];
      list.push(req);
      this.logActivity('Create', 'Requirements', `Created Requirement: ${req.project}`);
    }
    this.updateStorage('crm_requirements', list, this.requirements$);
  }

  addRequirementFollowUp(reqId: string, followup: FollowUp) {
    const list = [...this.requirements$.value];
    const index = list.findIndex(r => r.id === reqId);
    if (index > -1) {
      followup.id = 'fu-' + Math.random().toString(36).substr(2, 9);
      list[index].followUps.push(followup);
      this.logActivity('Update', 'Requirements', `Added Follow-up to Req: ${list[index].project}`);
      this.saveRequirement(list[index]);
    }
  }

  deleteRequirement(id: string) {
    const list = this.requirements$.value.filter(r => r.id !== id);
    this.logActivity('Delete', 'Requirements', `Deleted Requirement ID: ${id}`);
    this.updateStorage('crm_requirements', list, this.requirements$);
  }

  // 5. Quotation CRUD
  saveQuotation(qt: Quotation) {
    const list = [...this.quotations$.value];
    const index = list.findIndex(q => q.id === qt.id);

    // Calculate amounts
    let subTotal = 0;
    qt.models.forEach(qm => {
      subTotal += qm.sellingPrice;
    });
    if (qt.enableGst) {
      qt.taxAmount = (subTotal * qt.gstRate) / 100;
      qt.grandTotal = subTotal + qt.taxAmount;
    } else {
      qt.taxAmount = 0;
      qt.grandTotal = subTotal;
    }

    if (index > -1) {
      list[index] = qt;
      this.logActivity('Update', 'Quotations', `Updated Quotation: ${qt.quotationNo}`);
    } else {
      const pref = this.settings$.value?.quotationPrefix || 'QT-2026-';
      qt.id = 'q-' + Math.random().toString(36).substr(2, 9);
      qt.quotationNo = pref + (list.length + 1).toString().padStart(4, '0');
      qt.createdAt = new Date().toISOString();
      qt.followUps = qt.followUps || [];
      list.push(qt);
      this.logActivity('Create', 'Quotations', `Created Quotation: ${qt.quotationNo}`);
    }
    this.updateStorage('crm_quotations', list, this.quotations$);
  }

  addQuotationFollowUp(qtId: string, followup: FollowUp) {
    const list = [...this.quotations$.value];
    const index = list.findIndex(q => q.id === qtId);
    if (index > -1) {
      followup.id = 'qfu-' + Math.random().toString(36).substr(2, 9);
      list[index].followUps.push(followup);
      this.logActivity('Update', 'Quotations', `Added Follow-up to Quotation: ${list[index].quotationNo}`);
      this.saveQuotation(list[index]);
    }
  }

  deleteQuotation(id: string) {
    const list = this.quotations$.value.filter(q => q.id !== id);
    this.logActivity('Delete', 'Quotations', `Deleted Quotation ID: ${id}`);
    this.updateStorage('crm_quotations', list, this.quotations$);
  }

  // 6. Booking CRUD - Automated workflows trigger here!
  saveBooking(booking: Booking) {
    const list = [...this.bookings$.value];
    const index = list.findIndex(b => b.id === booking.id);

    if (index > -1) {
      list[index] = booking;
      this.logActivity('Update', 'Bookings', `Updated Booking: ${booking.bookingNo}`);
    } else {
      const pref = this.settings$.value?.bookingPrefix || 'BK-2026-';
      booking.id = 'bkg-' + Math.random().toString(36).substr(2, 9);
      booking.bookingNo = pref + (list.length + 1).toString().padStart(4, '0');
      booking.createdAt = new Date().toISOString();
      list.push(booking);
      this.logActivity('Create', 'Bookings', `Confirmed Booking: ${booking.bookingNo}`);

      // --- AUTOMATION TRIGGERS ---

      // A. Update linked model availability statuses
      const modelsList = [...this.models$.value];
      booking.modelIds.forEach(mid => {
        const mIdx = modelsList.findIndex(m => m.id === mid);
        if (mIdx > -1) {
          modelsList[mIdx].status = 'Booked';
        }
      });
      this.updateStorage('crm_models', modelsList, this.models$);

      // B. Auto-generate Pending Invoice
      const subTotal = booking.sellingPrice;
      const gstRate = 18; // default rate
      const taxVal = (subTotal * gstRate) / 100;
      const invoicePref = this.settings$.value?.invoicePrefix || 'INV-2026-';
      const invList = [...this.invoices$.value];
      const newInvoice: Invoice = {
        id: 'inv-' + Math.random().toString(36).substr(2, 9),
        invoiceNo: invoicePref + (invList.length + 1).toString().padStart(4, '0'),
        bookingId: booking.id,
        date: booking.shootDate,
        customerId: booking.customerId,
        subTotal,
        enableGst: true,
        cgst: taxVal / 2,
        sgst: taxVal / 2,
        igst: 0,
        roundOff: 0,
        grandTotal: subTotal + taxVal,
        status: 'Pending',
        amountPaid: 0,
        createdAt: new Date().toISOString()
      };
      invList.push(newInvoice);
      this.updateStorage('crm_invoices', invList, this.invoices$);
      this.logActivity('Create', 'Invoices', `Auto-generated Invoice: ${newInvoice.invoiceNo} for Booking: ${booking.bookingNo}`);

      // C. System Notification
      this.createNotification(
        'New Booking Confirmed',
        `Booking ${booking.bookingNo} created. Invoice ${newInvoice.invoiceNo} has been automatically raised.`,
        'Booking'
      );
    }
    this.updateStorage('crm_bookings', list, this.bookings$);
  }

  deleteBooking(id: string) {
    const booking = this.bookings$.value.find(b => b.id === id);
    if (booking) {
      // Revert model statuses
      const modelsList = [...this.models$.value];
      booking.modelIds.forEach(mid => {
        const mIdx = modelsList.findIndex(m => m.id === mid);
        if (mIdx > -1) {
          modelsList[mIdx].status = 'Available';
        }
      });
      this.updateStorage('crm_models', modelsList, this.models$);
    }
    const list = this.bookings$.value.filter(b => b.id !== id);
    this.logActivity('Delete', 'Bookings', `Deleted Booking ID: ${id}`);
    this.updateStorage('crm_bookings', list, this.bookings$);
  }

  cancelBooking(id: string) {
    const list = [...this.bookings$.value];
    const index = list.findIndex(b => b.id === id);
    if (index > -1) {
      list[index].status = 'Cancelled';
      
      // Revert model statuses
      const modelsList = [...this.models$.value];
      list[index].modelIds.forEach(mid => {
        const mIdx = modelsList.findIndex(m => m.id === mid);
        if (mIdx > -1) {
          modelsList[mIdx].status = 'Available';
        }
      });
      this.updateStorage('crm_models', modelsList, this.models$);
      this.logActivity('Update', 'Bookings', `Cancelled Booking No: ${list[index].bookingNo}`);
      this.updateStorage('crm_bookings', list, this.bookings$);
    }
  }

  // 7. Payments Received CRUD
  savePaymentReceived(pay: PaymentReceived) {
    const list = [...this.paymentsReceived$.value];
    pay.id = 'payr-' + Math.random().toString(36).substr(2, 9);
    pay.date = pay.date || new Date().toISOString().split('T')[0];
    list.push(pay);
    this.updateStorage('crm_payments_received', list, this.paymentsReceived$);

    // --- AUTOMATION TRIGGERS ---
    // Update invoice status
    const invList = [...this.invoices$.value];
    const invIdx = invList.findIndex(i => i.id === pay.invoiceId);
    if (invIdx > -1) {
      const inv = invList[invIdx];
      inv.amountPaid += pay.amount;
      if (inv.amountPaid >= inv.grandTotal) {
        inv.status = 'Paid';
      } else if (inv.amountPaid > 0) {
        inv.status = 'Partial';
      }
      this.updateStorage('crm_invoices', invList, this.invoices$);
      this.logActivity('Payment', 'Finance', `Recorded Received Payment: ${pay.amount} for Invoice: ${inv.invoiceNo}`);
      this.createNotification('Payment Received', `Received ${pay.amount} against Invoice ${inv.invoiceNo}.`, 'Payment');
    }
  }

  deletePaymentReceived(id: string) {
    const list = this.paymentsReceived$.value.filter(p => p.id !== id);
    this.logActivity('Delete', 'Finance', `Deleted Received Payment ID: ${id}`);
    this.updateStorage('crm_payments_received', list, this.paymentsReceived$);
  }

  // 8. Payments Made CRUD
  savePaymentMade(pay: PaymentMade) {
    const list = [...this.paymentsMade$.value];
    pay.id = 'paym-' + Math.random().toString(36).substr(2, 9);
    pay.date = pay.date || new Date().toISOString().split('T')[0];
    list.push(pay);
    this.updateStorage('crm_payments_made', list, this.paymentsMade$);

    this.logActivity('Payment', 'Finance', `Recorded Paid Out: ${pay.amount} to Model ID: ${pay.modelId}`);
    this.createNotification('Payment Disbursed', `Paid ${pay.amount} to model.`, 'Payment');
  }

  deletePaymentMade(id: string) {
    const list = this.paymentsMade$.value.filter(p => p.id !== id);
    this.logActivity('Delete', 'Finance', `Deleted Disbursed Payment ID: ${id}`);
    this.updateStorage('crm_payments_made', list, this.paymentsMade$);
  }

  // 9. Document CRUD
  saveDocument(doc: DocumentRecord) {
    const list = [...this.documents$.value];
    doc.id = 'doc-' + Math.random().toString(36).substr(2, 9);
    doc.uploadedAt = new Date().toISOString();
    doc.url = '#'; // Mocked URL
    list.push(doc);
    this.updateStorage('crm_documents', list, this.documents$);
    this.logActivity('Create', 'Documents', `Uploaded Document: ${doc.fileName}`);
  }

  deleteDocument(id: string) {
    const list = this.documents$.value.filter(d => d.id !== id);
    this.updateStorage('crm_documents', list, this.documents$);
    this.logActivity('Delete', 'Documents', `Removed Document ID: ${id}`);
  }

  // 10. Settings Update
  saveSettings(settings: CrmSettings) {
    this.updateStorage('crm_settings', settings, this.settings$);
    this.logActivity('Update', 'Settings', 'Updated company profile and settings.');
  }

  // 11. User Management CRUD
  saveUser(user: UserAccount) {
    const list = [...this.users$.value];
    const index = list.findIndex(u => u.id === user.id);
    if (index > -1) {
      list[index] = user;
      this.logActivity('Update', 'User Management', `Updated user: ${user.name}`);
    } else {
      user.id = 'u-' + Math.random().toString(36).substr(2, 9);
      user.status = 'Active';
      list.push(user);
      this.logActivity('Create', 'User Management', `Added user: ${user.name}`);
    }
    this.updateStorage('crm_users', list, this.users$);
  }

  deleteUser(id: string) {
    const list = this.users$.value.filter(u => u.id !== id);
    this.updateStorage('crm_users', list, this.users$);
    this.logActivity('Delete', 'User Management', `Deleted user ID: ${id}`);
  }

  reseedData() {
    localStorage.removeItem('crm_masters');
    localStorage.removeItem('crm_parties');
    localStorage.removeItem('crm_models');
    localStorage.removeItem('crm_requirements');
    localStorage.removeItem('crm_quotations');
    localStorage.removeItem('crm_bookings');
    localStorage.removeItem('crm_invoices');
    localStorage.removeItem('crm_payments_received');
    localStorage.removeItem('crm_payments_made');
    localStorage.removeItem('crm_documents');
    localStorage.removeItem('crm_settings');
    localStorage.removeItem('crm_notifications');
    localStorage.removeItem('crm_users');
    localStorage.removeItem('crm_activity_logs');
    this.initDatabase();
  }

  clearAllData() {
    this.updateStorage('crm_parties', [], this.parties$);
    this.updateStorage('crm_models', [], this.models$);
    this.updateStorage('crm_requirements', [], this.requirements$);
    this.updateStorage('crm_quotations', [], this.quotations$);
    this.updateStorage('crm_bookings', [], this.bookings$);
    this.updateStorage('crm_invoices', [], this.invoices$);
    this.updateStorage('crm_payments_received', [], this.paymentsReceived$);
    this.updateStorage('crm_payments_made', [], this.paymentsMade$);
    this.updateStorage('crm_documents', [], this.documents$);
    this.updateStorage('crm_notifications', [], this.notifications$);
    this.updateStorage('crm_activity_logs', [], this.activityLogs$);
  }

  switchUserRole(userId: string) {
    const user = this.users$.value.find(u => u.id === userId);
    if (user) {
      this.currentUser$.next(user);
      this.logActivity('Login', 'Auth', `Switched active role to: ${user.name} (${user.role})`);
    }
  }

  // Notification read toggle
  markAllNotificationsRead() {
    const list = this.notifications$.value.map(n => ({ ...n, isRead: true }));
    this.updateStorage('crm_notifications', list, this.notifications$);
  }

  markNotificationRead(id: string) {
    const list = [...this.notifications$.value];
    const idx = list.findIndex(n => n.id === id);
    if (idx > -1) {
      list[idx].isRead = true;
      this.updateStorage('crm_notifications', list, this.notifications$);
    }
  }

  clearAllNotifications() {
    this.updateStorage('crm_notifications', [], this.notifications$);
  }

  deleteNotification(id: string) {
    const list = this.notifications$.value.filter(n => n.id !== id);
    this.updateStorage('crm_notifications', list, this.notifications$);
  }

  // Bulk Import Models Helper
  bulkImportModels(models: Model[]) {
    const currentList = [...this.models$.value];
    let addedCount = 0;
    let duplicateCount = 0;
    const errors: string[] = [];

    models.forEach(model => {
      // Validations
      if (!model.name || !model.email || !model.mobile) {
        errors.push(`Row missing name, email, or mobile.`);
        return;
      }
      const duplicate = currentList.find(m => m.email === model.email || m.mobile === model.mobile);
      if (duplicate) {
        duplicateCount++;
        return;
      }

      model.id = 'm-' + Math.random().toString(36).substr(2, 9);
      model.status = model.status || 'Available';
      model.gender = model.gender || 'Female';
      model.age = model.age || 20;
      model.height = model.height || 170;
      model.experienceYears = model.experienceYears || 0;
      model.hairColor = model.hairColor || 'Black';
      model.skinTone = model.skinTone || 'Fair';
      model.nationality = model.nationality || 'India';
      model.city = model.city || 'Mumbai';
      model.categoryIds = model.categoryIds || [];
      model.portfolioImages = model.portfolioImages || [];
      model.portfolioVideos = model.portfolioVideos || [];
      model.dayRate = model.dayRate || 20000;
      model.bankDetails = model.bankDetails || {
        bankName: '',
        accountName: '',
        accountNumber: '',
        ifsc: '',
        branch: ''
      };
      model.createdAt = new Date().toISOString();

      currentList.push(model);
      addedCount++;
    });

    if (addedCount > 0) {
      this.updateStorage('crm_models', currentList, this.models$);
      this.logActivity('Create', 'Model Management', `Bulk Imported ${addedCount} models successfully.`);
    }

    return {
      addedCount,
      duplicateCount,
      errors
    };
  }
}
