import { isLastDayOfMonth } from 'date-fns';
import { bankAccountSchema } from '@/api/bank-accounts-api'
import { locationSchema } from '@/api/company-api'
import { costCenterSchema } from '@/api/cost-centers-api'
import { resPartnerSchema } from '@/api/res-partner-api'
import {z} from 'zod'

export interface User {
  userId: number
  username: string
  roleId: number
  roleName: string
  userCompanies: UserCompany[]
}

export interface UserCompany {
  userId: number
  companyId: number
}

export interface Company {
  companyId: number
  companyName: string
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
    isOpen: z.boolean()
}); 


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







//chart of accounts types here:
export interface Account {
   name: string;
  code: string;
  accountType: string;
  parentAccountId?: number;
  currencyId?: number ;
  isReconcilable?: boolean;
  withholdingTax?: boolean;
  budgetTracking?: boolean;
  isActive?: boolean;
  isGroup?: boolean;
  createdBy: number;
  notes?: string | null ;
  

}

export interface CodeGroup {
  id: string
  code: string
  isExpanded?: boolean
  subgroups?: CodeGroup[]
}
 
export interface ParentCode {
   accountCode: string
  accountName: string
  parentCode: string | null
  accountType: "Asset" | "Liability" | "Income" | "Expense" | "Equity"
  code: string
  type: string
  isActive: boolean
  name: string

}


// Zod schema for Chart of Accounts

export const chartOfAccountSchema = z.object({
  accountCode: z.string().min(1, 'Account code is required'),
  accountName: z.string().min(1, 'Account name is required'),
  parentCode: z.string().nullable(),
  accountType: z.enum(['Asset', 'Liability', 'Income', 'Expense', 'Equity']),
  isActive: z.boolean().default(true),
  createdBy: z.number().int().positive(),
  parentName: z.string(),
    parentAccountId: z.string(),
  currencyId: z.number(),
  allowreconcilable: z.boolean().default(true),
  type:z.string(),
   notes:z.string(),
  name: z.string(), 
  code: z.string(),
  
});
