import { isLastDayOfMonth } from 'date-fns'
import { bankAccountSchema } from '@/api/bank-accounts-api'
import { locationSchema } from '@/api/company-api'
import { resPartnerSchema } from '@/api/res-partner-api'
import { z } from 'zod'

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

export type BankAccount = z.infer<typeof bankAccountSchema> & {
  createdAt?: string
  updatedAt?: string
}

export type ResPartner = z.infer<typeof resPartnerSchema> & {
  id: number
  companyId?: number
  createdAt?: string
  updatedAt?: string
}

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
  accountId: z.number().int().positive(),
  name: z.string().max(255),
  code: z.string().max(64),
  accountType: z.string().max(64),
  parentAccountId: z.number().int().positive(),
  parentName: z.string().optional(),
  currencyId: z.number().int().positive(),
  isReconcilable: z.boolean().default(false),
  withholdingTax: z.boolean().default(false),
  budgetTracking: z.boolean().default(false),
  isActive: z.boolean().default(true),
  isGroup: z.boolean().default(false),
  isCash: z.boolean().default(true),
  isBank: z.boolean().default(false),
  cashTag: z.string().nullable(),
  createdBy: z.number().int().positive(),
  notes: z.string(),
})

export type ChartOfAccount = z.infer<typeof chartOfAccountSchema>
//Zod schema for Accounts ( Chart of Accounts with Parent Code)
export const AccountsHeadSchema = z.object({
  accountId: z.number().int().positive(),
  code: z.string(),
  name: z.string(),
  accountType: z.string(),
  parentCode: z.string().nullable(),
  parentName: z.string().nullable(),
  isReconcilable: z.boolean(),
  notes: z.string(),
  isGroup: z.boolean(),
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
  voucherNo: string
  companyName: string
  location: string
  currency: string
  type: string
  accountName: string
  costCenter: string
  department: string
  partnerName: string
  remarks: string
  totalAmount: string
  status: string
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
  createdBy: z.number(),
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
  voucherType: z.nativeEnum(VoucherTypes),
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
  departmentID: z.number(),
  departmentName: z.string().min(1, 'Department name is required'),
  budget: z.number().optional(),
  currencyCode: z.number().optional(),
  isActive: z.boolean().optional(),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
  actual: z.number().optional(),
})
export type Department = z.infer<typeof departmentSchema>
export const departmentsArraySchema = z.array(departmentSchema)

//cost center
const costCenterSchema = z.object({
  costCenterId: z.number().min(1, 'Cost center id is required'),
  costCenterName: z.string().min(1, 'Cost center name is required'),
  costCenterDescription: z.string(),
  budget: z.number(),
  actual: z.number().optional(),
  currencyCode: z.enum(['USD', 'BDT', 'EUR', 'GBP']),
  isActive: z.boolean(),
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
  department: z.any().nullable(), // If you know the type, replace `z.any()` with the correct type
  debit: z.number(),
  credit: z.number(),
  partner: z.any().nullable(), // If you know the type, replace `z.any()` with the correct type
  bankaccount: z.any().nullable(), // If you know the type, replace `z.any()` with the correct type
  detail_notes: z.string(),
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
  location: z.number().int('Location ID must be an integer.').optional(),
  created_by: z.number().int('Created by must be an integer.'),
})

export type CreateAssetData = z.infer<typeof createAssetSchema>
export interface AssetType extends CreateAssetData {
  name: string
  purchaseDate: string
  purchaseValue: string
  currentValue: string
  salvageValue: string
  depreciationMethod: 'Straight Line' | 'Diminishing Balance'
  usefulLifeYears: number
  category_id: number
  company_id: number
  location_id: number
  created_by: number
}

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

export interface AssetCategoryType extends CreateAssetCategoryData {
  category_id: number
  category_name: string
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

// IouRecord schema zod
export const IouRecordGetSchema = z.object({
  iouId: z.number(),
  amount: z.number().positive(),
  adjustedAmount: z.number().default(0),
  employeeId: z.number().int().positive(),
  dateIssued: z.coerce.date(),
  dueDate: z.coerce.date(),
  status: z.enum(['active', 'inactive']).default('active'),
  notes: z.string().optional(),
  createdBy: z.number().int().positive(),
})

export type IouRecordGetType = z.infer<typeof IouRecordGetSchema>
