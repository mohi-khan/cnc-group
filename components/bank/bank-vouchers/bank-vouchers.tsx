

'use client'
import * as React from 'react'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'
import {
  type JournalEntryWithDetails,
  JournalEntryWithDetailsSchema,
  type JournalResult,
  type JournalQuery,
  VoucherTypes,
  type User,
  type FormStateType,
  type JournalEditWithDetails,
} from '@/utils/type'
import {
  createJournalEntryWithDetails,
  editJournalEntryWithDetails,
  getAllVoucher,
} from '@/api/vouchers-api'
import VoucherList from '@/components/voucher-list/voucher-list'
import { Popup } from '@/utils/popup'
import BankVoucherMaster from './bank-voucher-master'
import BankVoucherDetails from './bank-voucher-details'
import BankVoucherSubmit from './bank-voucher-submit'
import { useForm } from 'react-hook-form'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import {
  getAllBankAccounts,
  getAllChartOfAccounts,
  getAllCostCenters,
  getAllDepartments,
  getResPartnersBySearch,
  getEmployee,
} from '@/api/common-shared-api'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from '@/components/ui/dialog'
import { DialogTitle } from '@radix-ui/react-dialog'
import { getCompanyWiseChartOfAccounts } from '@/api/chart-of-accounts-api'

interface BankVoucherProps {
  initialData?: JournalEntryWithDetails
  onClose?: () => void
  isEdit?: boolean
  onSuccess: any
}

