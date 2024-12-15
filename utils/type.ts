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