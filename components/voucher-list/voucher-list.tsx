'use client'
import React from 'react'
import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowUpDown, Loader2, Trash2 } from 'lucide-react'
import Link from 'next/link'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HoverCard, HoverCardTrigger } from '@/components/ui/hover-card'
import Loader from '@/utils/loader'
import { usePathname } from 'next/navigation'
import { makePostJournal } from '@/api/vouchers-api'
import { toast } from '@/hooks/use-toast'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { CustomCombobox } from '@/utils/custom-combobox'
import {
  type ComboboxItem,
  CustomComboboxWithApi,
} from '@/utils/custom-combobox-with-api'
import {
  getAllChartOfAccounts,
  getAllCostCenters,
  getAllDepartments,
  getResPartnersBySearch,
  getAllCurrency,
} from '@/api/common-shared-api'
import { useRouter } from 'next/navigation'
import type {
  AccountsHead,
  CostCenter,
  CurrencyType,
  GetDepartment,
  ResPartner,
} from '@/utils/type'
import { editJournalMasterWithDetail } from '@/api/journal-voucher-api'
import { id } from 'date-fns/locale'

interface JournalDetail {
  id?: number
  notes?: string
  accountId: number
  costCenterId?: number | null
  departmentId?: number | null
  debit: number
  credit: number
  balance?: string
  taxDebit?: number
  taxCredit?: number
  fcDebit?: number
  resPartnerId?: number | null
  bankaccountid?: number | null
  updatedBy?: number | null
}

interface Voucher {
  voucherid: number
  voucherno: string
  date: string
  notes: string | null
  companyname: string | null
  location: string | null
  currency: string | null
  state: number
  totalamount: number
  journaltype: string
  journalDetails?: JournalDetail[]
}

interface CompanyFromLocalstorage {
  company: {
    companyId: number
    companyName: string
  }
}

interface LocationFromLocalstorage {
  location: {
    locationId: number
    address: string
  }
}

// Zod schemas for validation
const JournalDetailSchema = z.object({
  id: z.number().optional(),
  accountId: z.number().min(1, 'Account is required'),
  costCenterId: z.number().nullable().optional(),
  departmentId: z.number().nullable().optional(),
  resPartnerId: z.number().nullable().optional(),
  debit: z.number().min(0, 'Debit must be positive'),
  credit: z.number().min(0, 'Credit must be positive'),
  notes: z.string().optional(),
  analyticTags: z.string().nullable().optional(),
  taxId: z.number().nullable().optional(),
  createdBy: z.number(),
  balance: z.string().optional(),
  bankaccountid: z.number().nullable().optional(),
  updatedBy: z.number().nullable().optional(),
})

const JournalEntrySchema = z.object({
  date: z.string().min(1, 'Date is required'),
  journalType: z.string().min(1, 'Journal type is required'),
  state: z.number(),
  companyId: z.number().min(1, 'Company is required'),
  locationId: z.number().min(1, 'Location is required'),
  currencyId: z.number().min(1, 'Currency is required'),
  exchangeRate: z.number().min(0.01, 'Exchange rate must be positive'),
  amountTotal: z.number().min(0, 'Total amount must be positive'),
  notes: z.string().optional(),
  createdBy: z.number(),
})

const EditVoucherSchema = z.object({
  voucherid: z.number(),
  journalEntry: JournalEntrySchema,
  journalDetails: z
    .array(JournalDetailSchema)
    .min(1, 'At least one journal detail is required'),
})

type EditVoucherFormData = z.infer<typeof EditVoucherSchema>

export interface Column {
  key: keyof Voucher
  label: string
}

interface VoucherListProps {
  vouchers: Voucher[]
  columns: Column[]
  isLoading: boolean
  linkGenerator: (voucherId: number) => string
  itemsPerPage?: number
  token?: string
  onJournalPosted?: (voucherId: number) => void
}