export default function BankVoucher({
  initialData,
  onClose,
  isEdit,
  onSuccess,
}: BankVoucherProps) {
  useInitializeUser()
  const router = useRouter()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const [voucherGrid, setVoucherGrid] = useState<JournalResult[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [companyChartOfAccount, setCompanyChartOfAccount] = useState<any[]>([])
  const [companyFilteredAccounts, setCompanyFilteredAccounts] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [showLastUsedBanner, setShowLastUsedBanner] = useState(false)
  const hasRestoredBankAccount = React.useRef(false)

  // Load last used values from localStorage
  // const getLastUsedValues = useCallback(() => {
  //   try {
  //     const saved = localStorage.getItem('lastBankVoucherValues')
  //     console.log('🔍 Checking localStorage for last used values:', saved)
  //     const parsed = saved ? JSON.parse(saved) : null
  //     console.log('📋 Parsed last used values:', parsed)
  //     return parsed
  //   } catch (error) {
  //     console.error('❌ Error loading last used values:', error)
  //     return null
  //   }
  // }, [])
  const getLastUsedValues = useCallback(() => {
  try {
    if (typeof window === 'undefined') return null  // ← Add this line
    
    const saved = localStorage.getItem('lastBankVoucherValues')
    const parsed = saved ? JSON.parse(saved) : null
    return parsed
  } catch (error) {
    console.error('❌ Error loading last used values:', error)
    return null
  }
}, [])

  // Memoize lastUsedValues to prevent infinite loops
  const lastUsedValues = useMemo(() => {
    if (initialData) return null
    return getLastUsedValues()
  }, [initialData, getLastUsedValues])

  const form = useForm<JournalEntryWithDetails>({
    resolver: zodResolver(JournalEntryWithDetailsSchema),
    defaultValues: initialData || {
      journalEntry: {
        date: lastUsedValues?.date || new Date().toISOString().split('T')[0],
        journalType: VoucherTypes.BankVoucher,
        companyId: lastUsedValues?.companyId || 0,
        locationId: lastUsedValues?.locationId || 0,
        currencyId: 1,
        exchangeRate: 1,
        amountTotal: 0,
        payTo: '',
        notes: '',
        createdBy: 0,
      },
      journalDetails: [
        {
          accountId: 0,
          costCenterId: null,
          departmentId: null,
          employeeId: null,
          debit: 0,
          credit: 0,
          analyticTags: null,
          taxId: null,
          resPartnerId: null,
          bankaccountid: null,
          notes: '',
          createdBy: 0,
        },
      ],
    },
  })

  const [formState, setFormState] = useState<FormStateType>({
    companies: [],
    locations: [],
    bankAccounts: [],
    chartOfAccounts: [],
    filteredChartOfAccounts: [],
    costCenters: [],
    partners: [],
    departments: [],
    employees: [],
    selectedBankAccount: null,
    formType: lastUsedValues?.formType || 'Credit',
    status: 'Draft',
  })

  // Save values to localStorage (defined after formState)
  const saveLastUsedValues = useCallback((values: any) => {
    try {
      const toSave = {
        companyId: values.journalEntry.companyId,
        locationId: values.journalEntry.locationId,
        bankAccountId: formState.selectedBankAccount?.id,
        formType: formState.formType,
        date: values.journalEntry.date,
      }
      console.log('💾 Saving last used values:', toSave)
      localStorage.setItem('lastBankVoucherValues', JSON.stringify(toSave))
      console.log('✅ Values saved successfully to localStorage')
    } catch (error) {
      console.error('❌ Failed to save last used values:', error)
    }
  }, [formState.selectedBankAccount?.id, formState.formType])

  // Show banner if last used values were loaded
  useEffect(() => {
    console.log('🎯 Banner check - initialData:', !!initialData, 'hasValues:', !!(lastUsedValues?.companyId || lastUsedValues?.bankAccountId))
    if (!initialData && lastUsedValues && (lastUsedValues.companyId || lastUsedValues.bankAccountId)) {
      console.log('✅ Showing banner!')
      setShowLastUsedBanner(true)
    } else {
      console.log('❌ Not showing banner')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, lastUsedValues?.companyId, lastUsedValues?.bankAccountId])

  useEffect(() => {
    const checkUserData = () => {
      const storedUserData = localStorage.getItem('currentUser')
      const storedToken = localStorage.getItem('authToken')
      if (!storedUserData || !storedToken) router.push('/')
    }

    if (userData) {
      setFormState((prev) => ({
        ...prev,
        companies: userData.userCompanies,
        locations: userData.userLocations,
      }))
      if (!userData.voucherTypes.includes('Bank Voucher')) {
        router.push('/unauthorized-access')
      }
    }
    checkUserData()
  }, [router, userData])

  const fetchgetCompanyChartOfAccounts = useCallback(async () => {
    if (!token) return
    try {
      const response = await getCompanyWiseChartOfAccounts(token)
      if (response?.error?.status === 401) {
        router.push('/unauthorized-access')
        return
      } else if (response.error || !response.data) {
        console.error('Error getting company chart of accounts:', response.error)
        toast({
          title: 'Error',
          description: response.error?.message || 'Failed to load company chart of accounts',
        })
        setCompanyChartOfAccount([])
        return
      } else {
        setCompanyChartOfAccount(response.data)
        console.log('Company Chart of Accounts:', response.data)
      }
    } catch (error) {
      console.error('Error getting company chart of accounts:', error)
      toast({
        title: 'Error',
        description: 'Failed to load company chart of accounts',
      })
      setCompanyChartOfAccount([])
    }
  }, [token, router])

  const fetchEmployees = useCallback(async () => {
    if (!token) return
    try {
      const response = await getEmployee(token)
      if (response?.error?.status === 401) {
        router.push('/unauthorized-access')
        return
      } else if (response.error || !response.data) {
        console.error('Error getting employees:', response.error)
        toast({
          title: 'Error',
          description: response.error?.message || 'Failed to load employees',
        })
        setEmployees([])
        return
      } else {
        setEmployees(response.data)
        console.log('Fetched Employees:', response.data)
      }
    } catch (error) {
      console.error('Error getting employees:', error)
      toast({
        title: 'Error',
        description: 'Failed to load employees',
      })
      setEmployees([])
    }
  }, [token, router])

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!token) return
      const search = ''
      const [
        bankAccountsResponse,
        chartOfAccountsResponse,
        costCentersResponse,
        partnersResponse,
        departmentsResponse,
      ] = await Promise.all([
        getAllBankAccounts(token),
        getAllChartOfAccounts(token),
        getAllCostCenters(token),
        getResPartnersBySearch(search, token),
        getAllDepartments(token),
      ])

      if (
        bankAccountsResponse?.error?.status === 441 ||
        chartOfAccountsResponse?.error?.status === 441 ||
        costCentersResponse?.error?.status === 441 ||
        partnersResponse?.error?.status === 441 ||
        departmentsResponse?.error?.status === 441
      ) {
        router.push('/unauthorized-access')
        return
      }

      const filteredCoa = chartOfAccountsResponse.data?.filter(
        (account) => !account.isGroup
      )

      setFormState((prev) => ({
        ...prev,
        bankAccounts: bankAccountsResponse.data || [],
        chartOfAccounts: chartOfAccountsResponse.data || [],
        filteredChartOfAccounts: filteredCoa || [],
        costCenters: costCentersResponse.data || [],
        partners: partnersResponse.data || [],
        departments: departmentsResponse.data || [],
      }))
    }

    fetchInitialData()
    fetchgetCompanyChartOfAccounts()
    fetchEmployees()
  }, [token, router, fetchgetCompanyChartOfAccounts, fetchEmployees])

  // Restore last used bank account after bank accounts are loaded
  useEffect(() => {
    console.log('🏦 Bank restoration check:', {
      hasInitialData: !!initialData,
      bankAccountId: lastUsedValues?.bankAccountId,
      bankAccountsLoaded: formState.bankAccounts.length,
      alreadyRestored: hasRestoredBankAccount.current
    })
    
    if (!initialData && 
        lastUsedValues?.bankAccountId && 
        formState.bankAccounts.length > 0 && 
        !hasRestoredBankAccount.current) {
      
      const savedBank = formState.bankAccounts.find(acc => acc.id === lastUsedValues.bankAccountId)
      console.log('🔍 Looking for bank:', lastUsedValues.bankAccountId, 'Found:', savedBank)
      
      if (savedBank) {
        console.log('✅ Restoring bank account:', savedBank.accountName)
        setFormState(prev => ({
          ...prev,
          selectedBankAccount: {
            id: savedBank.id,
            glCode: savedBank.glAccountId || 0,
          }
        }))
        hasRestoredBankAccount.current = true
      }
    }
  }, [formState.bankAccounts, lastUsedValues?.bankAccountId, initialData])

  // NEW: Filter accounts based on selected company
  useEffect(() => {
    const subscription = form.watch((value) => {
      const selectedCompanyId = value.journalEntry?.companyId

      console.log('🔍 Company Selection Debug:')
      console.log('Selected Company ID:', selectedCompanyId)
      console.log('Company Chart Mappings:', companyChartOfAccount)
      console.log('All Chart of Accounts:', formState.chartOfAccounts)
      console.log('Filtered Chart of Accounts (non-group):', formState.filteredChartOfAccounts)

      if (!selectedCompanyId) {
        console.log('⚠️ No company selected - setting empty array')
        setCompanyFilteredAccounts([])
        return
      }

      if (!companyChartOfAccount.length) {
        console.log('⚠️ No company chart mappings - setting empty array')
        setCompanyFilteredAccounts([])
        return
      }

      if (!formState.chartOfAccounts.length) {
        console.log('⚠️ No chart of accounts loaded - setting empty array')
        setCompanyFilteredAccounts([])
        return
      }

      const companyAccountIds = companyChartOfAccount
        .filter((mapping) => {
          console.log(`Checking mapping: companyId ${mapping.companyId} === ${selectedCompanyId}?`, mapping.companyId === selectedCompanyId)
          return mapping.companyId === selectedCompanyId
        })
        .map((mapping) => mapping.chartOfAccountId)

      console.log('📋 Account IDs for selected company:', companyAccountIds)

      const filtered = formState.chartOfAccounts.filter((account) => {
        const isIncluded = companyAccountIds.includes(account.accountId)
        const isNotGroup = account.isGroup === false
        if (isIncluded && isNotGroup) {
          console.log(`✓ Including account: ${account.name} (ID: ${account.accountId})`)
        }
        return isIncluded && isNotGroup
      })

      console.log('✅ Filtered Accounts for Details:', filtered)
      console.log('Total accounts found:', filtered.length)

      setCompanyFilteredAccounts(filtered)
    })

    return () => subscription.unsubscribe()
  }, [form, companyChartOfAccount, formState.chartOfAccounts, formState.filteredChartOfAccounts])

  // Trigger initial filter when data loads
  useEffect(() => {
    const selectedCompanyId = form.getValues('journalEntry.companyId')
    if (selectedCompanyId && companyChartOfAccount.length && formState.chartOfAccounts.length) {
      console.log('🔄 Initial trigger for company:', selectedCompanyId)
      const companyAccountIds = companyChartOfAccount
        .filter((mapping) => mapping.companyId === selectedCompanyId)
        .map((mapping) => mapping.chartOfAccountId)

      const filtered = formState.chartOfAccounts.filter(
        (account) =>
          companyAccountIds.includes(account.accountId) && account.isGroup === false
      )

      setCompanyFilteredAccounts(filtered)
    }
  }, [companyChartOfAccount, formState.chartOfAccounts, form])

  useEffect(() => {
    if (initialData) {
      const filteredDetails = (initialData.journalDetails || []).filter(
        (d) => d.accountId !== 108
      )

      const cleanedData = {
        ...initialData,
        journalDetails: filteredDetails,
      }

      form.reset(cleanedData)

      if (filteredDetails.length > 0) {
        const bankDetail = initialData.journalDetails.find(
          (d) => d.bankaccountid
        )
        if (bankDetail && bankDetail.bankaccountid) {
          const selectedBank = formState.bankAccounts.find(
            (acc) => acc.id === bankDetail.bankaccountid
          )
          if (selectedBank) {
            setFormState((prev) => ({
              ...prev,
              selectedBankAccount: {
                id: selectedBank.id,
                glCode: selectedBank.glAccountId || 0,
              },
              formType: bankDetail.debit > 0 ? 'Debit' : 'Credit',
            }))
          }
        }
      }
    }
  }, [initialData, form, formState.bankAccounts])

  useEffect(() => {
    if (userData) setUser(userData)
  }, [userData])

  const getCompanyIds = useCallback((data: any[]): number[] => {
    return data.map((company) => company.company.companyId)
  }, [])

  const getLocationIds = useCallback((data: any[]): number[] => {
    return data.map((location) => location.location.locationId)
  }, [])

  const getallVoucher = useCallback(
    async (company: number[], location: number[]) => {
      if (!token) return
      let localVoucherGrid: JournalResult[] = []
      try {
        const voucherQuery: JournalQuery = {
          date: new Date().toISOString().split('T')[0],
          companyId: company,
          locationId: location,
          voucherType: VoucherTypes.BankVoucher,
        }
        const response = await getAllVoucher(voucherQuery, token)
        if (response?.error?.status === 401) router.push('/unauthorized-access')
        else if (!response.data) throw new Error('No data received from server')
        localVoucherGrid = Array.isArray(response.data) ? response.data : []
      } catch (error) {
        console.error('Error getting Voucher Data:', error)
        throw error
      }
      setVoucherGrid(localVoucherGrid)
    },
    [token, router]
  )

  useEffect(() => {
    const fetchVoucherData = async () => {
      if (
        formState.companies.length > 0 &&
        formState.locations.length > 0 &&
        !dataLoaded
      ) {
        setIsLoading(true)
        try {
          const mycompanies = getCompanyIds(formState.companies)
          const mylocations = getLocationIds(formState.locations)
          await getallVoucher(mycompanies, mylocations)
          setDataLoaded(true)
        } catch (error) {
          console.error('Error fetching voucher data:', error)
          toast({
            title: 'Error',
            description: 'Failed to load voucher data. Please try again.',
          })
        } finally {
          setIsLoading(false)
        }
      }
    }
    fetchVoucherData()
  }, [
    formState.companies,
    formState.locations,
    getCompanyIds,
    getLocationIds,
    getallVoucher,
    dataLoaded,
  ])

  const onSubmit = async (values: any, status: 'Draft' | 'Posted') => {
    const bankDetail =
      isEdit && initialData
        ? initialData.journalDetails.find((d: any) => d.accountId === 108)
        : null

    const journalDetailsFiltered = isEdit
      ? values.journalDetails.filter((d: any) => d.accountId !== 108)
      : values.journalDetails

    const updatedValues = {
      ...values,
      journalEntry: {
        ...values.journalEntry,
        state: status === 'Draft' ? 0 : 1,
        notes: values.journalEntry.notes || '',
        journalType: 'Bank Voucher',
        currencyId: values.journalEntry.currencyId || 1,
        amountTotal: values.journalEntry.amountTotal,
        createdBy: user?.userId ?? 0,
        ...(isEdit && { updatedBy: user?.userId || 0 }),
      },
      journalDetails: journalDetailsFiltered.map((detail: any) => ({
        ...detail,
        notes: detail.notes || '',
        remarks: detail.remarks || '',
        createdBy: user?.userId ?? 0,
        ...(isEdit && { updatedBy: user?.userId || 0 }),
        ...(isEdit &&
          (values.journalEntry as any).voucherid && {
            voucherId: (values.journalEntry as any).voucherid,
          }),
        bankaccountid: null,
      })),
    }

    if (isEdit && bankDetail) {
      updatedValues.journalDetails.push({
        ...bankDetail,
        debit:
          formState.formType === 'Debit'
            ? updatedValues.journalEntry.amountTotal
            : 0,
        credit:
          formState.formType === 'Credit'
            ? updatedValues.journalEntry.amountTotal
            : 0,
        updatedBy: user?.userId || 0,
      })
    }

    let finalValues: any

    if (isEdit) {
      finalValues = updatedValues

      if (status === 'Draft') {
        console.log('🟢 Edit Mode - Draft Submitted')
        console.log('🚀 Final Values (ready to send):', finalValues)
      }
    } else {
      finalValues = {
        ...updatedValues,
        journalDetails: [
          ...updatedValues.journalDetails,
          {
            accountId: formState.selectedBankAccount?.glCode || 0,
            costCenterId: null,
            departmentId: null,
            debit:
              formState.formType === 'Debit'
                ? updatedValues.journalEntry.amountTotal
                : 0,
            credit:
              formState.formType === 'Credit'
                ? updatedValues.journalEntry.amountTotal
                : 0,
            analyticTags: null,
            taxId: null,
            resPartnerId: null,
            bankaccountid: formState.selectedBankAccount?.id,
            createdBy: user?.userId ?? 0,
          },
        ],
      }

      console.log('🟢 [CREATE MODE] Final Values Sent to API:', JSON.stringify(finalValues, null, 2))
    }

    try {
      if (isEdit) {
        const response = await editJournalEntryWithDetails(
          finalValues as JournalEditWithDetails,
          token
        )

        if (response.error || !response.data) {
          toast({
            title: 'Error',
            description: response.error?.message || 'Error editing Journal',
          })
        } else {
          setDataLoaded(false)
          const mycompanies = getCompanyIds(formState.companies)
          const mylocations = getLocationIds(formState.locations)
          await getallVoucher(mycompanies, mylocations)

          toast({
            title: 'Success',
            description: 'Voucher is edited successfully',
          })
          if (onSuccess) onSuccess()
          if (onClose) onClose()

          setTimeout(
            () =>
              form.reset({
                journalEntry: {
                  date: new Date().toISOString().split('T')[0],
                  journalType: VoucherTypes.BankVoucher,
                  companyId: 0,
                  locationId: 0,
                  currencyId: 1,
                  exchangeRate: 1,
                  amountTotal: 0,
                  payTo: '',
                  notes: '',
                  createdBy: 0,
                },
                journalDetails: [
                  {
                    accountId: 0,
                    costCenterId: null,
                    departmentId: null,
                    debit: 0,
                    credit: 0,
                    analyticTags: null,
                    taxId: null,
                    resPartnerId: null,
                    bankaccountid: null,
                    notes: '',
                    createdBy: 0,
                  },
                ],
              }),
            100
          )
        }
      } else {
        const response = await createJournalEntryWithDetails(finalValues, token)

        if (response.error || !response.data) {
          toast({
            title: 'Error',
            description: response.error?.message || 'Error creating Journal',
          })
        } else {
          // Save successful values to localStorage
          saveLastUsedValues(values)
          
          setDataLoaded(false)
          const mycompanies = getCompanyIds(formState.companies)
          const mylocations = getLocationIds(formState.locations)
          await getallVoucher(mycompanies, mylocations)

          toast({
            title: 'Success',
            description: 'Voucher is created successfully',
          })

          if (onClose) onClose()
          // Keep dialog open for quick multiple entries
          // setIsDialogOpen(false)

          // Only reset the fields that change between vouchers
          // Keep: Company, Location, Type, Bank Account, Date
          setTimeout(
            () => {
              const currentCompanyId = form.getValues('journalEntry.companyId')
              const currentLocationId = form.getValues('journalEntry.locationId')
              const currentDate = form.getValues('journalEntry.date')
              
              form.reset({
                journalEntry: {
                  date: currentDate, // Keep same date
                  journalType: VoucherTypes.BankVoucher,
                  companyId: currentCompanyId, // Keep same company
                  locationId: currentLocationId, // Keep same location
                  currencyId: 1,
                  exchangeRate: 1,
                  amountTotal: 0, // Clear amount
                  payTo: '', // Clear receiver
                  notes: '', // Clear notes
                  createdBy: 0,
                },
                journalDetails: [
                  {
                    accountId: 0,
                    costCenterId: null,
                    departmentId: null,
                    employeeId: null,
                    debit: 0,
                    credit: 0,
                    analyticTags: null,
                    taxId: null,
                    resPartnerId: null,
                    bankaccountid: null,
                    notes: '',
                    createdBy: 0,
                  },
                ],
              })
              
              // Keep the bank account and type selected
              // They are already in formState, no need to change
            },
            100
          )
        }
      }
    } catch (error) {
      console.error('❌ Error in onSubmit:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
      })
    }
  }

  const columns = [
    { key: 'voucherno' as const, label: 'Voucher No.' },
    { key: 'date' as const, label: 'Date' },
    { key: 'companyname' as const, label: 'Company Name' },
    { key: 'location' as const, label: 'Location' },
    { key: 'currency' as const, label: 'Currency' },
    { key: 'totalamount' as const, label: 'Amount' },
    { key: 'state' as const, label: 'Status' },
  ]

  const linkGenerator = (voucherId: number) =>
    `/voucher-list/single-voucher-details/${voucherId}?voucherType=${VoucherTypes.BankVoucher}`

  return (
    <div className="w-[97%] mx-auto py-10">
      {!initialData && (
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Bank Vouchers</h1>
          <Button
            onClick={() => {
              // Reset the ref so bank account can be restored again
              hasRestoredBankAccount.current = false
              
              // Get latest last used values
              const latestValues = getLastUsedValues()
              
              // Reset form with last used values
              form.reset({
                journalEntry: {
                  date: latestValues?.date || new Date().toISOString().split('T')[0],
                  journalType: VoucherTypes.BankVoucher,
                  companyId: latestValues?.companyId || 0,
                  locationId: latestValues?.locationId || 0,
                  currencyId: 1,
                  exchangeRate: 1,
                  amountTotal: 0,
                  payTo: '',
                  notes: '',
                  createdBy: 0,
                },
                journalDetails: [
                  {
                    accountId: 0,
                    costCenterId: null,
                    departmentId: null,
                    employeeId: null,
                    debit: 0,
                    credit: 0,
                    analyticTags: null,
                    taxId: null,
                    resPartnerId: null,
                    bankaccountid: null,
                    notes: '',
                    createdBy: 0,
                  },
                ],
              })
              
              // Update formState with last used values
              setFormState(prev => ({
                ...prev,
                formType: latestValues?.formType || 'Credit',
                selectedBankAccount: null, // Will be restored by useEffect
              }))
              
              // Show banner if we have saved values
              if (latestValues && (latestValues.companyId || latestValues.bankAccountId)) {
                setShowLastUsedBanner(true)
              }
              
              setIsDialogOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> ADD
          </Button>
        </div>
      )}

      {initialData ? (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) =>
              onSubmit(values, formState.status)
            )}
            className="space-y-8"
          >
            {validationError && (
              <div className="text-red-500 text-sm mb-4">{validationError}</div>
            )}
            <BankVoucherMaster
              form={form}
              formState={formState}
              requisition={undefined}
              setFormState={setFormState}
              isEdit={isEdit}
            />
            <BankVoucherDetails
              form={form}
              formState={{
                ...formState,
                filteredChartOfAccounts: companyFilteredAccounts,
              }}
              requisition={undefined}
              partners={formState.partners}
              employees={employees}
              isEdit={isEdit}
            />
            <BankVoucherSubmit form={form} onSubmit={onSubmit} />
          </form>
        </Form>
      ) : (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} modal={true}>
          <DialogContent
            onInteractOutside={(e) => e.preventDefault()}
            className="max-w-6xl  h-[95vh] overflow-y-auto"
          >
            <DialogHeader>
              <DialogTitle>Bank Vouchers</DialogTitle>
              <DialogDescription>
                Enter the details for the bank voucher here. Click save when you
                are done.
              </DialogDescription>
            </DialogHeader>

            {/* Last Used Values Banner */}
            {showLastUsedBanner && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-blue-600 font-medium">ℹ️ Using last filled values</span>
                  <span className="text-sm text-blue-700">
                    (Company, Location, Type, Bank Account, Date)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowLastUsedBanner(false)
                    localStorage.removeItem('lastBankVoucherValues')
                    form.reset({
                      journalEntry: {
                        date: new Date().toISOString().split('T')[0],
                        journalType: VoucherTypes.BankVoucher,
                        companyId: 0,
                        locationId: 0,
                        currencyId: 1,
                        exchangeRate: 1,
                        amountTotal: 0,
                        payTo: '',
                        notes: '',
                        createdBy: 0,
                      },
                      journalDetails: [
                        {
                          accountId: 0,
                          costCenterId: null,
                          departmentId: null,
                          employeeId: null,
                          debit: 0,
                          credit: 0,
                          analyticTags: null,
                          taxId: null,
                          resPartnerId: null,
                          bankaccountid: null,
                          notes: '',
                          createdBy: 0,
                        },
                      ],
                    })
                    setFormState(prev => ({
                      ...prev,
                      selectedBankAccount: null,
                      formType: 'Credit',
                    }))
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
            )}

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((values) =>
                  onSubmit(values, formState.status)
                )}
                className="space-y-8"
              >
                {validationError && (
                  <div className="text-red-500 text-sm mb-4">
                    {validationError}
                  </div>
                )}
                <BankVoucherMaster
                  form={form}
                  formState={formState}
                  requisition={undefined}
                  setFormState={setFormState}
                  isEdit={false}
                />
                <BankVoucherDetails
                  form={form}
                  formState={{
                    ...formState,
                    filteredChartOfAccounts: companyFilteredAccounts,
                  }}
                  requisition={undefined}
                  partners={formState.partners}
                  employees={employees}
                />
                <BankVoucherSubmit form={form} onSubmit={onSubmit} />
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}

      {!initialData && (
        <VoucherList
          vouchers={voucherGrid.map((v) => ({
            ...v,
            notes: v.notes || '',
            companyname: v.companyname || '',
            location: v.location || '',
            currency: v.currency || '',
            detail_notes: v.detail_notes || '',
          }))}
          columns={columns}
          isLoading={isLoading}
          linkGenerator={linkGenerator}
          itemsPerPage={10}
        />
      )}
    </div>
  )
}



