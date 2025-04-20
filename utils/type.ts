import { isLastDayOfMonth } from 'date-fns'
import { locationSchema } from '@/api/company-api'
import { z } from 'zod'
import exp from 'constants'
import { de } from 'date-fns/locale'

// export interface User {
//   userId: number
//   username: string
//   roleId: number
//   roleName: string
//   userCompanies: UserCompany[]
// }

export interface UserCompany {
  userId: number
  companyId: number
}

export interface Company {
  companyId: number
  address: string
  companyName: string
}

export interface CompanyFromLocalstorage {
  company: {
    companyId: number
    companyName: string
  }
}

export interface SubItem {
  name: string
  source: string
}

export interface SubItemGroup {
  name: string
  items: SubItem[]
}

export interface MenuItem {
  name: string
  subItemGroups: SubItemGroup[]
}

export type LocationData = z.infer<typeof locationSchema>

export interface LocationFromLocalstorage {
  location: {
    locationId: number
    address: string
    companyId: number
  }
}

export const resPartnerSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Name is required'),
  companyName: z.string().optional().nullable(),
  type: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  website: z.union([z.string().url(), z.string().length(0)]).optional(),
  isCompany: z.boolean().optional(),
  vat: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  zip: z.string().optional(),
  active: z.boolean().optional(),
  creditLimit: z.number().nonnegative().optional(),
  customerRank: z.number().nonnegative().optional(),
  supplierRank: z.number().nonnegative().optional(),
  comment: z.string().optional(),
  createdBy: z.number().optional(),
  updatedBy: z.number().optional(),
})

export type ResPartner = z.infer<typeof resPartnerSchema> & {
  id: number
  companyId?: number
  createdAt?: string
  updatedAt?: string
}

export type ResPartnerCreate = Omit<
  ResPartner,
  'id' | 'createdBy' | 'updatedBy' | 'createdAt' | 'updatedAt'
>
export type ResPartnerUpdate = Omit<
  ResPartner,
  'id' | 'createdBy' | 'createdAt' | 'updatedAt'
>

export type Period = {
  periodId: number
  yearId: number
  periodName: string
  startDate: Date
  endDate: Date
  isOpen: boolean
  createdAt: Date
  updatedAt: Date
  createdBy: number
}

export const updatePostingPeriodsSchema = z.object({
  postingIds: z.array(z.number().positive()).nonempty(),
  isOpen: z.boolean(),
})

//bank account type
export const bankAccountSchema = z.object({
  id: z.number(),
  accountName: z
    .string()
    .min(2, 'Account name must be at least 2 characters.')
    .max(100, 'Account name must not exceed 100 characters.'),
  accountNumber: z
    .string()
    .min(5, 'Account number must be at least 5 characters.')
    .max(50, 'Account number must not exceed 50 characters.'),
  bankName: z
    .string()
    .min(2, 'Bank name must be at least 2 characters.')
    .max(100, 'Bank name must not exceed 100 characters.'),
  branchName: z
    .string()
    .max(100, 'Branch name must not exceed 100 characters.')
    .optional(),
  ifscCode: z
    .string()
    .max(20, 'IFSC code must not exceed 20 characters.')
    .optional()
    .nullable(),
  swiftCode: z
    .string()
    .max(20, 'SWIFT code must not exceed 20 characters.')
    .optional()
    .nullable(),
  currencyId: z.string().max(36, 'Currency ID must not exceed 36 characters'),
  accountType: z.enum(['Savings', 'Current', 'Overdraft', 'Fixed']),
  openingBalance: z
    .number()
    .nonnegative('Opening balance must be a non-negative number.')
    .multipleOf(0.01, 'Opening balance must have at most 2 decimal places.'),
  validityDate: z
    .string()
    .optional()
    .transform((str) => (str ? new Date(str) : undefined)),
  assetDetails: z
    .string()
    .max(255, 'Asset details must not exceed 255 characters')
    .optional()
    .nullable(),
  isActive: z.boolean(),
  isReconcilable: z.boolean(),
  glAccountId: z.number(),
  bankCode: z
    .string()
    .max(50, 'Bank code must not exceed 50 characters')
    .optional()
    .nullable(),
  integrationId: z
    .string()
    .max(36, 'Integration ID must not exceed 36 characters')
    .optional()
    .nullable(),
  notes: z.string().max(500, 'Notes must not exceed 500 characters').optional(),
  createdBy: z.number(),
  updatedBy: z.number().optional(),
})

export type BankAccount = z.infer<typeof bankAccountSchema> & {
  createdAt?: string
  updatedAt?: string
}

