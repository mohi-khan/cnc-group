import { isLastDayOfMonth } from 'date-fns'
import { bankAccountSchema } from '@/api/bank-accounts-api'
import { locationSchema } from '@/api/company-api'
import { costCenterSchema } from '@/api/cost-centers-api'
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

export type CostCenter = z.infer<typeof costCenterSchema>

export type ResPartner = z.infer<typeof resPartnerSchema> & {
  id?: number
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
  name: z.string().max(255),
  code: z.string().max(64),
  accountType: z.string().max(64),
  parentAccountId: z.number().int().positive(),
  parentName: z.string(),
  currencyId: z.number().int().positive(),
  isReconcilable: z.boolean().default(false),
  withholdingTax: z.boolean().default(false),
  budgetTracking: z.boolean().default(false),
  isActive: z.boolean().default(true),
  isGroup: z.boolean().default(false),
  createdBy: z.number().int().positive(),
  notes: z.string(),
})

export type ChartOfAccount = z.infer<typeof chartOfAccountSchema>
//Zod schema for Accounts ( Chart of Accounts with Parent Code)
export const AccountsHeadSchema = z.object({
  accountId: z.number().int().positive(),
  code: z.string(),
  name: z.string(),
  type: z.string(),
  parentCode: z.string().nullable(),
  parentName: z.string().nullable(),
  allowreconcilable: z.boolean(),
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
  bankaccountid:z.number().nullable().optional(),
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
  PaymentVoucher = "Cash Voucher",
    BankVoucher = "Bank Voucher",
  JournalVoucher = "Journal Voucher",
  ContraVoucher = "Contra Voucher",
}
//For Sending Journal Query
export const JournalQuerySchema = z.object({
  date: z.string(),
  companyId: z.array(z.number()),
  locationId: z.array(z.number()),
  voucherType: z.nativeEnum(VoucherTypes),
}); 
export type JournalQuery = z.infer<typeof JournalQuerySchema>
//For holding Journal Deta
export const JournalResultSchema = z.object({
  voucherid:z.number(),
  voucherno: z.string(),
  date: z.string(),
  journaltype: z.string(),
  state: z.string(),
  companyname: z.string().nullable(),
  location: z.string().nullable(),
  currency: z.string().nullable(),
  totalamount: z.number(),
  notes: z.string().nullable(),
  id: z.number(),
  accountsname: z.string(),
  costcenter: z.string(),
  department: z.string().nullable(),
  debit: z.number().default(0),
  credit: z.number().default(0),
  partner: z.number().nullable(),
  bankaccount:z.number().nullable(),
  detail_notes: z.string().nullable(),
})

export type JournalResult = z.infer<typeof JournalResultSchema>


//department
export const departmentSchema = z.object({
  departmentName: z.string().min(1, "Department name is required"),
  budget: z.number().optional(),
  currencyCode: z.number().optional(),
  isActive: z.boolean().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  actual: z.number().optional(),
});

export type Department = z.infer<typeof departmentSchema>

export const departmentsArraySchema = z.array(departmentSchema)