// 'use client'
// import * as React from 'react'
// import { useState, useEffect, useCallback } from 'react'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { Plus } from 'lucide-react'
// import { Button } from '@/components/ui/button'
// import { Form } from '@/components/ui/form'
// import { useRouter } from 'next/navigation'
// import { toast } from '@/hooks/use-toast'
// import {
//   type JournalEntryWithDetails,
//   JournalEntryWithDetailsSchema,
//   type JournalResult,
//   type JournalQuery,
//   VoucherTypes,
//   type User,
//   type FormStateType,
//   type JournalEditWithDetails,
// } from '@/utils/type'
// import {
//   createJournalEntryWithDetails,
//   editJournalEntryWithDetails,
//   getAllVoucher,
// } from '@/api/vouchers-api'
// import VoucherList from '@/components/voucher-list/voucher-list'
// import { Popup } from '@/utils/popup'
// import BankVoucherMaster from './bank-voucher-master'
// import BankVoucherDetails from './bank-voucher-details'
// import BankVoucherSubmit from './bank-voucher-submit'
// import { useForm } from 'react-hook-form'
// import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
// import { useAtom } from 'jotai'
// import {
//   getAllBankAccounts,
//   getAllChartOfAccounts,
//   getAllCostCenters,
//   getAllDepartments,
//   getResPartnersBySearch,
//   getEmployee,
// } from '@/api/common-shared-api'
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
// } from '@/components/ui/dialog'
// import { DialogTitle } from '@radix-ui/react-dialog'
// import { getCompanyWiseChartOfAccounts } from '@/api/chart-of-accounts-api'