export const createBankAccountSchema = z.object({
  accountName: z
    .string()
    .min(2, 'Account name must be at least 2 characters.')
    .max(100, 'Account name must not exceed 100 characters.'),
  accountNumber: z
    .string()
    .min(5, 'Account number must be at least 5 characters.')
    .max(50, 'Account number must not exceed 50 characters.'),
  bankName: z
    .string()
    .min(2, 'Bank name must be at least 2 characters.')
    .max(100, 'Bank name must not exceed 100 characters.'),
  branchName: z
    .string()
    .max(100, 'Branch name must not exceed 100 characters.')
    .optional(),
  ifscCode: z
    .string()
    .max(20, 'IFSC code must not exceed 20 characters.')
    .optional()
    .nullable(),
  swiftCode: z
    .string()
    .max(20, 'SWIFT code must not exceed 20 characters.')
    .optional()
    .nullable(),
  currencyId: z.string().max(36, 'Currency ID must not exceed 36 characters'),
  accountType: z.enum(['Savings', 'Current', 'Overdraft', 'Fixed']),
  openingBalance: z
    .number()
    .nonnegative('Opening balance must be a non-negative number.')
    .multipleOf(0.01, 'Opening balance must have at most 2 decimal places.'),
  validityDate: z
    .string()
    .optional()
    .transform((str) => (str ? new Date(str) : undefined)),
  assetDetails: z
    .string()
    .max(255, 'Asset details must not exceed 255 characters')
    .optional()
    .nullable(),
  isActive: z.boolean(),
  isReconcilable: z.boolean(),
  glAccountId: z.number(),
  bankCode: z
    .string()
    .max(50, 'Bank code must not exceed 50 characters')
    .optional()
    .nullable(),
  integrationId: z
    .string()
    .max(36, 'Integration ID must not exceed 36 characters')
    .optional()
    .nullable(),
  notes: z.string().max(500, 'Notes must not exceed 500 characters').optional(),
  createdBy: z.number(),
  updatedBy: z.number().optional(),
})

export type CreateBankAccount = z.infer<typeof createBankAccountSchema> & {
  createdAt?: string
  updatedAt?: string
}

export type BankAccountCreate = Omit<
  BankAccount,
  'id' | 'createdBy' | 'updatedBy' | 'createdAt' | 'updatedAt'
>
export type BankAccountUpdate = Omit<
  BankAccount,
  'id' | 'createdBy' | 'createdAt' | 'updatedAt'
>

//financial year zod Validation

export const createFinancialYearSchema = z
  .object({
    startdate: z.coerce.date(), // Converts input to a Date object
    enddate: z.coerce.date(), // Converts input to a Date object
    yearname: z.string().min(1, 'Year name is required'), // Must not be empty
    isactive: z.boolean().default(true), // Optional, defaults can be handled elsewhere
    createdby: z.number().int().positive(), // Must be a positive integer
  })
  .refine(
    (data) => {
      // Ensure start date is before end date
      if (data.startdate >= data.enddate) {
        return false
      }
      if (data.startdate.getDate() !== 1) {
        return false
      }

      // Check if end date is the last day of a month
      if (!isLastDayOfMonth(data.enddate)) {
        return false
      }

      return true
    },
    (data) => {
      if (data.startdate >= data.enddate) {
        return {
          message: 'The financial year must start before it ends',
          path: ['startdate', 'enddate'],
        }
      }
      if (data.startdate.getDate() !== 1) {
        return {
          message: 'The start date must be the first day of a month',
          path: ['startdate'],
        }
      }
      if (!isLastDayOfMonth(data.enddate)) {
        return {
          message: 'The end date must be the last day of a month',
          path: ['enddate'],
        }
      }
      return {
        message: 'The financial year must span exactly 12 months',
        path: ['startdate'],
      }
    }
  )

export interface CodeGroup {
  id: string
  code: string
  isExpanded?: boolean
  subgroups?: CodeGroup[]
}

export interface ParentCode {
  code: string
  name: string
}

// Zod schema for Chart of Accounts

export const chartOfAccountSchema = z.object({
  name: z.string().max(255).min(1, 'Account type is required'),
  code: z
    .string()
    .min(1, 'Code is required')
    .max(64, 'Maximum 64 characters allowed'),
  accountType: z
    .string()
    .min(1, 'Account type is required')
    .max(64, 'Maximum 64 characters allowed'),
  parentAccountId: z.number().int(),
  parentName: z.string().min(1, 'Parent account ID is required').optional(),
  currencyId: z.number().int().positive('Currency is required'),
  isReconcilable: z.boolean().default(false),
  withholdingTax: z.boolean().default(false),
  budgetTracking: z.boolean().default(false),
  isActive: z.boolean().default(true),
  isGroup: z.boolean().default(false),
  isCash: z.boolean().default(true),
  isBank: z.boolean().default(false),
  cashTag: z.string(),
  createdBy: z.number().int().positive(),
  notes: z.string(),
})

export type ChartOfAccount = z.infer<typeof chartOfAccountSchema>
//Zod schema for Accounts ( Chart of Accounts with Parent Code)
export const AccountsHeadSchema = z.object({
  accountId: z.number().int().positive(),
  // code: z.string(),
  // name: z.string(),
  // accountType: z.string(),
  // parentCode: z.string().nullable(),
  // parentName: z.string().nullable(),
  // isReconcilable: z.boolean(),
  // notes: z.string(),
  // isGroup: z.boolean(),
  // isCash: z.boolean(),
  name: z.string().max(255).min(1, 'Account type is required'),
  code: z
    .string()
    .min(1, 'Code is required')
    .max(64, 'Maximum 64 characters allowed'),
  accountType: z
    .string()
    .min(1, 'Account type is required')
    .max(64, 'Maximum 64 characters allowed'),
  parentAccountId: z.number().int(),
  parentName: z.string().min(1, 'Parent account ID is required').optional(),
  currencyId: z.number().int().positive('Currency is required'),
  isReconcilable: z.boolean().default(false),
  withholdingTax: z.boolean().default(false),
  budgetTracking: z.boolean().default(false),
  isActive: z.boolean().default(true),
  isGroup: z.boolean().default(false),
  isCash: z.boolean().default(true),
  isBank: z.boolean().default(false),
  cashTag: z.string(),
  createdBy: z.number().int().positive(),
  notes: z.string(),
})
export type AccountsHead = z.infer<typeof AccountsHeadSchema>
//Zod schema for Accounts ( Chart of Accounts with Parent Code)

