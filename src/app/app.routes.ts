import { Routes } from '@angular/router';
import { EcommerceComponent } from './pages/dashboard/ecommerce/ecommerce.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { FormElementsComponent } from './pages/forms/form-elements/form-elements.component';
import { BasicTablesComponent } from './pages/tables/basic-tables/basic-tables.component';
import { BlankComponent } from './pages/blank/blank.component';
import { NotFoundComponent } from './pages/other-page/not-found/not-found.component';
import { AppLayoutComponent } from './shared/layout/app-layout/app-layout.component';
import { InvoicesComponent } from './pages/invoices/invoices.component';
import { LineChartComponent } from './pages/charts/line-chart/line-chart.component';
import { BarChartComponent } from './pages/charts/bar-chart/bar-chart.component';
import { AlertsComponent } from './pages/ui-elements/alerts/alerts.component';
import { AvatarElementComponent } from './pages/ui-elements/avatar-element/avatar-element.component';
import { BadgesComponent } from './pages/ui-elements/badges/badges.component';
import { ButtonsComponent } from './pages/ui-elements/buttons/buttons.component';
import { ImagesComponent } from './pages/ui-elements/images/images.component';
import { VideosComponent } from './pages/ui-elements/videos/videos.component';
import { SignInComponent } from './pages/auth-pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/auth-pages/sign-up/sign-up.component';
import { CalenderComponent } from './pages/calender/calender.component';

// CRM Imports
import { CrmDashboardComponent } from './pages/crm/dashboard/crm-dashboard.component';
import { CrmPartiesComponent } from './pages/crm/parties/crm-parties.component';
import { CrmModelsComponent } from './pages/crm/models/crm-models.component';
import { CrmSearchComponent } from './pages/crm/search/crm-search.component';
import { CrmRequirementsComponent } from './pages/crm/requirements/crm-requirements.component';
import { CrmQuotationsComponent } from './pages/crm/quotations/crm-quotations.component';
import { CrmBookingsComponent } from './pages/crm/bookings/crm-bookings.component';
import { CrmCalendarComponent } from './pages/crm/calendar/crm-calendar.component';
import { CrmInvoicesComponent } from './pages/crm/invoices/crm-invoices.component';
import { CrmPaymentsComponent } from './pages/crm/payments/crm-payments.component';
import { CrmReportsComponent } from './pages/crm/reports/crm-reports.component';
import { CrmDocumentsComponent } from './pages/crm/documents/crm-documents.component';
import { CrmNotificationsComponent } from './pages/crm/notifications/crm-notifications.component';
import { CrmActivityComponent } from './pages/crm/activity/crm-activity.component';
import { CrmSearchGlobalComponent } from './pages/crm/search-global/crm-search-global.component';
import { CrmUsersComponent } from './pages/crm/users/crm-users.component';
import { CrmSettingsComponent } from './pages/crm/settings/crm-settings.component';
import { CrmMastersComponent } from './pages/crm/masters/crm-masters.component';

export const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'crm/dashboard',
        pathMatch: 'full'
      },
      {
        path: 'calendar',
        component: CalenderComponent,
        title: 'Angular Calender | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path: 'profile',
        component: ProfileComponent,
        title: 'Angular Profile Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path: 'form-elements',
        component: FormElementsComponent,
        title: 'Angular Form Elements Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path: 'basic-tables',
        component: BasicTablesComponent,
        title: 'Angular Basic Tables Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path: 'blank',
        component: BlankComponent,
        title: 'Angular Blank Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      // support tickets
      {
        path: 'invoice',
        component: InvoicesComponent,
        title: 'Angular Invoice Details Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path: 'line-chart',
        component: LineChartComponent,
        title: 'Angular Line Chart Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path: 'bar-chart',
        component: BarChartComponent,
        title: 'Angular Bar Chart Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path: 'alerts',
        component: AlertsComponent,
        title: 'Angular Alerts Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path: 'avatars',
        component: AvatarElementComponent,
        title: 'Angular Avatars Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path: 'badge',
        component: BadgesComponent,
        title: 'Angular Badges Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path: 'buttons',
        component: ButtonsComponent,
        title: 'Angular Buttons Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path: 'images',
        component: ImagesComponent,
        title: 'Angular Images Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path: 'videos',
        component: VideosComponent,
        title: 'Angular Videos Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },

      // CRM Pages Register
      {
        path: 'crm/dashboard',
        component: CrmDashboardComponent,
        title: 'Talent Dashboard | Talent Management CRM'
      },
      {
        path: 'crm/parties',
        component: CrmPartiesComponent,
        title: 'Customers & Vendors | Talent Management CRM'
      },
      {
        path: 'crm/models',
        component: CrmModelsComponent,
        title: 'Model Database | Talent Management CRM'
      },
      {
        path: 'crm/search',
        component: CrmSearchComponent,
        title: 'Smart Model Search | Talent Management CRM'
      },
      {
        path: 'crm/requirements',
        component: CrmRequirementsComponent,
        title: 'Casting Requirements | Talent Management CRM'
      },
      {
        path: 'crm/quotations',
        component: CrmQuotationsComponent,
        title: 'Quotations Desk | Talent Management CRM'
      },
      {
        path: 'crm/bookings',
        component: CrmBookingsComponent,
        title: 'Shoot Bookings | Talent Management CRM'
      },
      {
        path: 'crm/calendar',
        component: CrmCalendarComponent,
        title: 'Shoot Calendar | Talent Management CRM'
      },
      {
        path: 'crm/invoices',
        component: CrmInvoicesComponent,
        title: 'Invoices Receivables | Talent Management CRM'
      },
      {
        path: 'crm/payments',
        component: CrmPaymentsComponent,
        title: 'Double Ledger Payments | Talent Management CRM'
      },
      {
        path: 'crm/reports',
        component: CrmReportsComponent,
        title: 'Financial Reports | Talent Management CRM'
      },
      {
        path: 'crm/documents',
        component: CrmDocumentsComponent,
        title: 'Documents Vault | Talent Management CRM'
      },
      {
        path: 'crm/notifications',
        component: CrmNotificationsComponent,
        title: 'Alerts Desk | Talent Management CRM'
      },
      {
        path: 'crm/activity',
        component: CrmActivityComponent,
        title: 'Security Activity Logs | Talent Management CRM'
      },
      {
        path: 'crm/search-global',
        component: CrmSearchGlobalComponent,
        title: 'Global Search | Talent Management CRM'
      },
      {
        path: 'crm/users',
        component: CrmUsersComponent,
        title: 'User Management | Talent Management CRM'
      },
      {
        path: 'crm/settings',
        component: CrmSettingsComponent,
        title: 'System Settings | Talent Management CRM'
      },
      {
        path: 'crm/masters',
        component: CrmMastersComponent,
        title: 'Reusable Masters | Talent Management CRM'
      }
    ]
  },
  // auth pages
  {
    path: 'signin',
    component: SignInComponent,
    title: 'Angular Sign In Dashboard | TailAdmin - Angular Admin Dashboard Template'
  },
  {
    path: 'signup',
    component: SignUpComponent,
    title: 'Angular Sign Up Dashboard | TailAdmin - Angular Admin Dashboard Template'
  },
  // error pages
  {
    path: '**',
    component: NotFoundComponent,
    title: 'Angular NotFound Dashboard | TailAdmin - Angular Admin Dashboard Template'
  },
];