// interface BankVoucherProps {
//   initialData?: JournalEntryWithDetails
//   onClose?: () => void
//   isEdit?: boolean
//   onSuccess: any
// }

// export default function BankVoucher({
//   initialData,
//   onClose,
//   isEdit,
//   onSuccess,
// }: BankVoucherProps) {
//   useInitializeUser()
//   const router = useRouter()
//   const [userData] = useAtom(userDataAtom)
//   const [token] = useAtom(tokenAtom)

//   const [voucherGrid, setVoucherGrid] = useState<JournalResult[]>([])
//   const [isDialogOpen, setIsDialogOpen] = useState(false)
//   const [isLoading, setIsLoading] = useState(false)
//   const [dataLoaded, setDataLoaded] = useState(false)
//   const [user, setUser] = useState<User | null>(null)
//   const [validationError, setValidationError] = useState<string | null>(null)
//   const [companyChartOfAccount, setCompanyChartOfAccount] = useState<any[]>([])
//   const [companyFilteredAccounts, setCompanyFilteredAccounts] = useState<any[]>([])
//   const [employees, setEmployees] = useState<any[]>([])


//   const form = useForm<JournalEntryWithDetails>({
//     resolver: zodResolver(JournalEntryWithDetailsSchema),
//     defaultValues: initialData || {
//       journalEntry: {
//         date: new Date().toISOString().split('T')[0],
//         journalType: VoucherTypes.BankVoucher,
//         companyId: 0,
//         locationId: 0,
//         currencyId: 1,
//         exchangeRate: 1,
//         amountTotal: 0,
//         payTo: '',
//         notes: '',
//         createdBy: 0,
//       },
//       journalDetails: [
//         {
//           accountId: 0,
//           costCenterId: null,
//           departmentId: null,
//           employeeId: null,
//           debit: 0,
//           credit: 0,
//           analyticTags: null,
//           taxId: null,
//           resPartnerId: null,
//           bankaccountid: null,
//           notes: '',
//           createdBy: 0,
//         },
//       ],
//     },
//   })