//Cash Voucher
export interface FormData {
  date: string
  company: string
  location: string
  currency: string
}

export interface Voucher {
  voucherno: string
  companyname: string
  location: string
  currency: string
  journaltype: string
  accountName: string
  costCenter: string
  department: string
  partnerName: string
  notes: string
  totalamount: string
  state: string
  date: string
}

export interface DetailRow {
  id: number
  type: string
  accountName: string
  costCenter: string
  department: string
  partnerName: string
  remarks: string
  amount: string
  isDraft: boolean
}

export interface User {
  userId: number
  username: string
  roleId: number
  roleName: string
  userCompanies: Company[]
  userLocations: Location[]
  voucherTypes: string[]
}

export interface Location {
  locationId: number
  address: string
  companyId: number
}

export interface FormStateType {
  companies: any[]
  locations: any[]
  bankAccounts: any[]
  chartOfAccounts: any[]
  filteredChartOfAccounts: any[]
  costCenters: any[]
  partners: any[]
  departments: any[]
  formType: 'Credit' | 'Debit'
  selectedBankAccount: any | null
  status: 'Draft' | 'Posted'
}

//journal entry
const JournalEntrySchema = z.object({
  voucherNo: z.string().nullable().optional(), // Will calcualte automatically on backend
  date: z.string(),
  journalType: z.string(),
  state: z.number().default(0),
  companyId: z.number(),
  locationId: z.number(),
  currencyId: z.number(),
  amountTotal: z.number(),
  notes: z.string().optional(),
  payTo: z.string().nullable().optional(),
  periodid: z.number().nullable().optional(), // Will calcualte automatically on backend
  createdBy: z.number(),
})

const JournalDetailSchema = z.object({
  voucherId: z.number().optional(), //Will get from Master Data
  accountId: z.number(),
  costCenterId: z.number().nullable().optional(),
  departmentId: z.number().nullable().optional(),
  debit: z.number(),
  credit: z.number(),
  analyticTags: z.string().nullable().optional(),
  taxId: z.number().nullable().optional(),
  resPartnerId: z.number().nullable().optional(),
  bankaccountid: z.number().nullable().optional(),
  notes: z.string().optional(),
  type: z.string().optional(),
  createdBy: z.number(),
  payTo: z.string().nullable().optional(),
})

export const JournalEntryWithDetailsSchema = z.object({
  journalEntry: JournalEntrySchema,
  journalDetails: z.array(JournalDetailSchema),
})

export type JournalEntryWithDetails = z.infer<
  typeof JournalEntryWithDetailsSchema
>
//Voucher Type Enum
export enum VoucherTypes {
  CashVoucher = 'Cash Voucher',
  BankVoucher = 'Bank Voucher',
  JournalVoucher = 'Journal Voucher',
  ContraVoucher = 'Contra Voucher',
}
//For Sending Journal Query
export const JournalQuerySchema = z.object({
  date: z.string(),
  companyId: z.array(z.number()),
  locationId: z.array(z.number()),
  voucherType: z.nativeEnum(VoucherTypes).optional(),
})
export type JournalQuery = z.infer<typeof JournalQuerySchema>

//For holding Journal Deta
export const JournalResultSchema = z.object({
  voucherid: z.number(),
  voucherno: z.string(),
  date: z.string(),
  journaltype: z.string(),
  state: z.number(),
  companyname: z.string().nullable(),
  location: z.string().nullable(),
  currency: z.string().nullable(),
  totalamount: z.number(),
  notes: z.string().nullable(),
  id: z.number(),
  accountsname: z.string(),
  costcenter: z.string().nullable(),
  department: z.string().nullable(),
  debit: z.number().default(0),
  credit: z.number().default(0),
  partner: z.number().nullable(),
  bankaccount: z.number().nullable(),
  detail_notes: z.string().nullable(),
})
export type JournalResult = z.infer<typeof JournalResultSchema>

//department
export const departmentSchema = z.object({
  departmentName: z.string().min(1, 'Department name is required'),
  budget: z.number().optional(),
  companyCode: z.number().optional(),
  isActive: z.boolean().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  actual: z.number().optional(),
  createdBy: z.number(),
})
export type Department = z.infer<typeof departmentSchema>
export const departmentsArraySchema = z.array(departmentSchema)

export const getDepartmentSchema = z.object({
  departmentID: z.number(),
  departmentName: z.string().min(1, 'Department name is required'),
  budget: z.number().optional(),
  companyCode: z.number().optional(),
  isActive: z.boolean().optional(),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
  actual: z.number().optional(),
})
export type GetDepartment = z.infer<typeof getDepartmentSchema>