const VoucherList: React.FC<VoucherListProps> = ({
  vouchers,
  columns,
  isLoading,
  linkGenerator,
  itemsPerPage = 10,
  onJournalPosted,
}) => {
  const pathname = usePathname()
  const router = useRouter()
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<keyof Voucher>('voucherno')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [isPosting, setIsPosting] = useState<Record<number, boolean>>({})

  // Edit modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null)
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false)

  // Master section states
  const [companies, setCompanies] = React.useState<CompanyFromLocalstorage[]>(
    []
  )
  const [locations, setLocations] = React.useState<LocationFromLocalstorage[]>(
    []
  )
  const [currency, setCurrency] = useState<CurrencyType[]>([])

  // Details section states
  const [costCenters, setCostCenters] = React.useState<CostCenter[]>([])
  const [chartOfAccounts, setChartOfAccounts] = React.useState<AccountsHead[]>(
    []
  )
  const [departments, setDepartments] = React.useState<GetDepartment[]>([])
  const [partners, setPartners] = React.useState<ResPartner[]>([])

  // Use ref to track if vouchers have actually changed
  const vouchersRef = useRef<Voucher[]>(vouchers)
  const [localVouchers, setLocalVouchers] = useState<Voucher[]>(vouchers)

  // Default form values
  const defaultValues = useMemo(
    () => ({
      voucherid: 0,
      journalEntry: {
        date: new Date().toISOString().split('T')[0],
        journalType: 'Journal',
        state: 0,
        companyId: 0,
        locationId: 0,
        currencyId: 1,
        exchangeRate: 1,
        amountTotal: 0,
        notes: '',
        createdBy: userData?.userId || 0,
        updateBy: userData?.userId || 0,
      },
      journalDetails: [
        {
          accountId: 0,
          costCenterId: null,
          departmentId: null,
          resPartnerId: null,
          debit: 0,
          credit: 0,
          notes: '',
          analyticTags: null,
          taxId: null,
          createdBy: userData?.userId || 0,
          updateBy: userData?.userId || 0,
        },
        {
          accountId: 0,
          costCenterId: null,
          departmentId: null,
          resPartnerId: null,
          debit: 0,
          credit: 0,
          notes: '',
          analyticTags: null,
          taxId: null,
          createdBy: userData?.userId || 0,
          updateBy: userData?.userId || 0,
        },
      ],
    }),
    [userData?.userId]
  )

  // Form setup
  const form = useForm<EditVoucherFormData>({
    resolver: zodResolver(EditVoucherSchema),
    defaultValues,
  })

  // Reset form function
  const resetForm = useCallback(() => {
    form.reset(defaultValues)
  }, [form, defaultValues])

  // Only update local vouchers if the actual data has changed
  useEffect(() => {
    const hasChanged =
      JSON.stringify(vouchersRef.current) !== JSON.stringify(vouchers)
    if (hasChanged) {
      vouchersRef.current = vouchers
      setLocalVouchers(vouchers)
    }
  }, [vouchers])

  // Reset form when modal closes
  useEffect(() => {
    if (!isEditModalOpen) {
      resetForm()
    }
  }, [isEditModalOpen, resetForm])

  // Watch for changes in journal details to update total
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name?.startsWith('journalDetails')) {
        const totalDebit =
          value.journalDetails?.reduce(
            (sum, detail) => sum + (detail?.debit || 0),
            0
          ) || 0
        const totalCredit =
          value.journalDetails?.reduce(
            (sum, detail) => sum + (detail?.credit || 0),
            0
          ) || 0
        const amountTotal = Math.max(totalDebit, totalCredit)
        form.setValue('journalEntry.amountTotal', amountTotal)
      }
    })
    return () => subscription.unsubscribe()
  }, [form])

  // Fetching user data from localStorage and setting it to state
  const fetchUserData = React.useCallback(() => {
    if (userData) {
      setCompanies(userData.userCompanies)
      setLocations(userData.userLocations)
    }
  }, [userData])

  React.useEffect(() => {
    fetchUserData()
  }, [fetchUserData])

  // Function to fetch currency data
  const fetchCurrency = useCallback(async () => {
    if (!token) return
    const data = await getAllCurrency(token)
    if (data?.error?.status === 401) {
      router.push('/unauthorized-access')
      return
    } else if (data.error || !data.data) {
      console.error('Error getting currency:', data.error)
      toast({
        title: 'Error',
        description: data.error?.message || 'Failed to get currency',
      })
    } else {
      setCurrency(data.data)
    }
  }, [token, router])

  // Fetching chart of accounts data
  const fetchChartOfAccounts = useCallback(async () => {
    if (!token) return
    const response = await getAllChartOfAccounts(token)
    if (response.error || !response.data) {
      console.error('Error getting Chart Of accounts:', response.error)
      toast({
        title: 'Error',
        description:
          response.error?.message || 'Failed to get Chart Of accounts',
      })
    } else {
      const filteredCoa = response.data?.filter((account) => {
        return account.isGroup === false
      })
      setChartOfAccounts(filteredCoa)
    }
  }, [token])

  // Fetching cost centers data
  const fetchCostCenters = useCallback(async () => {
    if (!token) return
    const data = await getAllCostCenters(token)
    if (data.error || !data.data) {
      console.error('Error getting cost centers:', data.error)
      toast({
        title: 'Error',
        description: data.error?.message || 'Failed to get cost centers',
      })
    } else {
      setCostCenters(data.data)
    }
  }, [token])

  // Fetching departments data
  const fetchDepartments = useCallback(async () => {
    if (!token) return
    const response = await getAllDepartments(token)
    if (response.error || !response.data) {
      console.error('Error getting departments:', response.error)
      toast({
        title: 'Error',
        description: response.error?.message || 'Failed to get departments',
      })
    } else {
      setDepartments(response.data)
    }
  }, [token])

  const fetchgetResPartner = useCallback(async () => {
    const search = ''
    if (!token) return
    try {
      const response = await getResPartnersBySearch(search, token)
      if (response?.error?.status === 401) {
        router.push('/unauthorized-access')
        return
      } else if (response.error || !response.data) {
        console.error('Error getting partners:', response.error)
        toast({
          title: 'Error',
          description: response.error?.message || 'Failed to load partners',
        })
        setPartners([])
        return
      } else {
        setPartners(response.data)
      }
    } catch (error) {
      console.error('Error getting partners:', error)
      toast({
        title: 'Error',
        description: 'Failed to load partners',
      })
      setPartners([])
    }
  }, [token, router])

  useEffect(() => {
    fetchCurrency()
    fetchChartOfAccounts()
    fetchCostCenters()
    fetchDepartments()
    fetchgetResPartner()
  }, [
    fetchCurrency,
    fetchChartOfAccounts,
    fetchCostCenters,
    fetchDepartments,
    fetchgetResPartner,
  ])

  const searchPartners = async (query: string): Promise<ComboboxItem[]> => {
    try {
      const response = await getResPartnersBySearch(query, token)
      if (response.error || !response.data) {
        console.error('Error fetching partners:', response.error)
        return []
      }
      return response.data.map((partner) => ({
        id: partner.id.toString(),
        name: partner.name || 'Unnamed Partner',
      }))
    } catch (error) {
      console.error('Error fetching partners:', error)
      return []
    }
  }

  const handleSort = useCallback((field: keyof Voucher) => {
    setSortField((prevField) => {
      if (field === prevField) {
        setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      } else {
        setSortDirection('asc')
      }
      return field
    })
  }, [])

  const sortedVouchers = useMemo(() => {
    return [...localVouchers].sort((a, b) => {
      if (a[sortField] == null || b[sortField] == null) return 0
      if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1
      if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [localVouchers, sortField, sortDirection])

  const totalPages = Math.ceil(sortedVouchers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentVouchers = sortedVouchers.slice(startIndex, endIndex)

  // Handle edit button click - Updated to populate with actual data
  const handleEditVoucher = useCallback(
    (voucher: Voucher) => {
      setEditingVoucher(voucher)
      setIsEditModalOpen(true)

      // Find the companyId, locationId, and currencyId based on the voucher's string names
      const companyId =
        companies.find((c) => c.company.companyName === voucher.companyname)
          ?.company.companyId || 0
      const locationId =
        locations.find((l) => l.location.address === voucher.location)?.location
          .locationId || 0
      const currencyId =
        currency.find((c) => c.currencyCode === voucher.currency)?.currencyId ||
        1

      // Map existing journal details or create default ones
      const journalDetails =
        voucher.journalDetails && voucher.journalDetails.length > 0
          ? voucher.journalDetails.map((detail) => ({
              id: detail.id,
              accountId: detail.accountId || 0,
              costCenterId: detail.costCenterId || null,
              departmentId: detail.departmentId || null,
              resPartnerId: detail.resPartnerId || null,
              debit: detail.debit || 0,
              credit: detail.credit || 0,
              notes: detail.notes || '',
              analyticTags: null,
              taxId: null,
              createdBy: userData?.userId || 0,
            }))
          : [
              {
                accountId: 0,
                costCenterId: null,
                departmentId: null,
                resPartnerId: null,
                debit: voucher.totalamount || 0,
                credit: 0,
                notes: '',
                analyticTags: null,
                taxId: null,
                createdBy: userData?.userId || 0,
                updateBy: userData?.userId || 0,
              },
              {
                accountId: 0,
                costCenterId: null,
                departmentId: null,
                resPartnerId: null,
                debit: 0,
                credit: voucher.totalamount || 0,
                notes: '',
                analyticTags: null,
                taxId: null,
                createdBy: userData?.userId || 0,
                updatedBy: userData?.userId || 0,
              },
            ]

      // Populate form with existing voucher data
      form.reset({
        voucherid: voucher.voucherid,
        journalEntry: {
          date: voucher.date || new Date().toISOString().split('T')[0],
          journalType: voucher.journaltype || 'Journal',
          state: voucher.state || 0,
          companyId: companyId,
          locationId: locationId,
          currencyId: currencyId,
          exchangeRate: 1, // You might need to derive this if it's part of your voucher data
          amountTotal: voucher.totalamount || 0,
          notes: voucher.notes || '',
          createdBy: userData?.userId || 0,
        },
        journalDetails: journalDetails,
      })
    },
    [form, userData?.userId, companies, locations, currency]
  )

  // Journal details functions
  const entries = form.watch('journalDetails')

  // Function to add a new entry to the journal details
  const addEntry = () => {
    const currentEntries = [...entries]
    const firstEntry = currentEntries[0]
    const newEntry = {
      accountId: 0,
      costCenterId: null,
      departmentId: null,
      resPartnerId: null,
      debit: 0,
      credit: 0,
      notes: '',
      analyticTags: null,
      taxId: null,
      createdBy: userData?.userId || 0,
    }
    if (firstEntry && firstEntry.debit > 0) {
      const totalUsedCredit = currentEntries.reduce((sum, entry, index) => {
        return index === 0 ? sum : sum + entry.credit
      }, 0)
      newEntry.credit = firstEntry.debit - totalUsedCredit
    }
    form.setValue('journalDetails', [...entries, newEntry])
  }

  const removeEntry = (index: number) => {
    if (entries.length > 2) {
      form.setValue(
        'journalDetails',
        entries.filter((_, i) => i !== index)
      )
    }
  }

  const handleDebitChange = (index: number, value: string) => {
    const updatedEntries = [...entries]
    updatedEntries[index].debit = value === '' ? 0 : Number(value)
    updatedEntries[index].credit = 0
    if (index === 0) {
      const debitValue = value === '' ? 0 : Number(value)
      let remainingCredit = debitValue
      // Start from index 1 and distribute remaining amount
      for (let i = 1; i < updatedEntries.length; i++) {
        if (i === updatedEntries.length - 1) {
          // Last entry gets remaining amount
          updatedEntries[i].credit = Number(remainingCredit.toFixed(2))
        } else {
          // Use existing credit value if available, otherwise use remaining credit
          const existingCredit = updatedEntries[i].credit || 0
          updatedEntries[i].credit =
            existingCredit || Number(remainingCredit.toFixed(2))
        }
        updatedEntries[i].debit = 0
        remainingCredit -= updatedEntries[i].credit
        form.setValue(`journalDetails.${i}.credit`, updatedEntries[i].credit)
        form.setValue(`journalDetails.${i}.debit`, updatedEntries[i].debit)
      }
    }
    form.setValue('journalDetails', updatedEntries)
  }

  const handleCreditChange = (index: number, value: string) => {
    const updatedEntries = [...entries]
    updatedEntries[index].credit = value === '' ? 0 : Number(value)
    updatedEntries[index].debit = 0
    if (index > 0) {
      const firstEntryDebit = updatedEntries[0].debit
      let usedCredit = 0
      // Calculate used credit from entries 1 to current index
      for (let i = 1; i <= index; i++) {
        usedCredit += updatedEntries[i].credit
      }
      // Distribute remaining amount to next entries if any
      const remainingCredit = firstEntryDebit - usedCredit
      for (let i = index + 1; i < updatedEntries.length; i++) {
        if (i === updatedEntries.length - 1) {
          updatedEntries[i].credit = Number(remainingCredit.toFixed(2))
        } else {
          updatedEntries[i].credit = 0
        }
        updatedEntries[i].debit = 0
        form.setValue(`journalDetails.${i}.credit`, updatedEntries[i].credit)
        form.setValue(`journalDetails.${i}.debit`, updatedEntries[i].debit)
      }
    }
    form.setValue('journalDetails', updatedEntries)
  }

  // Function to calculate the total debit and credit values
  const calculateTotals = () => {
    return entries.reduce(
      (totals, entry) => {
        totals.debit += entry.debit
        totals.credit += entry.credit
        return totals
      },
      { debit: 0, credit: 0 }
    )
  }

  const totals = calculateTotals()
  const isBalanced = totals.debit === totals.credit

  // Handle form submission
  const onSubmit = useCallback(
    async (data: EditVoucherFormData) => {
      if (!token) return
      setIsSubmittingEdit(true)
      try {
        // Transform data to match API expectations
        const apiData = {
          id: editingVoucher?.voucherid ?? data.voucherid,
          voucherid: data.voucherid,
          voucherno: editingVoucher?.voucherno || '',
          date: data.journalEntry.date,
          notes: data.journalEntry.notes ,
          companyname: editingVoucher?.companyname || '',
          location: editingVoucher?.location || '',
          currency: editingVoucher?.currency || '',
          totalamount: data.journalEntry.amountTotal,
          journaltype: data.journalEntry.journalType,
          journalEntry: {
            id: editingVoucher?.voucherid ?? data.voucherid,
            voucherNo: editingVoucher?.voucherno || '',
            date: data.journalEntry.date,
            journalType: data.journalEntry.journalType,
            state: data.journalEntry.state,
            companyId: data.journalEntry.companyId,
            locationId: data.journalEntry.locationId,
            currencyId: data.journalEntry.currencyId,
            exchangeRate: data.journalEntry.exchangeRate,
            amountTotal: data.journalEntry.amountTotal,
            notes: data.journalEntry.notes ?? null,
            createdBy: data.journalEntry.createdBy,
            taxTotal: 0,
            payTo: '',
            reference: '',
          },
          journalDetails: data.journalDetails.map((detail, idx) => ({
            id: typeof detail.id === 'number' ? detail.id : idx + 1,
            voucherId: data.voucherid,
            accountId: detail.accountId,
            costCenterId:
              detail.costCenterId !== undefined ? detail.costCenterId : null,
            departmentId:
              detail.departmentId !== undefined ? detail.departmentId : null,
            resPartnerId:
              detail.resPartnerId !== undefined ? detail.resPartnerId : null,
            debit: detail.debit,
            credit: detail.credit,
            notes: detail.notes ?? '',
            analyticTags: detail.analyticTags,
            taxId: detail.taxId !== undefined ? detail.taxId : null,
            createdBy: detail.createdBy,
            balance:
              typeof detail.balance === 'number'
                ? detail.balance
                : detail.balance === undefined ||
                    detail.balance === null ||
                    detail.balance === ''
                  ? 0
                  : Number(detail.balance),
            bankaccountid:
              detail.bankaccountid !== undefined ? detail.bankaccountid : null,
            updatedBy:
              typeof detail.updatedBy === 'number'
                ? detail.updatedBy
                : detail.createdBy,
          })),
        }

        const response = await editJournalMasterWithDetail(apiData, token)
        if (response.error) {
          toast({
            title: 'Error',
            description: response.error.message || 'Failed to update voucher',
            variant: 'destructive',
          })
        } else {
          toast({
            title: 'Success',
            description: 'Voucher updated successfully',
          })
          // Update the local voucher state
          setLocalVouchers((prevVouchers) =>
            prevVouchers.map((voucher) =>
              voucher.voucherid === data.voucherid
                ? {
                    ...voucher,
                    date: data.journalEntry.date,
                    notes: data.journalEntry.notes ?? null,
                    totalamount: data.journalEntry.amountTotal,
                    journaltype: data.journalEntry.journalType,
                  }
                : voucher
            )
          )
          // Close modal and reset
          setIsEditModalOpen(false)
          setEditingVoucher(null)
          resetForm()
        }
      } catch (error) {
        console.error('Error updating voucher:', error)
        toast({
          title: 'Error',
          description: 'Failed to update voucher',
          variant: 'destructive',
        })
      } finally {
        setIsSubmittingEdit(false)
      }
    },
    [
      token,
      editingVoucher,
      resetForm,
      
    ]
  )

  // Handle modal close
  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false)
    setEditingVoucher(null)
    resetForm()
  }, [resetForm])

  // Memoize the handlePostJournal function with stable dependencies
  const handlePostJournal = useCallback(
    async (voucherId: number) => {
      if (!userData?.userId || !token) {
        console.warn('Missing user data or token')
        return
      }
      try {
        setIsPosting((prev) => ({ ...prev, [voucherId]: true }))
        console.log(
          'Posting journal for voucherId:',
          voucherId,
          'createdId:',
          userData.userId
        )
        const response = await makePostJournal(
          voucherId,
          userData.userId,
          token
        )
        if (response.error || !response.data) {
          console.error('Error posting journal:', response.error)
          toast({
            title: 'Error',
            description: response.error?.message || 'Failed to post journal',
            variant: 'destructive',
          })
        } else {
          toast({
            title: 'Success',
            description: 'Journal posted successfully',
          })
          // Update the local voucher state optimistically
          setLocalVouchers((prevVouchers) =>
            prevVouchers.map((voucher) =>
              voucher.voucherid === voucherId
                ? { ...voucher, state: 1 }
                : voucher
            )
          )
          // Call the callback if provided
          onJournalPosted?.(voucherId)
        }
      } catch (error) {
        console.error('Error posting journal:', error)
        toast({
          title: 'Error',
          description: 'Failed to post journal',
          variant: 'destructive',
        })
      } finally {
        setIsPosting((prev) => ({ ...prev, [voucherId]: false }))
      }
    },
    [userData?.userId, token, onJournalPosted]
  )

  // Memoize pagination handlers
  const handlePreviousPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }, [])

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }, [totalPages])

  const handlePageClick = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const journalTypes = [
    'Sales',
    'Purchase',
    'Payment',
    'Receipt',
    'Journal',
    'Contra',
  ]

  return (
    <>
      <Table className="border shadow-md">
        <TableHeader className="sticky top-28 bg-slate-200 shadow-md">
          <TableRow>
            {columns.map(({ key, label }) => (
              <TableHead
                key={key}
                className="cursor-pointer text-left"
                onClick={() => handleSort(key)}
              >
                <Button variant="ghost" className="hover:bg-transparent">
                  {label}
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
            ))}
            {pathname.includes('accounting/day-books') && (
              <TableHead className="text-right">
                <Button variant="ghost" className="hover:bg-transparent">
                  Action
                </Button>
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={
                  columns.length +
                  (pathname.includes('accounting/day-books') ? 1 : 0)
                }
                className="text-center py-4"
              >
                <Loader />
              </TableCell>
            </TableRow>
          ) : currentVouchers.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={
                  columns.length +
                  (pathname.includes('accounting/day-books') ? 1 : 0)
                }
                className="text-center py-4"
              >
                No voucher is available.
              </TableCell>
            </TableRow>
          ) : (
            currentVouchers.map((voucher) => {
              const isCurrentlyPosting = isPosting[voucher.voucherid]
              const isButtonDisabled = voucher.state !== 0 || isCurrentlyPosting
              return (
                <TableRow key={voucher.voucherid}>
                  {columns.map(({ key }) => (
                    <TableCell key={key}>
                      {key === 'voucherno' ? (
                        <Link
                          href={linkGenerator(voucher.voucherid)}
                          className="text-blue-600 hover:underline"
                        >
                          {voucher[key]}
                        </Link>
                      ) : key === 'state' ? (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            voucher[key] === 0
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {voucher[key] === 0 ? 'Draft' : 'Posted'}
                        </span>
                      ) : key === 'totalamount' ? (
                        <span className="font-mono">
                          {voucher.currency && `${voucher.currency} `}
                          {voucher[key].toFixed(2)}
                        </span>
                      ) : Array.isArray(voucher[key]) ? (
                        JSON.stringify(voucher[key])
                      ) : (
                        voucher[key]
                      )}
                    </TableCell>
                  ))}
                  {pathname.includes('accounting/day-books') && (
                    <TableCell className="text-right flex gap-2">
                      <Button
                        disabled={isButtonDisabled}
                        variant="outline"
                        onClick={() => handlePostJournal(voucher.voucherid)}
                        className="min-w-[80px]"
                      >
                        {isCurrentlyPosting ? 'Posting...' : 'Make Post'}
                      </Button>
                      <Button
                        disabled={voucher.state !== 0}
                        variant="outline"
                        onClick={() => handleEditVoucher(voucher)}
                        className="min-w-[80px]"
                      >
                        Edit
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={handlePreviousPage}
                className={
                  currentPage === 1
                    ? 'pointer-events-none opacity-50'
                    : 'cursor-pointer'
                }
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  onClick={() => handlePageClick(i + 1)}
                  isActive={currentPage === i + 1}
                  className="cursor-pointer"
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={handleNextPage}
                className={
                  currentPage === totalPages
                    ? 'pointer-events-none opacity-50'
                    : 'cursor-pointer'
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Edit Modal with Combined Master and Details Sections */}
      <Dialog open={isEditModalOpen} onOpenChange={handleCloseEditModal}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Edit Voucher - {editingVoucher?.voucherno}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Master Information Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Master Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="journalEntry.companyId"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Company</FormLabel>
                            <CustomCombobox
                              items={companies.map((c) => ({
                                id: c.company.companyId,
                                name: c.company.companyName,
                              }))}
                              value={
                                field.value
                                  ? {
                                      id: field.value,
                                      name:
                                        companies.find(
                                          (c) =>
                                            c.company.companyId === field.value
                                        )?.company.companyName || '',
                                    }
                                  : null
                              }
                              placeholder="Select company"
                              onChange={(value) =>
                                field.onChange(value?.id || null)
                              }
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="journalEntry.locationId"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Location</FormLabel>
                            <CustomCombobox
                              items={locations.map((c) => ({
                                id: c.location.locationId,
                                name: c.location.address,
                              }))}
                              value={
                                field.value
                                  ? {
                                      id: field.value,
                                      name:
                                        locations.find(
                                          (c) =>
                                            c.location.locationId ===
                                            field.value
                                        )?.location.address || '',
                                    }
                                  : null
                              }
                              placeholder="Select location"
                              onChange={(value) =>
                                field.onChange(value?.id || null)
                              }
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="journalEntry.date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="mb-2">Voucher Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} className="h-10" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="journalEntry.currencyId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Currency</FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                                <HoverCard>
                                  <HoverCardTrigger asChild>
                                    <div>
                                      <CustomCombobox
                                        items={currency.map(
                                          (curr: CurrencyType) => ({
                                            id: curr.currencyId.toString(),
                                            name:
                                              curr.currencyCode ||
                                              'Unnamed Currency',
                                          })
                                        )}
                                        value={
                                          field.value
                                            ? {
                                                id: field.value.toString(),
                                                name:
                                                  currency.find(
                                                    (curr: CurrencyType) =>
                                                      curr.currencyId ===
                                                      field.value
                                                  )?.currencyCode ||
                                                  'Unnamed Currency',
                                              }
                                            : null
                                        }
                                        onChange={(
                                          value: {
                                            id: string
                                            name: string
                                          } | null
                                        ) =>
                                          field.onChange(
                                            value
                                              ? Number.parseInt(value.id, 10)
                                              : null
                                          )
                                        }
                                        placeholder="Select currency"
                                      />
                                    </div>
                                  </HoverCardTrigger>
                                </HoverCard>
                                {field.value && field.value !== 1 && (
                                  <FormField
                                    control={form.control}
                                    name="journalEntry.exchangeRate"
                                    render={({ field: exchangeField }) => (
                                      <FormControl>
                                        <Input
                                          type="number"
                                          placeholder="Exchange Rate"
                                          value={
                                            exchangeField.value === null
                                              ? ''
                                              : exchangeField.value
                                          }
                                          onChange={(e) => {
                                            const value = e.target.value
                                            exchangeField.onChange(
                                              value === ''
                                                ? null
                                                : Number(value)
                                            )
                                          }}
                                          className="w-32"
                                        />
                                      </FormControl>
                                    )}
                                  />
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="journalEntry.notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Write notes here"
                              {...field}
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Journal Details Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Journal Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <div className="space-y-4 border pb-4 mb-4 rounded-md shadow-md">
                      <div className="grid grid-cols-[1fr,1fr,1fr,1fr,1fr,1fr,1fr,auto] gap-2 items-center text-sm font-medium border-b p-4 bg-slate-200 shadow-md">
                        <div>Account Name</div>
                        <div>Cost Center</div>
                        <div>Unit</div>
                        <div>Partner Name</div>
                        <div>Debit</div>
                        <div>Credit</div>
                        <div>Notes</div>
                        <div>Action</div>
                      </div>
                      {entries.map((_, index) => {
                        // Get the selected account ID and find the account to check withholdingTax
                        const selectedAccountId = form.watch(
                          `journalDetails.${index}.accountId`
                        )
                        const selectedAccount = chartOfAccounts.find(
                          (account) => account.accountId === selectedAccountId
                        )
                        const isPartnerFieldEnabled =
                          selectedAccount?.withholdingTax === true
                        return (
                          <div
                            key={index}
                            className="grid grid-cols-[1fr,1fr,1fr,1fr,1fr,1fr,1fr,auto] gap-2 items-center px-4"
                          >
                            <FormField
                              control={form.control}
                              name={`journalDetails.${index}.accountId`}
                              render={({ field }) => (
                                <FormItem>
                                  <CustomCombobox
                                    items={chartOfAccounts
                                      .filter((account) => account.isActive)
                                      .map((account) => ({
                                        id: account.accountId,
                                        name: account.name,
                                      }))}
                                    value={
                                      field.value
                                        ? {
                                            id: field.value,
                                            name:
                                              chartOfAccounts.find(
                                                (account) =>
                                                  account.accountId ===
                                                  field.value
                                              )?.name || '',
                                          }
                                        : null
                                    }
                                    onChange={(selectedItem) => {
                                      const newAccountId =
                                        selectedItem?.id || null
                                      field.onChange(newAccountId)
                                      // Clear resPartnerId if the new account doesn't have withholdingTax
                                      if (newAccountId) {
                                        const newAccount = chartOfAccounts.find(
                                          (account) =>
                                            account.accountId === newAccountId
                                        )
                                        if (!newAccount?.withholdingTax) {
                                          form.setValue(
                                            `journalDetails.${index}.resPartnerId`,
                                            null
                                          )
                                        }
                                      } else {
                                        form.setValue(
                                          `journalDetails.${index}.resPartnerId`,
                                          null
                                        )
                                      }
                                    }}
                                    placeholder="Select an account"
                                  />
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`journalDetails.${index}.costCenterId`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <CustomCombobox
                                      items={costCenters
                                        .filter((center) => center.isActive)
                                        .map((center) => ({
                                          id: center.costCenterId.toString(),
                                          name:
                                            center.costCenterName ||
                                            'Unnamed Cost Center',
                                        }))}
                                      value={
                                        field.value
                                          ? {
                                              id: field.value.toString(),
                                              name:
                                                costCenters.find(
                                                  (c) =>
                                                    c.costCenterId ===
                                                    field.value
                                                )?.costCenterName || '',
                                            }
                                          : null
                                      }
                                      onChange={(value) =>
                                        field.onChange(
                                          value
                                            ? Number.parseInt(value.id, 10)
                                            : null
                                        )
                                      }
                                      placeholder="Select cost center"
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`journalDetails.${index}.departmentId`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <CustomCombobox
                                      items={departments
                                        .filter(
                                          (department) => department.isActive
                                        )
                                        .map((department) => ({
                                          id: department.departmentID.toString(),
                                          name:
                                            department.departmentName ||
                                            'Unnamed Unit',
                                        }))}
                                      value={
                                        field.value
                                          ? {
                                              id: field.value.toString(),
                                              name:
                                                departments.find(
                                                  (d) =>
                                                    d.departmentID ===
                                                    field.value
                                                )?.departmentName || '',
                                            }
                                          : null
                                      }
                                      onChange={(value) =>
                                        field.onChange(
                                          value
                                            ? Number.parseInt(value.id, 10)
                                            : null
                                        )
                                      }
                                      placeholder="Select unit"
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`journalDetails.${index}.resPartnerId`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <div
                                      className={`${!isPartnerFieldEnabled ? 'cursor-not-allowed opacity-50' : ''}`}
                                    >
                                      <CustomComboboxWithApi
                                        items={partners
                                          .filter((partner) => partner.active)
                                          .map((partner) => ({
                                            id: partner.id.toString(),
                                            name:
                                              partner.name || 'Unnamed Partner',
                                          }))}
                                        value={
                                          field.value
                                            ? {
                                                id: field.value.toString(),
                                                name:
                                                  partners.find(
                                                    (p) => p.id === field.value
                                                  )?.name || '',
                                              }
                                            : null
                                        }
                                        onChange={(value) =>
                                          field.onChange(
                                            value
                                              ? Number.parseInt(
                                                  value.id.toString(),
                                                  10
                                                )
                                              : null
                                          )
                                        }
                                        searchFunction={searchPartners}
                                        disabled={!isPartnerFieldEnabled}
                                        placeholder="Select partner"
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`journalDetails.${index}.debit`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      {...field}
                                      onChange={(e) =>
                                        handleDebitChange(index, e.target.value)
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`journalDetails.${index}.credit`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      {...field}
                                      onChange={(e) =>
                                        handleCreditChange(
                                          index,
                                          e.target.value
                                        )
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`journalDetails.${index}.notes`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      value={field.value || ''}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="border rounded-md">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeEntry(index)}
                                disabled={entries.length <= 2}
                              >
                                <Trash2 className="w-10 h-10" />
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <Button type="button" variant="outline" onClick={addEntry}>
                      Add Another Line
                    </Button>
                    <div className="flex justify-between items-center pt-4">
                      <div>
                        <p>Total Debit: {totals.debit}</p>
                        <p>Total Credit: {totals.credit}</p>
                      </div>
                      <div>
                        {!isBalanced && (
                          <p className="text-red-500">
                            Debit and Credit totals must be equal to post/draft
                            the voucher.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <DialogFooter className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseEditModal}
                  disabled={isSubmittingEdit}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="min-w-[100px]"
                >
                  {isSubmittingEdit ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    'Update Voucher'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default VoucherList