//   const [formState, setFormState] = useState<FormStateType>({
//     companies: [],
//     locations: [],
//     bankAccounts: [],
//     chartOfAccounts: [],
//     filteredChartOfAccounts: [],
//     costCenters: [],
//     partners: [],
//     departments: [],
//     employees: [],
//     selectedBankAccount: null,
//     formType: 'Credit',
//     status: 'Draft',
//   })

//   useEffect(() => {
//     const checkUserData = () => {
//       const storedUserData = localStorage.getItem('currentUser')
//       const storedToken = localStorage.getItem('authToken')
//       if (!storedUserData || !storedToken) router.push('/')
//     }

//     if (userData) {
//       setFormState((prev) => ({
//         ...prev,
//         companies: userData.userCompanies,
//         locations: userData.userLocations,
//       }))
//       if (!userData.voucherTypes.includes('Bank Voucher')) {
//         router.push('/unauthorized-access')
//       }
//     }
//     checkUserData()
//   }, [router, userData])

//   const fetchgetCompanyChartOfAccounts = useCallback(async () => {
//     if (!token) return
//     try {
//       const response = await getCompanyWiseChartOfAccounts(token)
//       if (response?.error?.status === 401) {
//         router.push('/unauthorized-access')
//         return
//       } else if (response.error || !response.data) {
//         console.error('Error getting company chart of accounts:', response.error)
//         toast({
//           title: 'Error',
//           description: response.error?.message || 'Failed to load company chart of accounts',
//         })
//         setCompanyChartOfAccount([])
//         return
//       } else {
//         setCompanyChartOfAccount(response.data)
//         console.log('Company Chart of Accounts:', response.data)
//       }
//     } catch (error) {
//       console.error('Error getting company chart of accounts:', error)
//       toast({
//         title: 'Error',
//         description: 'Failed to load company chart of accounts',
//       })
//       setCompanyChartOfAccount([])
//     }
//   }, [token, router])