//cost center
const costCenterSchema = z.object({
  costCenterId: z.number().min(1, 'Cost center id is required'),
  costCenterName: z.string().min(1, 'Cost center name is required'),
  costCenterDescription: z.string(),
  budget: z.string(),
  actual: z.string().optional(),
  currencyCode: z.enum(['USD', 'BDT', 'EUR', 'GBP']),
  isActive: z.boolean(),
  isVehicle: z.boolean(),
  createdBy: z.number().optional(),
})

export const activateDeactivateCostCenterSchema = z.object({
  costCenterId: z.number().min(1, 'Cost center id is required'),
})
export type CostCenter = z.infer<typeof costCenterSchema>
export const costCentersArraySchema = z.array(costCenterSchema)
export type CostCenterActivateDeactivate = z.infer<
  typeof activateDeactivateCostCenterSchema
>

//Voucher Type by id
const VoucherSchemaById = z.object({
  voucherid: z.number(),
  voucherno: z.string(),
  date: z.string(),
  journaltype: z.string(),
  state: z.number(),
  companyname: z.string(),
  location: z.string(),
  currency: z.string(),
  totalamount: z.number(),
  notes: z.string(),
  id: z.number(),
  accountsname: z.string(),
  costcenter: z.string().nullable(),
  createdby: z.number(),
  department: z.any().nullable(), // If you know the type, replace `z.any()` with the correct type
  debit: z.number(),
  credit: z.number(),
  partner: z.any().nullable(), // If you know the type, replace `z.any()` with the correct type
  bankaccount: z.any().nullable(), // If you know the type, replace `z.any()` with the correct type
  detail_notes: z.string(),
  payTo: z.string().nullable(),
})

export type VoucherById = z.infer<typeof VoucherSchemaById>

const bankAccountDateRangeSchema = z.object({
  bankaccount: z.number(),
  fromdate: z.string(),
  todate: z.string(),
})

export type BankAccountDateRange = z.infer<typeof bankAccountDateRangeSchema>

//edit journal notes
export const DetailNoteSchema = z.object({
  id: z.number(),
  notes: z.string(),
})

export const JournalNotesSchema = z.object({
  id: z.number(),
  notes: z.string(),
})

export type JournalNotes = z.infer<typeof JournalNotesSchema>
export type DetailNote = z.infer<typeof DetailNoteSchema>

//asset
export const createAssetSchema = z.object({
  asset_name: z
    .string()
    .min(2, 'Asset name must be at least 2 characters.')
    .max(255, 'Asset name must not exceed 255 characters.'),
  category_id: z.number().int('Category ID must be an integer.'),
  purchase_date: z.coerce.date(),
  purchase_value: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Invalid decimal format for purchase value.'),
  current_value: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Invalid decimal format for current value.')
    .optional(),
  salvage_value: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Invalid decimal format for salvage value.')
    .optional(),
  depreciation_method: z.enum(['Straight Line', 'Diminishing Balance']),
  useful_life_years: z
    .number()
    .int('Useful life must be an integer.')
    .optional(),
  status: z.enum(['Active', 'Disposed']).default('Active'),
  company_id: z.number().int('Company ID must be an integer.'),
  location_id: z.number().int('Location ID must be an integer.').optional(),
  department_id: z.number().int('Department ID must be an integer.').optional(),
  cost_center_id: z
    .number()
    .int('Cost Center ID must be an integer.')
    .optional(),
  depreciation_rate: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Invalid decimal format for depreciation rate.')
    .optional(),
  created_by: z.number().int('Created by must be an integer.'),
})

export type CreateAssetData = z.infer<typeof createAssetSchema>

export const getAssetSchema = z.object({
  id: z.bigint(), // For bigint
  name: z
    .string()
    .min(2, 'Asset name must be at least 2 characters.')
    .max(255, 'Asset name must not exceed 255 characters.'),
  type: z.number().int('Category ID must be an integer.'),
  purchaseDate: z.string(),
  purchaseValue: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Invalid decimal format for purchase value.'),
  currentValue: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Invalid decimal format for current value.')
    .optional(),
  salvageValue: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Invalid decimal format for salvage value.')
    .optional(),
  depreciationMethod: z.enum(['Straight Line', 'Diminishing Balance']),
  usefulLifeYears: z.number().int('Useful life must be an integer.').optional(),
  status: z.enum(['Active', 'Disposed']).default('Active'),
  company: z.number().int('Company ID must be an integer.'),
  companyId: z.number().int('Company ID must be an integer.'),
  locationId: z.number().int('Location ID must be an integer.').optional(),
  location: z.number().int('Location ID must be an integer.').optional(),
  department: z.number().int('Department ID must be an integer.').optional(),
  costCenter: z.number().int('Cost Center ID must be an integer.').optional(),
  departmentId: z.number().int('Department ID must be an integer.').optional(),
  costCenterId: z.number().int('Cost Center ID must be an integer.').optional(),
  accountId: z.number().int('Account ID must be an integer.'),
  depreciationRate: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Invalid decimal format for depreciation rate.')
    .optional(),
  created_by: z.number().int('Created by must be an integer.'),
})

