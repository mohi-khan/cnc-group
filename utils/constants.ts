import { MenuItem } from './type'

export const MENU_ITEMS: MenuItem[] = [
  {
    name: 'Accounting',
    subItemGroups: [
      {
        name: 'Journal Management',
        items: [
          { name: 'Journal Entry', source: '/accounting/journal-voucher' },
          { name: 'Journal Items', source: '/accounting/journal-items' },
          { name: 'Reverse Entry', source: '/accounting/reverse-entry' },
        ],
      },
      {
        name: 'Books',
        items: [{ name: 'Day Books', source: '/accounting/day-books' }],
      },
      {
        name: 'Vouchers',
        items: [
          {
            name: 'Create Repetitive Vouchers',
            source: '/accounting/repetitive-vouchers',
          },
          { name: 'Lock Vouchers', source: '/accounting/lock-vouchers' },
        ],
      },
    ],
  },
  {
    name: 'Cash',
    subItemGroups: [
      {
        name: 'Suspense ',
        items: [{ name: 'Iou', source: '/cash/sespense/iou' }],
      },
      {
        name: 'Cash Management',
        items: [
          { name: 'Cash Voucher', source: '/cash/cash-voucher' },
          { name: 'Cash Reports', source: '/cash/cash-reports' },
          { name: 'Contra Vouchers', source: '/cash/contra-vouchers' },
        ],
      },
    ],
  },
  {
    name: 'Customers',
    subItemGroups: [
      {
        name: 'Customer Management',
        items: [
          { name: 'Invoices', source: '/customers/invoices' },
          { name: 'Receipt', source: '/customers/receipt' },
          {
            name: 'Customer Statement',
            source: '/customers/customer-statement',
          },
        ],
      },
    ],
  },
  {
    name: 'Vendors',
    subItemGroups: [
      {
        name: 'Vendor Management',
        items: [
          { name: 'Bills', source: '/vendors/bills' },
          {
            name: 'Payment Requisition',
            source: '/vendors/payment-requisition',
          },
          {
            name: 'Advance Payment Requisition',
            source: '/vendors/approved-advances',
          },
          { name: 'Vendor Statement', source: '/vendors/vendor-statement' },
        ],
      },
      
    ],
  },
  {
    name: 'Vehicle',
    subItemGroups: [
      {
        name: 'Vehicle Management',
        items: [
          { name: 'Vehicle', source: '/vehicle/vehicle' },
          {
            name: 'Vehicle Fuel Consumption',
            source: '/vehicle/vehicle-fuel-consumption',
          },
          { name: 'Vehicle Summary', source: '/vehicle/vehicle-summary' },
          {
            name: 'Vehicle Performance Report',
            source: '/vehicle/vehicle-performance-report',
          },
        
          
        ],
      },
    ],
  },
  {
    name: 'Electricity',
    subItemGroups: [
      {
        name: 'Electricity',
        items: [
          { name: 'Meter Entry', source: '/electricity/meter-entry' },
          { name: 'Bill Entry', source: '/electricity/bill-entry' },
          { name: 'Report', source: '/electricity/report' },
        ],
      },
    ],
  },
  {
    name: 'Assets',
    subItemGroups: [
      {
        name: 'Asset Management',
        items: [
          {
            name: 'Create Asset',
            source: '/assets/assets',
          },
          {
            name: 'Create Asset Category',
            source: '/assets/asset-category',
          },
          {
            name: 'Configure Depreciation',
            source: '/assets/configure-depreciation',
          },
          {
            name: 'Configure Asset Accounting',
            source: '/assets/configure-asset-accounting',
          },
          { name: 'Run Depreciation', source: '/assets/run-depreciation' },
        ],
      },
      
    ],
  },
  {
    name: 'Bank',
    subItemGroups: [
      {
        name: 'Bank Management',
        items: [
          {
            name: 'Currency ',
            source: '/bank/currency',
          },
          { name: 'Bank Vouchers', source: '/bank/bank-vouchers' },
          {
            name: 'Bank Reconciliation',
            source: '/bank/bank-reconciliation',
          },
          {
            name: 'Bank Reconciliation Report',
            source: '/bank/bank-reconciliation-report',
          },
          {
            name: 'Bank Transactions',
            source: '/bank/bank-transactions',
          },
          {
            name: 'Automatic Reconciliation',
            source: '/bank/automatic-reconciliation',
          },
          { name: 'Check Print', source: '/bank/check-print' },
          { name: 'Bank Balances', source: '/bank/bank-balances' },
        ],
      },
    ],
  },
  {
    name: 'Budget',
    subItemGroups: [
      {
        name: 'Budget Management',
        items: [
          { name: 'Create Budget', source: '/budget/create-budget' },
          { name: 'Budget Settings', source: '/budget/budget-settings' },
          { name: 'View Budget', source: '/budget/view-budget' },
        ],
      },
    ],
  },
  {
    name: 'Reports',
    subItemGroups: [
      {
        name: 'Financial Reports',
        items: [
          { name: 'Trial Balance', source: '/reports/trial-balance' },
          {
            name: 'Profit and Loss Accounts',
            source: '/reports/profit-loss',
          },
          { name: 'Balance Sheet', source: '/reports/balance-sheet' },
        ],
      },
      {
        name: 'Statement Reports',
        items: [
          {
            name: 'Cash Flow Statement',
            source: '/reports/cash-flow-statement',
          },
          {
            name: 'Cost Center Summary',
            source: '/reports/cost-center-summary',
          },
          {
            name: 'Department Summary',
            source: '/reports/department-summary',
          },
          {
            name: 'Profit and Loss',
            source: '/reports/profit-and-loss',
          },
        ],
      },
      {
        name: 'Ledger Reports',
        items: [
          { name: 'Bank Ledger', source: '/reports/bank-ledger' },
          { name: 'Customer Ledger', source: '/reports/customer-ledger' },
          { name: 'General Ledger', source: '/reports/general-ledger' },
          { name: 'Partner Ledger', source: '/reports/partner-ledger' },
        ],
      },

      {
        name: 'Other Reports',
        items: [
          {
            name: 'Cash Position',
            source: '/reports/cash-position',
          },
          {
            name: 'Bank and Cash Reports',
            source: '/reports/bank-cash-reports',
          },
          {
            name: 'Fund Flow Statement',
            source: '/reports/fund-flow-statement',
          },
          {
            name: 'Budget Vs Actual Reports',
            source: '/reports/budget-vs-actual',
          },
        ],
      },
    ],
  },
  {
    name: 'Settings',
    subItemGroups: [
      {
        name: 'Admin',
        items: [
          { name: 'Create User', source: '/settings/create-user' },
          { name: 'Users List', source: '/settings/users-list' },
        ],
      },
      {
        name: 'General Settings',
        items: [
          { name: 'Company', source: '/settings/company' },
          {
            name: 'Chart of Accounts',
            source: '/settings/chart-of-accounts',
          },
          { name: 'Currencies', source: '/settings/currencies' },
          { name: 'Res Partners', source: '/settings/res-partner' },
          { name: 'Department', source: '/settings/department' },
        ],
      },
      {
        name: 'Financial Settings',
        items: [
          { name: 'Cost Centers', source: '/settings/cost-centers' },
          { name: 'Internal Orders', source: '/settings/internal-orders' },
          { name: 'Bank Accounts', source: '/settings/bank-accounts' },
          { name: 'Cash Accounts', source: '/settings/cash-accounts' },
          { name: 'Level Entry', source: '/settings/level-entry' },
        ],
      },
      {
        name: 'Other Settings',
        items: [
          { name: 'Locations', source: '/settings/locations' },
          {
            name: 'Withholding Taxes',
            source: '/settings/withholding-taxes',
          },
          { name: 'Financial Year', source: '/settings/financial-year' },
          { name: 'Number Series', source: '/settings/number-series' },
          { name: 'Exchange', source: '/settings/exchange' },
        ],
      },
    ],
  },
]

export const BANGLADESH_BANKS = [
  { id: '1', name: 'Bangladesh Bank' },
  { id: '2', name: 'Standard Chartered Bank' },
  { id: '3', name: 'Dutch-Bangla Bank Limited' },
  { id: '4', name: 'BRAC Bank Limited' },
  { id: '5', name: 'Eastern Bank Limited' },
  { id: '6', name: 'Social Islami Bank Limited' },
  { id: '7', name: 'Islami Bank Bangladesh Limited' },
  { id: '8', name: 'Pubali Bank Limited' },
  { id: '9', name: 'United Commercial Bank Limited' },
  { id: '10', name: 'City Bank Limited' },
  { id: '11', name: 'Jamuna Bank Limited' },
  { id: '12', name: 'Sonali Bank Limited' },
  { id: '13', name: 'AB Bank Limited' },
  { id: '14', name: 'Mercantile Bank Limited' },
  { id: '15', name: 'Mutual Trust Bank Limited' },
]

export const CURRENCY_ITEMS = [
  {
    currencyId: 1,
    currency: 'BDT',
  },
  {
    currencyId: 2,
    currency: 'USD',
  },
  {
    currencyId: 3,
    currency: 'EUR',
  },
]