//   const fetchEmployees = useCallback(async () => {
//     if (!token) return
//     try {
//       const response = await getEmployee(token)
//       if (response?.error?.status === 401) {
//         router.push('/unauthorized-access')
//         return
//       } else if (response.error || !response.data) {
//         console.error('Error getting employees:', response.error)
//         toast({
//           title: 'Error',
//           description: response.error?.message || 'Failed to load employees',
//         })
//         setEmployees([])
//         return
//       } else {
//         setEmployees(response.data)
//         console.log('Fetched Employees:', response.data)
//       }
//     } catch (error) {
//       console.error('Error getting employees:', error)
//       toast({
//         title: 'Error',
//         description: 'Failed to load employees',
//       })
//       setEmployees([])
//     }
//   }, [token, router])

//   useEffect(() => {
//     const fetchInitialData = async () => {
//       if (!token) return
//       const search = ''
//       const [
//         bankAccountsResponse,
//         chartOfAccountsResponse,
//         costCentersResponse,
//         partnersResponse,
//         departmentsResponse,
//       ] = await Promise.all([
//         getAllBankAccounts(token),
//         getAllChartOfAccounts(token),
//         getAllCostCenters(token),
//         getResPartnersBySearch(search, token),
//         getAllDepartments(token),
//       ])

//       if (
//         bankAccountsResponse?.error?.status === 441 ||
//         chartOfAccountsResponse?.error?.status === 441 ||
//         costCentersResponse?.error?.status === 441 ||
//         partnersResponse?.error?.status === 441 ||
//         departmentsResponse?.error?.status === 441
//       ) {
//         router.push('/unauthorized-access')
//         return
//       }

//       const filteredCoa = chartOfAccountsResponse.data?.filter(
//         (account) => !account.isGroup
//       )

//       setFormState((prev) => ({
//         ...prev,
//         bankAccounts: bankAccountsResponse.data || [],
//         chartOfAccounts: chartOfAccountsResponse.data || [],
//         filteredChartOfAccounts: filteredCoa || [],
//         costCenters: costCentersResponse.data || [],
//         partners: partnersResponse.data || [],
//         departments: departmentsResponse.data || [],
//       }))
//     }

//     fetchInitialData()
//     fetchgetCompanyChartOfAccounts()
//     fetchEmployees()
//   }, [token, router, fetchgetCompanyChartOfAccounts, fetchEmployees])

//   // NEW: Filter accounts based on selected company
//   useEffect(() => {
//     const subscription = form.watch((value) => {
//       const selectedCompanyId = value.journalEntry?.companyId

//       console.log('🔍 Company Selection Debug:')
//       console.log('Selected Company ID:', selectedCompanyId)
//       console.log('Company Chart Mappings:', companyChartOfAccount)
//       console.log('All Chart of Accounts:', formState.chartOfAccounts)
//       console.log('Filtered Chart of Accounts (non-group):', formState.filteredChartOfAccounts)

//       if (!selectedCompanyId) {
//         console.log('⚠️ No company selected - setting empty array')
//         setCompanyFilteredAccounts([])
//         return
//       }

//       if (!companyChartOfAccount.length) {
//         console.log('⚠️ No company chart mappings - setting empty array')
//         setCompanyFilteredAccounts([])
//         return
//       }

//       if (!formState.chartOfAccounts.length) {
//         console.log('⚠️ No chart of accounts loaded - setting empty array')
//         setCompanyFilteredAccounts([])
//         return
//       }

//       const companyAccountIds = companyChartOfAccount
//         .filter((mapping) => {
//           console.log(`Checking mapping: companyId ${mapping.companyId} === ${selectedCompanyId}?`, mapping.companyId === selectedCompanyId)
//           return mapping.companyId === selectedCompanyId
//         })
//         .map((mapping) => mapping.chartOfAccountId)

//       console.log('📋 Account IDs for selected company:', companyAccountIds)

//       const filtered = formState.chartOfAccounts.filter((account) => {
//         const isIncluded = companyAccountIds.includes(account.accountId)
//         const isNotGroup = account.isGroup === false
//         if (isIncluded && isNotGroup) {
//           console.log(`✓ Including account: ${account.name} (ID: ${account.accountId})`)
//         }
//         return isIncluded && isNotGroup
//       })

//       console.log('✅ Filtered Accounts for Details:', filtered)
//       console.log('Total accounts found:', filtered.length)

//       setCompanyFilteredAccounts(filtered)
//     })

//     return () => subscription.unsubscribe()
//   }, [form, companyChartOfAccount, formState.chartOfAccounts, formState.filteredChartOfAccounts])

//   // Trigger initial filter when data loads
//   useEffect(() => {
//     const selectedCompanyId = form.getValues('journalEntry.companyId')
//     if (selectedCompanyId && companyChartOfAccount.length && formState.chartOfAccounts.length) {
//       console.log('🔄 Initial trigger for company:', selectedCompanyId)
//       const companyAccountIds = companyChartOfAccount
//         .filter((mapping) => mapping.companyId === selectedCompanyId)
//         .map((mapping) => mapping.chartOfAccountId)

//       const filtered = formState.chartOfAccounts.filter(
//         (account) =>
//           companyAccountIds.includes(account.accountId) && account.isGroup === false
//       )

//       setCompanyFilteredAccounts(filtered)
//     }
//   }, [companyChartOfAccount, formState.chartOfAccounts, form])

//   useEffect(() => {
//     if (initialData) {
//       const filteredDetails = (initialData.journalDetails || []).filter(
//         (d) => d.accountId !== 108
//       )