export type GetAssetData = z.infer<typeof getAssetSchema>

//asset-category
export const createAssetCategorySchema = z.object({
  category_name: z
    .string()
    .min(2, 'Category name must be at least 2 characters.')
    .max(255, 'Category name must not exceed 255 characters.'),
  depreciation_rate: z
    .string()
    .regex(/^\d+(\.\d+)?$/, { message: 'Invalid decimal format' }),
  account_code: z.number().int('Account code must be an integer.'),
  depreciation_account_code: z
    .number()
    .int('Depreciation account code must be an integer.'),
  created_by: z.number().int('Created by must be an integer.'),
})

export type CreateAssetCategoryData = z.infer<typeof createAssetCategorySchema>

export const createAssetDepreciationSchema = z.object({
  company_id: z.number().int('Company ID must be an integer.'),
  depreciation_date: z.string(),
})

export type CreateAssetDepreciationData = z.infer<
  typeof createAssetDepreciationSchema
>

const assetDepreciationReportSchema = z.object({
  category_name: z.string(),
  rate: z.string(),
  opening_balance: z.string(),
  addition_during_period: z.string(),
  closing_balance: z.string(),
  dep_opening: z.string(),
  dep_during_period: z.string(),
  dep_closing: z.string(),
  written_down_value: z.string(),
})

export type AssetDepreciationReportType = z.infer<
  typeof assetDepreciationReportSchema
>

export interface AssetCategoryType extends CreateAssetCategoryData {
  category_id: number
  category_name: string
  account_code: number
  depreciation_account_code: number
  created_by: number
  account: string
  depreciation_account: string
  depreciation_rate: string
  created_time: string
  updated_by: number
  updated_time: string
}

// Trial Balance type
export interface TrialBalanceData {
  id: number
  code: string
  name: string
  level: number
  parentCode: string | null
  initialDebit: number
  initialCredit: number
  initialBalance: number
  periodDebit: number
  periodCredit: number
  closingDebit: number
  closingCredit: number
  closingBalance: number
  children: TrialBalanceData[] // Nested structure for sub-items
}

//general ledger
export interface GeneralLedgerType {
  voucherid: number
  voucherno: string
  accountname: string
  debit: number
  credit: number
  accountsdetails: number
  notes: string
  partner: string
  coscenter: string
  department: string
}

export interface PartnerLedgerType {
  voucherid: number
  voucherno: string
  accountname: string
  debit: number
  credit: number
  accountsdetails: number
  notes: string
  partner: string
  coscenter: string
  department: string
}

//cash flow statement type
export interface CashflowStatement {
  debit: number
  credit: number
  cashflowTag: string
}

// cost center summmary backend zod schema
export const CostCenterSummarySchema = z.object({
  fromDate: z.string(),
  endDate: z.string(),
  costCenterIds: z.string().transform((val) => val.split(',').map(Number)),
  companyId: z.string(),
})

export type CostCenterSummarySchemaType = z.infer<
  typeof CostCenterSummarySchema
>

// cost center summary get data type
export interface CostCenterSummaryType {
  costCenterId: number
  costCenterName: string
  accountId: number
  accountName: string
  totalDebit: number
  totalCredit: number
}

//department summary zod
export const DepartmentSummarySchema = z.object({
  departmentId: z.number(),
  departmentName: z.string(),
  accountId: z.number(),
  accountName: z.string(),
  totalDebit: z.number(),
  totalCredit: z.number(),
})

//filter by department summary
export const DepartmentSummaryfilterSchema = z.object({
  fromDate: z.string(),
  endDate: z.string(),
  departmentIds: z.string().transform((val) => val.split(',').map(Number)),
  companyId: z.string(),
})

//deaprtment summary type
export type DepartmentSummaryType = z.infer<typeof DepartmentSummarySchema>
export type DepartmentSummaryfilterType = z.infer<
  typeof DepartmentSummaryfilterSchema
>

//Profit and Loss filter zod
export const ProfitAndLossFilterSchema = z.object({
  fromDate: z.string(),
  endDate: z.string(),
  companyId: z.string(),
})

export const ProfitAndLossSchema = z.object({
  title: z.string(),
  value: z.number(),
  position: z.number(),
  negative: z.boolean().nullable(), // Allows `null` or `boolean` values
})

export type ProfitAndLossFilterType = z.infer<typeof ProfitAndLossFilterSchema>
export type ProfitAndLossType = z.infer<typeof ProfitAndLossSchema>

//level
export interface LevelType {
  title: string
  type?: 'Calculated Field' | 'COA Group'
  COA_ID?: number | null
  position: number
  formula?: string
  negative: boolean
}

// IouRecord loan schema zod
export const IouRecordGetSchema = z.object({
  iouId: z.number(),
  amount: z.number().positive(),
  adjustedAmount: z.number().default(0),
  employeeId: z.number().int().positive(),
  dateIssued: z.coerce.date(),
  dueDate: z.date(),
  status: z.enum(['active', 'inactive']).default('active'),
  notes: z.string().optional(),
  createdBy: z.number().int().positive(),
})

export type IouRecordGetType = z.infer<typeof IouRecordGetSchema>