//       const cleanedData = {
//         ...initialData,
//         journalDetails: filteredDetails,
//       }

//       form.reset(cleanedData)

//       if (filteredDetails.length > 0) {
//         const bankDetail = initialData.journalDetails.find(
//           (d) => d.bankaccountid
//         )
//         if (bankDetail && bankDetail.bankaccountid) {
//           const selectedBank = formState.bankAccounts.find(
//             (acc) => acc.id === bankDetail.bankaccountid
//           )
//           if (selectedBank) {
//             setFormState((prev) => ({
//               ...prev,
//               selectedBankAccount: {
//                 id: selectedBank.id,
//                 glCode: selectedBank.glAccountId || 0,
//               },
//               formType: bankDetail.debit > 0 ? 'Debit' : 'Credit',
//             }))
//           }
//         }
//       }
//     }
//   }, [initialData, form, formState.bankAccounts])

//   useEffect(() => {
//     if (userData) setUser(userData)
//   }, [userData])

//   const getCompanyIds = useCallback((data: any[]): number[] => {
//     return data.map((company) => company.company.companyId)
//   }, [])

//   const getLocationIds = useCallback((data: any[]): number[] => {
//     return data.map((location) => location.location.locationId)
//   }, [])

//   const getallVoucher = useCallback(
//     async (company: number[], location: number[]) => {
//       if (!token) return
//       let localVoucherGrid: JournalResult[] = []
//       try {
//         const voucherQuery: JournalQuery = {
//           date: new Date().toISOString().split('T')[0],
//           companyId: company,
//           locationId: location,
//           voucherType: VoucherTypes.BankVoucher,
//         }
//         const response = await getAllVoucher(voucherQuery, token)
//         if (response?.error?.status === 401) router.push('/unauthorized-access')
//         else if (!response.data) throw new Error('No data received from server')
//         localVoucherGrid = Array.isArray(response.data) ? response.data : []
//       } catch (error) {
//         console.error('Error getting Voucher Data:', error)
//         throw error
//       }
//       setVoucherGrid(localVoucherGrid)
//     },
//     [token, router]
//   )

//   useEffect(() => {
//     const fetchVoucherData = async () => {
//       if (
//         formState.companies.length > 0 &&
//         formState.locations.length > 0 &&
//         !dataLoaded
//       ) {
//         setIsLoading(true)
//         try {
//           const mycompanies = getCompanyIds(formState.companies)
//           const mylocations = getLocationIds(formState.locations)
//           await getallVoucher(mycompanies, mylocations)
//           setDataLoaded(true)
//         } catch (error) {
//           console.error('Error fetching voucher data:', error)
//           toast({
//             title: 'Error',
//             description: 'Failed to load voucher data. Please try again.',
//           })
//         } finally {
//           setIsLoading(false)
//         }
//       }
//     }
//     fetchVoucherData()
//   }, [
//     formState.companies,
//     formState.locations,
//     getCompanyIds,
//     getLocationIds,
//     getallVoucher,
//     dataLoaded,
//   ])

//   const onSubmit = async (values: any, status: 'Draft' | 'Posted') => {
//     const bankDetail =
//       isEdit && initialData
//         ? initialData.journalDetails.find((d: any) => d.accountId === 108)
//         : null

//     const journalDetailsFiltered = isEdit
//       ? values.journalDetails.filter((d: any) => d.accountId !== 108)
//       : values.journalDetails

//     const updatedValues = {
//       ...values,
//       journalEntry: {
//         ...values.journalEntry,
//         state: status === 'Draft' ? 0 : 1,
//         notes: values.journalEntry.notes || '',
//         journalType: 'Bank Voucher',
//         currencyId: values.journalEntry.currencyId || 1,
//         amountTotal: values.journalEntry.amountTotal,
//         createdBy: user?.userId ?? 0,
//         ...(isEdit && { updatedBy: user?.userId || 0 }),
//       },
//       journalDetails: journalDetailsFiltered.map((detail: any) => ({
//         ...detail,
//         notes: detail.notes || '',
//         remarks: detail.remarks || '',
//         createdBy: user?.userId ?? 0,
//         ...(isEdit && { updatedBy: user?.userId || 0 }),
//         ...(isEdit &&
//           (values.journalEntry as any).voucherid && {
//             voucherId: (values.journalEntry as any).voucherid,
//           }),
//         bankaccountid: null,
//       })),
//     }

//     if (isEdit && bankDetail) {
//       updatedValues.journalDetails.push({
//         ...bankDetail,
//         debit:
//           formState.formType === 'Debit'
//             ? updatedValues.journalEntry.amountTotal
//             : 0,
//         credit:
//           formState.formType === 'Credit'
//             ? updatedValues.journalEntry.amountTotal
//             : 0,
//         updatedBy: user?.userId || 0,
//       })
//     }

//     let finalValues: any

//     if (isEdit) {
//       finalValues = updatedValues

//       if (status === 'Draft') {
//         console.log('🟢 Edit Mode - Draft Submitted')
//         console.log('🚀 Final Values (ready to send):', finalValues)
//       }
//     } else {
//       finalValues = {
//         ...updatedValues,
//         journalDetails: [
//           ...updatedValues.journalDetails,
//           {
//             accountId: formState.selectedBankAccount?.glCode || 0,
//             costCenterId: null,
//             departmentId: null,
//             debit:
//               formState.formType === 'Debit'
//                 ? updatedValues.journalEntry.amountTotal
//                 : 0,
//             credit:
//               formState.formType === 'Credit'
//                 ? updatedValues.journalEntry.amountTotal
//                 : 0,
//             analyticTags: null,
//             taxId: null,
//             resPartnerId: null,
//             bankaccountid: formState.selectedBankAccount?.id,
//             createdBy: user?.userId ?? 0,
//           },
//         ],
//       }

//       console.log('🟢 [CREATE MODE] Final Values Sent to API:', JSON.stringify(finalValues, null, 2))
//     }

//     try {
//       if (isEdit) {
//         const response = await editJournalEntryWithDetails(
//           finalValues as JournalEditWithDetails,
//           token
//         )

//         if (response.error || !response.data) {
//           toast({
//             title: 'Error',
//             description: response.error?.message || 'Error editing Journal',
//           })
//         } else {
//           setDataLoaded(false)
//           const mycompanies = getCompanyIds(formState.companies)
//           const mylocations = getLocationIds(formState.locations)
//           await getallVoucher(mycompanies, mylocations)