// IouRecord loan create  schema zod
export const IouRecordCreateSchema = z.object({
  amount: z.number().positive(),
  adjustedAmount: z.number().default(0),
  employeeId: z.number().int().positive(),
  dateIssued: z.coerce.date(),
  dueDate: z.coerce.date(),
  status: z.enum(['active', 'inactive']).default('active'),
  notes: z.string().optional(),
  createdBy: z.number().int().positive(),
})

export type IouRecordCreateType = z.infer<typeof IouRecordCreateSchema>

//IouAdjustmentCreateSchema
export const IouAdjustmentCreateSchema = z.object({
  iouId: z.number().int().positive(),
  amountAdjusted: z.number().default(0),
  adjustmentDate: z.coerce.date(),
  adjustmentType: z.string().max(50),
  notes: z.string().optional(),
})

export type IouAdjustmentCreateType = z.infer<typeof IouAdjustmentCreateSchema>

//employee master employee zod schema
export const EmployeeSchema = z.object({
  id: z.number(),
  employeeId: z.string(),
  employeeName: z.string(),
  employeeContact: z.string().nullable(),
  email: z.string().email(),
  department: z.string(),
  status: z.enum(['active', 'inactive']),
})

// employee master employeee TypeScript type
export type Employee = z.infer<typeof EmployeeSchema>

//Cash Position Bank Balance report type
export interface BankBalance {
  companyId: string
  companyName: string
  BankAccount: string
  AccountType: string
  openingBalance: number
  debitSum: number
  creditSum: number
  closingBalance: number
}

//cash position cash balance report type

export interface CashBalance {
  companyId: string
  companyName: string
  locationName: string
  openingBalance: number
  debitSum: number
  creditSum: number
  closingBalance: number
}

export const exchangeSchema = z.object({
  exchangeDate: z.coerce.date(),
  baseCurrency: z.number().int(),
  rate: z.number(),
})

export type ExchangeType = z.infer<typeof exchangeSchema>

export const currencySchema = z.object({
  currencyId: z.number(),
  currencyCode: z.string(),
  currencyName: z.string(),
  baseCurrency: z.boolean(),
})

export type CurrencyType = z.infer<typeof currencySchema>

// create budget items schema zod
const CreateBudgetItemsSchema = z.object({
  budgetId: z.number().int(),
  accountId: z.number().int(),
  amount: z.number().nullable().optional(),
  createdBy: z.number().int().nullable().optional(),
  actual: z.number().int().nullable().optional(),
})

export type CreateBudgetItemsType = z.infer<typeof CreateBudgetItemsSchema>

//create budget master schema zod
export const CreateBudgetMasterSchema = z.object({
  budgetName: z.string().min(1).max(80),
  companyId: z.number().int(),
  fromDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  toDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  active: z.boolean(),
  locked: z.boolean(),
  createdBy: z.number().int(),
})
export type CreateBudgetMasterType = z.infer<typeof CreateBudgetMasterSchema>

//get master budget type
export interface MasterBudgetType {
  budgetId: number
  name: string
  companyId: number
  fromDate: string // ISO date string
  toDate: string // ISO date string
  locked: boolean
}

// get budget items type
export interface BudgetItems {
  id: number
  budgetId: number
  name: string
  budgetAmount: number
  accountId: number
}

//payment requisition
export enum PurchaseOrderStatus {
  PurchaseOrder = 'Purchase Order',
  GRNCompleted = 'GRN Completed',
  InvoiceCreated = 'Invoice Created',
  PaymentMade = 'Payment Made',
}

export const purchaseOrderMasterSchema = z.object({
  attn: z.string().nullable().optional(),
  poNo: z.string(),
  poDate: z.coerce.date(),
  termsAndConditions: z.string().nullable().optional(),
  totalAmount: z.number(),
  preparedBy: z.string().nullable().optional(),
  checkedBy: z.string().nullable().optional(),
  authorizedBy: z.string().nullable().optional(),
  reqNo: z.string().nullable().optional(),
  status: z.nativeEnum(PurchaseOrderStatus),
  companyId: z.number().int(),
  vendorCode: z.string(),
  createdBy: z.number(),
})

// Zod schema for PurchaseOrderDetails
export const purchaseOrderDetailsSchema = z.object({
  itemCode: z.string(),
  unit: z.string().nullable().optional(),
  quantity: z.number(),
  rate: z.number(),
})

// Zod schema for PurchaseEntryWithDetailsSchema
export const purchaseEntrySchema = z.object({
  purchaseMaster: purchaseOrderMasterSchema,
  purchaseDetails: z.array(purchaseOrderDetailsSchema),
})

export type PurchaseEntryType = z.infer<typeof purchaseEntrySchema>

export interface GetPaymentOrder {
  id: number
  poNo: string
  PurDate: string
  purAttn: string
  reqNo: string
  vendorName: string
  amount: string
  preparedBy: string
  checkedBy: string
  authorizedBy: string
  companyName: string
  status: string
}

//approve invoice
export const approveInvoiceSchema = z.object({
  invoiceId: z.string(),
  approvalStatus: z.string(),
  approvedBy: z.string(),
  poId: z.string(),
})

export type ApproveInvoiceType = z.infer<typeof approveInvoiceSchema>

//create invoice
export const createInvoiceSchema = z.object({
  poId: z.number().int().positive(),
  vendorId: z.number().int().positive(),
  invoiceNumber: z.string().max(50),
  invoiceDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .nullable(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .nullable(),
  currency: z.string().max(10),
  totalAmount: z.number().nonnegative(),
  vatAmount: z.number().nonnegative().optional(),
  taxAmount: z.number().nonnegative().optional(),
  tdsAmount: z.number().nonnegative().optional(),
  discountAmount: z.number().nonnegative().optional(),
  paymentStatus: z.enum(['Pending', 'Partially Paid', 'Paid', 'Cancelled']),
  paymentDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .nullable(),
  approvalStatus: z.enum(['Pending', 'Approved', 'Rejected']),
  approvedBy: z.number().int().positive().optional().nullable(),
  attachmentUrl: z.string().url().optional(),
  createdBy: z.number(),
})

export type CreateInvoiceType = z.infer<typeof createInvoiceSchema>

export const requisitionAdvanceSchema = z.object({
  requisitionNo: z.string().max(50), // Max length of 50
  poId: z.number().int().positive(), // Must be a positive integer
  vendorId: z.number().int().positive(), // Must be a positive integer
  requestedBy: z.number().int().positive(), // Must be a positive integer
  createdBy: z.number().int().positive(), // Must be a positive integer
  checkName: z.string().max(255).optional(), // Optional string with max length 255
  requestedDate: z.coerce.date().optional(), // Auto-defaults to current date if missing
  advanceAmount: z.number().positive(), // Must be a positive number
  approvedAmount: z.number().min(0).optional(), // Cannot be negative, defaults to 0
  currency: z.string().max(10), // Currency as string (ISO code like "USD", "BDT")
  paymentStatus: z.enum(['PENDING', 'PAID', 'REJECTED']).default('PENDING'), // Enum validation
  approvalStatus: z
    .enum(['PENDING', 'APPROVED', 'REJECTED'])
    .default('PENDING'), // Enum validation
  approvedBy: z.number().int().positive().nullable().optional(), // Can be null if not yet approved
  approvedDate: z.coerce.date().nullable().optional(), // Can be null if not yet approved
  remarks: z.string().optional(), // Optional text
})

export type RequisitionAdvanceType = z.infer<typeof requisitionAdvanceSchema>

//approve advance
const approveAdvanceSchema = z.object({
  id: z.number(),
  reqno: z.string(),
  description: z.string().nullable(),
  poid: z.number().nullable(),
  vendorid: z.number().nullable(),
  vendorname: z.string(),
  requestedid: z.number(),
  requestedby: z.string(),
  requestedDate: z.string().datetime(),
  checkName: z.string().nullable(),
  approveamount: z.number().nullable(),
  advanceamount: z.number().nullable(),
  currency: z.string().nullable(),
  approvalStatus: z.string(),
  paymentStatus: z.string(),
  approvedid: z.number().nullable(),
  approvedby: z.string().nullable(),
  approvaldate: z.string().datetime().nullable(),
})

export type ApproveAdvanceType = z.infer<typeof approveAdvanceSchema>

//Get All Vehicle Type
export interface GetAllVehicleType {
  vehicleNo: number
  costCenter: number
  costCenterName: string
  description: string
  purchaseDate: string
  assetId: number
  employeeId: number
  employeeName: string
  user: number
}

//Create Vehicle zod schema
export const createVehicleSchema = z.object({
  costCenterId: z.number().int().nullable(),
  vehicleDescription: z.string().max(45).nullable(),
  purchaseDate: z.coerce.date().nullable(),
  assetId: z.number().int().nullable(),
  employeeId: z.number().int().nullable(),
})
export type CreateVehicleType = z.infer<typeof createVehicleSchema>

// Get GetVehicleConsumptionType

export interface GetVehicleConsumptionType {
  id: number
  vehicleId: number
  octConsumption: number
  gasConsumption: number
  totalConsumption: number
  kmrsPerLitr: number
  transDate: string // ISO date string
  createdBy: number
  createdAt: string // ISO date string
}

//Create createVehicleFuelConsumptionSchema
export const createVehicleFuelConsumptionSchema = z.object({
  vehicleId: z.number().int(),
  octConsumption: z.number().nullable(),
  gasConsumption: z.number().nullable(),
  totalConsumption: z.number().nullable(),
  kmrsPerLitr: z.number().nullable(),
  transDate: z.coerce.date(),
  createdBy: z.number().int(),
})

export type createVehicleFuelConsumptionType = z.infer<
  typeof createVehicleFuelConsumptionSchema
>

//bank reconciliation
export const bankReconciliationSchema = z.object({
  bankId: z.number().int(),
  voucherId: z.number().int().nullable(),
  checkNo: z.string().max(45).nullable(),
  amount: z.number().nullable(),
  type: z.string().max(45).nullable(),
  reconciled: z.number().int().min(0).max(1).nullable(),
  comments: z.string().max(45).nullable(),
  date: z.string().max(45).nullable(),
  reconcileId: z.boolean().nullable(),
})

export type BankReconciliationType = z.infer<
  typeof bankReconciliationSchema
> & { id: number }

//bank transaction
export const getBankTransactionSchema = z.object({
  id: z.number(),
  bankId: z.number(),
  date: z.string(),
  description: z.string(),
  amount: z.string(),
  currency: z.string(),
  status: z.string(),
  checkNo: z.string(),
  reconcileId: z.boolean().nullable(),
})

export type GetBankTransactionType = z.infer<typeof getBankTransactionSchema>

//fund position
const BalanceEntrySchema = z.object({
  date: z.string(),
  accountNumber: z.string().nullable(),
  accountHead: z.null(),
  balance: z.string().nullable(),
  companyName: z.string().nullable(),
})

// Define the schema for cash balance
const CashBalanceSchema = z.array(BalanceEntrySchema)

// Define the schema for bank balance
const BankBalanceSchema = z.array(z.array(BalanceEntrySchema))

// Define the main response schema
export const FundPositionSchema = z.object({
  cashBalance: CashBalanceSchema,
  BankBalance: BankBalanceSchema,
})

// Infer the TypeScript type from the schema
export type FundPositionType = z.infer<typeof FundPositionSchema>

//bank-transactions
export const createBankTransactionSchema = z.object({
  bankId: z.string().optional(),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
  description: z.string().optional(),
  amount: z.string(),
  currency: z.string(),
  status: z.enum(['Matched', 'Unmatched', 'Pending']).default('Pending'),
})

export type createBankTransactionType = z.infer<
  typeof createBankTransactionSchema
>

export const CreateElectricityMeterSchema = z.object({
  idelectricityMeterId: z.number().int().positive(),
  electricityMeterName: z.string().max(45),
  companyId: z.number().int(),
  meterType: z.number().int().default(0),
  costCenterId: z.number().int(),
  meterDescription: z.string().max(80),
  provAccountId: z.number().nonnegative(),
  accountId: z.number().nonnegative(),
})

export type CreateElectricityMeterType = z.infer<
  typeof CreateElectricityMeterSchema
>

//Get Electricity Meter
export interface GetElectricityMeterType {
  meterid: number
  meterName: string
  companyId: number
  companyName: string
  metertpe: number
  description: string
  costCenterid: number
  costCenterName: string
  provaccountId: number
  provaccountName: string
  accountid: number
  accountHead: string
}

//Get Bills get type
export interface GetElectricityBillType {
  id: number
  meterName: string
  billDate: string // Or Date if you prefer to handle it as a Date object
  amount: number
  payment: number
  description: string
}

//Create Electricity Bill Schema
export const CreateElectricityBillSchema = z.object({
  billId: z.number().int().positive(), // Primary key with auto-increment
  meterNo: z.number().int(), // Foreign key to electricity_meter
  billDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // Date in YYYY-MM-DD format, // Date in YYYY-MM-DD format
  amount: z.number(), // Double column for the amount
  payment: z.number().int().min(0).max(1), // Tinyint column for payment status (0 or 1)
})

export type CreateElectricityBillType = z.infer<
  typeof CreateElectricityBillSchema
>

// vehicle summary zod schema type
const VehicleSummarySchema = z.object({
  vehicleNo: z.number(),
  'Accounts Payable': z.string(), // Assuming it's a string because of the negative sign and decimal format
  'Barrett Kelley': z.string(),
  'Hashim England 1': z.string(),
  total_oct_consumption: z.null(),
  total_gas_consumption: z.null(),
  total_km: z.null(),
})

export type VehicleSummaryType = z.infer<typeof VehicleSummarySchema>

// Expense Data type
export interface GEtExpenseDataType {
  name: string
  groupName: string
  totalDebit: number
  totalCredit: number
  netExpense: number
  lastMonthDebit: number
  lastMonthCredit: number
  lastMonthNetExpense: number
}

//Get cost breakdown data type
export interface GetCostBreakdownType {
  financialTag: string
  balance: number
}

//Get cost breakdown data type
export interface GetCostBreakdownType {
  financialTag: string
  balance: number
}

//Get cost breakdown Details data type
export interface GetCostBreakdownDetailsType {
  name: string
  balance: number
}

//bank reconciliaton report
export const bankReconciliationReportSchema = z.object({
  dateRange: z.object({
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }),

  openingBalance: z.object({
    book: z.number(),
    bank: z.number(),
  }),

  reconciledAmount: z.string(), // String representation of a number

  unreconciledAmount: z.object({
    total: z.number(),
    breakdown: z.object({
      onlyInBooks: z.array(z.any()), // Empty array in the example
      onlyInBank: z.array(
        z.object({
          id: z.number(),
          date: z.string().datetime(), // ISO date string
          description: z.string(),
          amount: z.string(), // String representation of a number
          currency: z.string(),
          status: z.string(),
          checkNo: z.string(),
          unreconciledReason: z.string(),
        })
      ),
    }),
  }),

  closingBalance: z.object({
    book: z.string(),
    bank: z.string(),
  }),
})

export type BankReconciliationReportType = z.infer<
  typeof bankReconciliationReportSchema
>

//Get Trade Debtors Type
export interface GetTradeDebtorsType {
  partnerId: number
  partnerName: string
  companyName: string
  balanceCurrentYear: number
  balanceLastYear: number
}