//           toast({
//             title: 'Success',
//             description: 'Voucher is edited successfully',
//           })
//           if (onSuccess) onSuccess()
//           if (onClose) onClose()

//           setTimeout(
//             () =>
//               form.reset({
//                 journalEntry: {
//                   date: new Date().toISOString().split('T')[0],
//                   journalType: VoucherTypes.BankVoucher,
//                   companyId: 0,
//                   locationId: 0,
//                   currencyId: 1,
//                   exchangeRate: 1,
//                   amountTotal: 0,
//                   payTo: '',
//                   notes: '',
//                   createdBy: 0,
//                 },
//                 journalDetails: [
//                   {
//                     accountId: 0,
//                     costCenterId: null,
//                     departmentId: null,
//                     debit: 0,
//                     credit: 0,
//                     analyticTags: null,
//                     taxId: null,
//                     resPartnerId: null,
//                     bankaccountid: null,
//                     notes: '',
//                     createdBy: 0,
//                   },
//                 ],
//               }),
//             100
//           )
//         }
//       } else {
//         const response = await createJournalEntryWithDetails(finalValues, token)

//         if (response.error || !response.data) {
//           toast({
//             title: 'Error',
//             description: response.error?.message || 'Error creating Journal',
//           })
//         } else {
//           setDataLoaded(false)
//           const mycompanies = getCompanyIds(formState.companies)
//           const mylocations = getLocationIds(formState.locations)
//           await getallVoucher(mycompanies, mylocations)

//           toast({
//             title: 'Success',
//             description: 'Voucher is created successfully',
//           })

//           if (onClose) onClose()
//           // setIsDialogOpen(false)

//           setTimeout(
//             () =>
//               form.reset({
//                 journalEntry: {
//                   date: new Date().toISOString().split('T')[0],
//                   journalType: VoucherTypes.BankVoucher,
//                   companyId: 0,
//                   locationId: 0,
//                   currencyId: 1,
//                   exchangeRate: 1,
//                   amountTotal: 0,
//                   payTo: '',
//                   notes: '',
//                   createdBy: 0,
//                 },
//                 journalDetails: [
//                   {
//                     accountId: 0,
//                     costCenterId: null,
//                     departmentId: null,
//                     debit: 0,
//                     credit: 0,
//                     analyticTags: null,
//                     taxId: null,
//                     resPartnerId: null,
//                     bankaccountid: null,
//                     notes: '',
//                     createdBy: 0,
//                   },
//                 ],
//               }),
//             100
//           )
//         }
//       }
//     } catch (error) {
//       console.error('❌ Error in onSubmit:', error)
//       toast({
//         title: 'Error',
//         description: 'An unexpected error occurred',
//       })
//     }
//   }

//   const columns = [
//     { key: 'voucherno' as const, label: 'Voucher No.' },
//     { key: 'date' as const, label: 'Date' },
//     { key: 'companyname' as const, label: 'Company Name' },
//     { key: 'location' as const, label: 'Location' },
//     { key: 'currency' as const, label: 'Currency' },
//     { key: 'totalamount' as const, label: 'Amount' },
//     { key: 'state' as const, label: 'Status' },
//   ]

//   const linkGenerator = (voucherId: number) =>
//     `/voucher-list/single-voucher-details/${voucherId}?voucherType=${VoucherTypes.BankVoucher}`

//   return (
//     <div className="w-[97%] mx-auto py-10">
//       {!initialData && (
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-2xl font-bold">Bank Vouchers</h1>
//           <Button
//             onClick={() => {
//               form.reset()
//               setIsDialogOpen(true)
//             }}
//           >
//             <Plus className="mr-2 h-4 w-4" /> ADD
//           </Button>
//         </div>
//       )}

//       {initialData ? (
//         <Form {...form}>
//           <form
//             onSubmit={form.handleSubmit((values) =>
//               onSubmit(values, formState.status)
//             )}
//             className="space-y-8"
//           >
//             {validationError && (
//               <div className="text-red-500 text-sm mb-4">{validationError}</div>
//             )}
//             <BankVoucherMaster
//               form={form}
//               formState={formState}
//               requisition={undefined}
//               setFormState={setFormState}
//               isEdit={isEdit}
//             />
//             <BankVoucherDetails
//               form={form}
//               formState={{
//                 ...formState,
//                 filteredChartOfAccounts: companyFilteredAccounts,
//               }}
//               requisition={undefined}
//               partners={formState.partners}
//               employees={employees}
//               isEdit={isEdit}
//             />
//             <BankVoucherSubmit form={form} onSubmit={onSubmit} />
//           </form>
//         </Form>
//       ) : (
//         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} modal={true}>
//           <DialogContent
//             onInteractOutside={(e) => e.preventDefault()}
//             className="max-w-6xl  h-[95vh] overflow-y-auto"
//           >
//             <DialogHeader>
//               <DialogTitle>Bank Vouchers</DialogTitle>
//               <DialogDescription>
//                 Enter the details for the bank voucher here. Click save when you
//                 are done.
//               </DialogDescription>
//             </DialogHeader>

//             <Form {...form}>
//               <form
//                 onSubmit={form.handleSubmit((values) =>
//                   onSubmit(values, formState.status)
//                 )}
//                 className="space-y-8"
//               >
//                 {validationError && (
//                   <div className="text-red-500 text-sm mb-4">
//                     {validationError}
//                   </div>
//                 )}
//                 <BankVoucherMaster
//                   form={form}
//                   formState={formState}
//                   requisition={undefined}
//                   setFormState={setFormState}
//                   isEdit={false}
//                 />
//                 <BankVoucherDetails
//                   form={form}
//                   formState={{
//                     ...formState,
//                     filteredChartOfAccounts: companyFilteredAccounts,
//                   }}
//                   requisition={undefined}
//                   partners={formState.partners}
//                   employees={employees}
//                 />
//                 <BankVoucherSubmit form={form} onSubmit={onSubmit} />
//               </form>
//             </Form>
//           </DialogContent>
//         </Dialog>
//       )}

//       {!initialData && (
//         <VoucherList
//           vouchers={voucherGrid.map((v) => ({
//             ...v,
//             notes: v.notes || '',
//             companyname: v.companyname || '',
//             location: v.location || '',
//             currency: v.currency || '',
//             detail_notes: v.detail_notes || '',
//           }))}
//           columns={columns}
//           isLoading={isLoading}
//           linkGenerator={linkGenerator}
//           itemsPerPage={10}
//         />
//       )}
//     </div>
//   )
// }