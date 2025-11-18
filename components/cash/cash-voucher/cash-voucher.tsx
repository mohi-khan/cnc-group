'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { Form } from '@/components/ui/form'
import { useRouter } from 'next/navigation'
import {
  createJournalEntryWithDetails,
  editJournalEntryWithDetails,
  getAllVoucher,
} from '@/api/vouchers-api'
import { toast } from '@/hooks/use-toast'
import {
  type AccountsHead,
  CompanyChartOfAccount,
  type CompanyFromLocalstorage,
  type CostCenter,
  Employee,
  type FormData,
  type GetDepartment,
  JournalEditWithDetails,
  type JournalEntryWithDetails,
  JournalEntryWithDetailsSchema,
  type JournalQuery,
  type JournalResult,
  type LocationFromLocalstorage,
  type ResPartner,
  type User,
  type Voucher,
  VoucherTypes,
} from '@/utils/type'
import { useFieldArray, useForm } from 'react-hook-form'
import type { z } from 'zod'
import CashVoucherMaster from './cash-voucher-master'
import CashVoucherDetails from './cash-voucher-details'
import VoucherList from '@/components/voucher-list/voucher-list'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import {
  getAllChartOfAccounts,
  getAllCostCenters,
  getAllDepartments,
  getEmployee,
  getResPartnersBySearch,
} from '@/api/common-shared-api'
import { zodResolver } from '@hookform/resolvers/zod'
import { getCompanyWiseChartOfAccounts } from '@/api/chart-of-accounts-api'

// Add props interface for duplication
interface CashVoucherProps {
  initialData?: JournalEntryWithDetails
  onClose?: () => void // Callback to close the modal/popup
  isEdit?: boolean
  onSuccess: any
}

export default function CashVoucher({
  initialData,
  onClose,
  isEdit,
  onSuccess,
}: CashVoucherProps) {
  //getting userData from jotai atom component
  const router = useRouter()
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  // State variables
  const [voucherGrid, setVoucherGrid] = React.useState<JournalResult[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [companies, setCompanies] = React.useState<CompanyFromLocalstorage[]>(
    []
  )
  const [locations, setLocations] = React.useState<LocationFromLocalstorage[]>(
    []
  )
  const [vouchers, setVouchers] = React.useState<JournalEntryWithDetails[]>([])
  const [voucherList, setVoucherList] = useState<Voucher[]>([])
  const [formData, setFormData] = useState<FormData>({
    date: '',
    company: '',
    location: '',
    currency: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [currentVoucherType, setCurrentVoucherType] = useState<string>('')
  const [chartOfAccounts, setChartOfAccounts] = React.useState<AccountsHead[]>(
    []
  )
  const [costCenters, setCostCenters] = React.useState<CostCenter[]>([])
  const [companyChartOfAccount, setCompanyChartOfAccount] = React.useState<
    CompanyChartOfAccount[]
  >([])
  const [departments, setDepartments] = React.useState<GetDepartment[]>([])
  const [partners, setPartners] = React.useState<ResPartner[]>([])
  const [filteredChartOfAccounts, setFilteredChartOfAccounts] = React.useState<
    AccountsHead[]
  >([])
  const [cashCoa, setCashCoa] = React.useState<AccountsHead[]>([])
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true)
  const [isLoadingLocations, setIsLoadingLocations] = useState(true)
  const [isLoadingPartners, setIsLoadingPartners] = useState(true)
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true)
  const [isLoadingCostCenters, setIsLoadingCostCenters] = useState(true)

  // NEW: State for company-filtered accounts
  const [companyFilteredAccounts, setCompanyFilteredAccounts] = useState<
    AccountsHead[]
  >([])
  const [employees, setEmployees] = React.useState<Employee[]>([])
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true)

  //linkGenerator is used to generate the link for the voucher details page
  const linkGenerator = (voucherId: number) =>
    `/voucher-list/single-voucher-details/${voucherId}?voucherType=${VoucherTypes.CashVoucher}`

  //Function to get user data from localStorage and set it to state
  useEffect(() => {
    const checkUserData = () => {
      const storedUserData = localStorage.getItem('currentUser')
      const storedToken = localStorage.getItem('authToken')
      if (!storedUserData || !storedToken) {
        router.push('/')
        return
      }
    }
    checkUserData()
    setIsLoadingCompanies(true)
    setIsLoadingLocations(true)
    if (userData) {
      setUser(userData)
      if (userData?.userCompanies?.length > 0) {
        setCompanies(userData.userCompanies)
      }
      if (userData?.userLocations?.length > 0) {
        setLocations(userData.userLocations)
      }
      if (!userData.voucherTypes.includes('Cash Voucher')) {
        router.push('/unauthorized-access')
      }
    } else {
      toast({
        title: 'Error',
        description: 'Failed to load user data',
      })
    }
  }, [router, userData])

  //Function to get company IDs from localStorage data
  function getCompanyIds(data: CompanyFromLocalstorage[]): number[] {
    return data.map((company) => company.company.companyId)
  }

  //Function to get location IDs from localStorage data
  function getLocationIds(data: LocationFromLocalstorage[]): number[] {
    return data.map((location) => location.location.locationId)
  }

  //Function to get all vouchers based on company and location IDs
  const getallVoucher = useCallback(
    async (company: number[], location: number[]) => {
      try {
        const voucherQuery: JournalQuery = {
          date: new Date().toISOString().split('T')[0],
          companyId: company,
          locationId: location,
          voucherType: VoucherTypes.CashVoucher,
        }
        //sending the voucherQuery to the API to get all vouchers
        const response = await getAllVoucher(voucherQuery, token)
        // Check for errors in the response. if no errors, set the voucher grid data
        if (!response.data) {
          throw new Error('No data received from server')
        }
        setVoucherGrid(Array.isArray(response.data) ? response.data : [])
      } catch (error) {
        console.error('Error getting Voucher Data:', error)
        setVoucherGrid([])
        throw error
      }
    },
    [token, setVoucherGrid]
  )

  const fetchEmployees = useCallback(async () => {
    setIsLoadingEmployees(true)
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
         console.log("Fetched Employees riad:", response.data);
      }
    } catch (error) {
      console.error('Error getting employees:', error)
      toast({
        title: 'Error',
        description: 'Failed to load employees',
      })
      setEmployees([])
    } finally {
      setIsLoadingEmployees(false)
    }
  }, [token, router])

  //Function to fetch all vouchers when companies and locations change
  // useEffect is used to fetch all vouchers when companies and locations change
  const fetchVoucherData = React.useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    try {
      const mycompanies = getCompanyIds(companies)
      const mylocations = getLocationIds(locations)
      await getallVoucher(mycompanies, mylocations)
    } catch (error) {
      console.error('Error fetching voucher data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load voucher data. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }, [token, companies, locations, getallVoucher])

  React.useEffect(() => {
    if (companies.length > 0 && locations.length > 0) {
      fetchVoucherData()
    }
  }, [companies, locations, fetchVoucherData])

  //Function to filter chart of accounts based on isGroup and isCash properties
  //useEffect is used to filter the chart of accounts when it changes
  React.useEffect(() => {
    const filteredCoa = chartOfAccounts?.filter((account) => {
      return account.isGroup === false
    })
    const isCashCoa = chartOfAccounts?.filter((account) => {
      return account.isCash === true
    })
    setFilteredChartOfAccounts(filteredCoa || [])
    setCashCoa(isCashCoa || [])
  }, [chartOfAccounts])

  //Function to fetch chart of accounts from the API
  const fetchChartOfAccounts = useCallback(async () => {
    setIsLoadingAccounts(true)
    if (!token) return
    try {
      const response = await getAllChartOfAccounts(token)
      if (response?.error?.status === 401) {
        router.push('/unauthorized-access')
        return
      } else if (response.error || !response.data) {
        console.error('Error getting chart of accounts:', response.error)
        toast({
          title: 'Error',
          description:
            response.error?.message || 'Failed to load chart of accounts',
        })
        setChartOfAccounts([])
        return
      } else {
        setChartOfAccounts(response.data)
      }
    } catch (error) {
      console.error('Error getting chart of accounts:', error)
      toast({
        title: 'Error',
        description: 'Failed to load chart of accounts',
      })
      setChartOfAccounts([])
    } finally {
      setIsLoadingAccounts(false)
    }
  }, [token, router])

  //Function to fetch departments from the API
  const fetchDepartments = useCallback(async () => {
    if (!token) return
    setIsLoadingAccounts(true)
    try {
      const response = await getAllDepartments(token)
      if (response?.error?.status === 401) {
        router.push('/unauthorized-access')
        return
      } else if (response.error || !response.data) {
        console.error('Error getting chart of accounts:', response.error)
        toast({
          title: 'Error',
          description:
            response.error?.message || 'Failed to load chart of accounts',
        })
        setDepartments([])
        return
      } else {
        setDepartments(response.data)
      }
    } catch (error) {
      console.error('Error getting chart of accounts:', error)
      toast({
        title: 'Error',
        description: 'Failed to load chart of accounts',
      })
      setDepartments([])
    } finally {
      setIsLoading(false)
    }
  }, [token, router])

  //Function to fetch cost centers from the API
  const fetchgetAllCostCenters = useCallback(async () => {
    setIsLoadingCostCenters(true)
    if (!token) return
    try {
      const response = await getAllCostCenters(token)
      if (response?.error?.status === 401) {
        router.push('/unauthorized-access')
        return
      } else if (response.error || !response.data) {
        console.error('Error getting cost centers:', response.error)
        toast({
          title: 'Error',
          description: response.error?.message || 'Failed to load cost centers',
        })
        setCostCenters([])
        return
      } else {
        setCostCenters(response.data)
      }
    } catch (error) {
      console.error('Error getting cost centers:', error)
      toast({
        title: 'Error',
        description: 'Failed to load cost centers',
      })
      setCostCenters([])
    } finally {
      setIsLoadingCostCenters(false)
    }
  }, [token, router, setCostCenters])

  //Function to fetch company wise chart of accounts from the API
  const fetchgetCompanyChartOfAccounts = useCallback(async () => {
    setIsLoadingCostCenters(true)
    if (!token) return
    try {
      const response = await getCompanyWiseChartOfAccounts(token)
      if (response?.error?.status === 401) {
        router.push('/unauthorized-access')
        return
      } else if (response.error || !response.data) {
        console.error('Error getting cost centers:', response.error)
        toast({
          title: 'Error',
          description: response.error?.message || 'Failed to load cost centers',
        })
        setCompanyChartOfAccount([])
        return
      } else {
        setCompanyChartOfAccount(response.data)
        console.log('Company Chart of Accounts:', response.data)
      }
    } catch (error) {
      console.error('Error getting cost centers:', error)
      toast({
        title: 'Error',
        description: 'Failed to load cost centers',
      })
      setCompanyChartOfAccount([])
    } finally {
      setIsLoadingCostCenters(false)
    }
  }, [token, router, setCompanyChartOfAccount])

  //Function to fetch partners from the API
  const fetchgetResPartner = useCallback(async () => {
    const search = ''
    setIsLoadingPartners(true)
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
    } finally {
      setIsLoadingPartners(false)
    }
  }, [token, router, setPartners])

  useEffect(() => {
    fetchChartOfAccounts()
    fetchgetAllCostCenters()
    fetchgetResPartner()
    fetchDepartments()
    fetchgetCompanyChartOfAccounts()
    fetchEmployees()
  }, [
    fetchChartOfAccounts,
    fetchgetAllCostCenters,
    fetchgetResPartner,
    fetchDepartments,
    fetchgetCompanyChartOfAccounts,
    fetchEmployees,
  ])

  // Function to handle voucher type change from details component
  const handleVoucherTypeChange = (voucherType: string) => {
    setCurrentVoucherType(voucherType)
  }

  //Function to handle form submission. It takes the form data and a reset function as arguments
  const form = useForm<JournalEntryWithDetails>({
    //zodResolver is used to validate the form data against the JournalEntryWithDetailsSchema
    resolver: zodResolver(JournalEntryWithDetailsSchema),
    defaultValues: initialData || {
      // Use initialData if provided
      journalEntry: {
        date: new Date().toISOString().split('T')[0],
        journalType: VoucherTypes.CashVoucher, // Ensure correct type
        companyId: 0,
        locationId: 0,
        currencyId: 1,
        amountTotal: 0,
        exchangeRate: 1,
        payTo: '',
        notes: '',
        createdBy: 0,
      },
      journalDetails: [
        {
          accountId: undefined,
          costCenterId: null,
          departmentId: null,
          employeeId: null, // Add this
          debit: 0,
          credit: 0,
          analyticTags: null,
          taxId: null,
          resPartnerId: null,
          notes: '',
          type: 'Receipt',
          createdBy: 0,
        },
      ],
    },
  })

  // Use useEffect to reset form if initialData changes (e.g., when duplicating a different voucher)
  useEffect(() => {
    if (initialData) {
      form.reset(initialData)
    }
  }, [initialData, form])

  // NEW: Filter accounts based on selected company (MOVED HERE - after form initialization)
  useEffect(() => {
    const subscription = form.watch((value) => {
      const selectedCompanyId = value.journalEntry?.companyId

      console.log('🔍 Company Selection Debug:')
      console.log('Selected Company ID:', selectedCompanyId)
      console.log('Company Chart Mappings:', companyChartOfAccount)
      console.log(
        'Company Chart Mappings Length:',
        companyChartOfAccount.length
      )
      console.log('All Chart of Accounts:', chartOfAccounts)
      console.log('All Chart of Accounts Length:', chartOfAccounts.length)
      console.log(
        'Filtered Chart of Accounts (non-group):',
        filteredChartOfAccounts
      )
      console.log(
        'Filtered Chart of Accounts Length:',
        filteredChartOfAccounts.length
      )

      if (!selectedCompanyId) {
        console.log('⚠️ No company selected - using all filtered accounts')
        setCompanyFilteredAccounts(filteredChartOfAccounts)
        return
      }

      if (!companyChartOfAccount.length) {
        console.log(
          '⚠️ No company chart mappings - using all filtered accounts'
        )
        setCompanyFilteredAccounts(filteredChartOfAccounts)
        return
      }

      if (!chartOfAccounts.length) {
        console.log('⚠️ No chart of accounts loaded - setting empty array')
        setCompanyFilteredAccounts([])
        return
      }

      // Get all chartOfAccountIds for the selected company
      const companyAccountIds = companyChartOfAccount
        .filter((mapping) => {
          console.log(
            `Checking mapping: companyId ${mapping.companyId} === ${selectedCompanyId}?`,
            mapping.companyId === selectedCompanyId
          )
          return mapping.companyId === selectedCompanyId
        })
        .map((mapping) => mapping.chartOfAccountId)

      console.log('📋 Account IDs for selected company:', companyAccountIds)

      // Filter accounts that belong to this company and are not groups
      const filtered = chartOfAccounts.filter((account) => {
        const isIncluded = companyAccountIds.includes(account.accountId)
        const isNotGroup = account.isGroup === false
        if (isIncluded && isNotGroup) {
          console.log(
            `✓ Including account: ${account.name} (ID: ${account.accountId})`
          )
        }
        return isIncluded && isNotGroup
      })

      console.log('✅ Filtered Accounts for Details:', filtered)
      console.log('Total accounts found:', filtered.length)

      setCompanyFilteredAccounts(filtered)
    })

    return () => subscription.unsubscribe()
  }, [form, companyChartOfAccount, chartOfAccounts, filteredChartOfAccounts])

  // Trigger initial filter when data loads
  useEffect(() => {
    const selectedCompanyId = form.getValues('journalEntry.companyId')
    if (
      selectedCompanyId &&
      companyChartOfAccount.length &&
      chartOfAccounts.length
    ) {
      console.log('🔄 Initial trigger for company:', selectedCompanyId)
      // Manually trigger the filter by updating the state
      const companyAccountIds = companyChartOfAccount
        .filter((mapping) => mapping.companyId === selectedCompanyId)
        .map((mapping) => mapping.chartOfAccountId)

      const filtered = chartOfAccounts.filter(
        (account) =>
          companyAccountIds.includes(account.accountId) &&
          account.isGroup === false
      )

      setCompanyFilteredAccounts(filtered)
    }
  }, [companyChartOfAccount, chartOfAccounts, form])

  const onSubmit = async (
    values: JournalEntryWithDetails,
    status: 'Draft' | 'Posted'
  ) => {
    if (userData) setUser(userData)

    // 🔍 Log input when editing and clicking "Draft"
    if (isEdit && status === 'Draft') {
      console.log('🟡 Edit Mode - Draft clicked')
      console.log('👉 Input Values (before validation):', values)
    }

    // --- Validate debit and credit equality ONLY for edit ---
    if (isEdit) {
      const totalDebit = values.journalDetails.reduce(
        (sum, detail) => sum + (detail.debit || 0),
        0
      )
      const totalCredit = values.journalDetails.reduce(
        (sum, detail) => sum + (detail.credit || 0),
        0
      )

      if (totalDebit !== totalCredit) {
        toast({
          title: 'Validation Error',
          description: 'Total debit and credit must be equal before saving.',
        })
        return
      }
    }

    // --- Prepare updatedValues with normalized resPartnerId ---
    const updatedValues: JournalEntryWithDetails = {
      ...values,
      journalEntry: {
        ...values.journalEntry,
        state: status === 'Draft' ? 0 : 1,
        notes: values.journalEntry.notes || '',
        journalType: VoucherTypes.CashVoucher,
        exchangeRate: values.journalEntry.exchangeRate || 1,
        createdBy: user?.userId || 0,
        amountTotal: isEdit
          ? values.journalDetails.reduce(
              (sum, detail) => (detail.debit || 0) + (detail.credit || 0),
              0
            )
          : values.journalDetails.reduce(
              (sum, detail) => sum + (detail.debit || 0) + (detail.credit || 0),
              0
            ),
      },
      journalDetails: values.journalDetails.map((detail) => {
        // 🔥 Normalize resPartnerId: convert string to number, keep number as is
        let normalizedResPartnerId = detail.resPartnerId

        if (detail.resPartnerId) {
          if (typeof detail.resPartnerId === 'string') {
            const parsed = Number(detail.resPartnerId)
            normalizedResPartnerId = isNaN(parsed)
              ? detail.resPartnerId
              : parsed
          }
        }

        return {
          ...detail,
          notes: detail.notes || '',
          createdBy: user?.userId || 0,
          ...(isEdit && { updatedBy: user?.userId || 0 }),
          ...(isEdit &&
            (values.journalEntry as any).voucherid && {
              voucherId: (values.journalEntry as any).voucherid,
            }),
          resPartnerId: normalizedResPartnerId,
        }
      }),
    }

    let finalValues: JournalEntryWithDetails

    if (isEdit) {
      // ✅ Edit: do NOT add cash account line
      finalValues = updatedValues

      // 🟢 Log final processed values when clicking Draft in Edit mode
      if (status === 'Draft') {
        console.log('🟢 Edit Mode - Draft Submitted')
        console.log('🚀 Final Values (ready to send):', finalValues)
      }
    } else {
      // ✅ Create: add extra cash account line
      finalValues = {
        ...updatedValues,
        journalDetails: [
          ...updatedValues.journalDetails,
          {
            accountId: cashCoa[0]?.accountId,
            departmentId: null,

            debit: updatedValues.journalDetails.reduce(
              (sum, detail) =>
                sum + (detail.type === 'Receipt' ? detail.credit || 0 : 0),
              0
            ),
            credit: updatedValues.journalDetails.reduce(
              (sum, detail) =>
                sum + (detail.type === 'Payment' ? detail.debit || 0 : 0),
              0
            ),
            analyticTags: null,
            taxId: null,
            resPartnerId: null,
            bankaccountid: null,
            notes: updatedValues.journalEntry.notes || '',
            createdBy: user?.userId || 0,
          },
        ],
      }
      console.log('🚀 Creating - finalValues:', finalValues)
    }

    try {
      const response = isEdit
        ? await editJournalEntryWithDetails(
            finalValues as JournalEditWithDetails,
            token
          )
        : await createJournalEntryWithDetails(finalValues, token)

      if (response.error || !response.data) {
        toast({
          title: 'Error',
          description:
            response.error?.message ||
            `Error ${isEdit ? 'editing' : 'creating'} Journal`,
        })
        return
      }

      toast({
        title: 'Success',
        description: `Voucher ${isEdit ? 'edited' : 'created'} successfully`,
      })

      window.dispatchEvent(new Event('voucherUpdated'))
      if (onSuccess) onSuccess()
      onClose?.()

      // --- Reset form ---
      form.reset({
        journalEntry: {
          date: new Date().toISOString().split('T')[0],
          journalType: '',
          companyId: 0,
          locationId: 0,
          currencyId: 0,
          amountTotal: 0,
          notes: '',
          createdBy: 0,
        },
        journalDetails: [
          {
            accountId: filteredChartOfAccounts[0]?.accountId,
            costCenterId: null,
            departmentId: null,
            employeeId: null, 
            debit: 0,
            credit: 0,
            analyticTags: null,
            taxId: null,
            resPartnerId: null,
            notes: '',
            type: 'Receipt',
            createdBy: 0,
          },
        ],
      })

      remove()
      append({
        accountId: filteredChartOfAccounts[0]?.accountId,
        costCenterId: null,
        departmentId: null,
        employeeId: null,
        debit: 0,
        credit: 0,
        analyticTags: null,
        taxId: null,
        resPartnerId: null,
        notes: '',
        type: 'Receipt',
        createdBy: 0,
      })

      setCurrentVoucherType('')
    } catch (err) {
      console.error(err)
      toast({
        title: 'Error',
        description: `Something went wrong ${
          isEdit ? 'editing' : 'creating'
        } Journal`,
      })
    }
  }

  //useFieldArray is used to manage the dynamic fields in the form. it allows adding and removing fields in the journalDetails array.
  const { fields, append, remove } = useFieldArray<
    JournalEntryWithDetails,
    'journalDetails'
  >({
    control: form.control,
    name: 'journalDetails',
  })
  //Function to add a new row to the journalDetails array
  //append is used to add a new entry to the journalDetails array in the form state
  const addDetailRow = () => {
    append({
      accountId: cashCoa[0]?.accountId,
      costCenterId: null,
      departmentId: null,
      employeeId: null, // Add this
      debit: 0,
      credit: 0,
      analyticTags: null,
      taxId: null,
      resPartnerId: null,
      notes: '',
      type: currentVoucherType, // Default to Receipt
      createdBy: 0,
    })
  }
  //columns is used to define the columns for the voucher list table
  const columns = [
    { key: 'voucherno' as const, label: 'Voucher No.' },
    { key: 'companyname' as const, label: 'Company Name' },
    { key: 'currency' as const, label: 'Currency' },
    { key: 'location' as const, label: 'Location' },
    { key: 'date' as const, label: 'Date' },
    { key: 'totalamount' as const, label: 'Total Amount' },
    { key: 'state' as const, label: 'Status' },
  ]
  return (
    <div className="w-full mx-auto">
      <div className="w-full mb-10 p-8">
        <h1 className="text-2xl font-bold mb-6">
          Cash Vouchers{' '}
          {currentVoucherType !== 'Mixed' &&
            currentVoucherType &&
            `(${currentVoucherType})`}
        </h1>
        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <CashVoucherMaster
              form={form}
              companies={companies}
              locations={locations}
              onCompanyChange={(companyId) => {
                // Clear account selections when company changes
                const currentDetails = form.getValues('journalDetails') || []
                currentDetails.forEach((_, index) => {
                  form.setValue(
                    `journalDetails.${index}.accountId`,
                    null as any
                  )
                })
              }}
            />
            <CashVoucherDetails
              form={form}
              filteredChartOfAccounts={companyFilteredAccounts}
              costCenters={costCenters}
              departments={departments}
              employees={employees} // Add this line
              partners={partners}
              onSubmit={onSubmit}
              onVoucherTypeChange={handleVoucherTypeChange}
              isEdit={isEdit}
            />
            {!initialData && ( // Only show VoucherList if not in duplication mode
              <div className="mb-6">
                <VoucherList
                  vouchers={voucherGrid}
                  columns={columns}
                  isLoading={isLoading}
                  linkGenerator={linkGenerator}
                  itemsPerPage={10}
                />
              </div>
            )}
          </form>
        </Form>
      </div>
    </div>
  )
}

// 'use client'
// import React, { useCallback, useEffect, useState } from 'react'
// import { Form } from '@/components/ui/form'
// import { useRouter } from 'next/navigation'
// import {
//   createJournalEntryWithDetails,
//   editJournalEntryWithDetails,
//   getAllVoucher,
// } from '@/api/vouchers-api'
// import { toast } from '@/hooks/use-toast'
// import {
//   type AccountsHead,
//   CompanyChartOfAccount,
//   type CompanyFromLocalstorage,
//   type CostCenter,
//   type FormData,
//   type GetDepartment,
//   JournalEditWithDetails,
//   type JournalEntryWithDetails,
//   JournalEntryWithDetailsSchema,
//   type JournalQuery,
//   type JournalResult,
//   type LocationFromLocalstorage,
//   type ResPartner,
//   type User,
//   type Voucher,
//   VoucherTypes,
// } from '@/utils/type'
// import { useFieldArray, useForm } from 'react-hook-form'
// import type { z } from 'zod'
// import CashVoucherMaster from './cash-voucher-master'
// import CashVoucherDetails from './cash-voucher-details'
// import VoucherList from '@/components/voucher-list/voucher-list'
// import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
// import { useAtom } from 'jotai'
// import {
//   getAllChartOfAccounts,
//   getAllCostCenters,
//   getAllDepartments,
//   getResPartnersBySearch,
// } from '@/api/common-shared-api'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { getCompanyWiseChartOfAccounts } from '@/api/chart-of-accounts-api'

// // Add props interface for duplication
// interface CashVoucherProps {
//   initialData?: JournalEntryWithDetails
//   onClose?: () => void // Callback to close the modal/popup
//   isEdit?: boolean
//   onSuccess: any
// }

// export default function CashVoucher({
//   initialData,
//   onClose,
//   isEdit,
//   onSuccess,
// }: CashVoucherProps) {
//   //getting userData from jotai atom component
//   const router = useRouter()
//   useInitializeUser()
//   const [userData] = useAtom(userDataAtom)
//   const [token] = useAtom(tokenAtom)

//   // State variables
//   const [voucherGrid, setVoucherGrid] = React.useState<JournalResult[]>([])
//   const [user, setUser] = useState<User | null>(null)
//   const [companies, setCompanies] = React.useState<CompanyFromLocalstorage[]>(
//     []
//   )
//   const [locations, setLocations] = React.useState<LocationFromLocalstorage[]>(
//     []
//   )
//   const [vouchers, setVouchers] = React.useState<JournalEntryWithDetails[]>([])
//   const [voucherList, setVoucherList] = useState<Voucher[]>([])
//   const [formData, setFormData] = useState<FormData>({
//     date: '',
//     company: '',
//     location: '',
//     currency: '',
//   })
//   const [isLoading, setIsLoading] = useState(true)
//   const [currentVoucherType, setCurrentVoucherType] = useState<string>('')
//   const [chartOfAccounts, setChartOfAccounts] = React.useState<AccountsHead[]>(
//     []
//   )
//   const [costCenters, setCostCenters] = React.useState<CostCenter[]>([])
//   const [companyChartOfAccount, setCompanyChartOfAccount] = React.useState<
//     CompanyChartOfAccount[]
//   >([])
//   const [departments, setDepartments] = React.useState<GetDepartment[]>([])
//   const [partners, setPartners] = React.useState<ResPartner[]>([])
//   const [filteredChartOfAccounts, setFilteredChartOfAccounts] = React.useState<
//     AccountsHead[]
//   >([])
//   const [cashCoa, setCashCoa] = React.useState<AccountsHead[]>([])
//   const [isLoadingCompanies, setIsLoadingCompanies] = useState(true)
//   const [isLoadingLocations, setIsLoadingLocations] = useState(true)
//   const [isLoadingPartners, setIsLoadingPartners] = useState(true)
//   const [isLoadingAccounts, setIsLoadingAccounts] = useState(true)
//   const [isLoadingCostCenters, setIsLoadingCostCenters] = useState(true)

//   //linkGenerator is used to generate the link for the voucher details page
//   const linkGenerator = (voucherId: number) =>
//     `/voucher-list/single-voucher-details/${voucherId}?voucherType=${VoucherTypes.CashVoucher}`

//   //Function to get user data from localStorage and set it to state
//   useEffect(() => {
//     const checkUserData = () => {
//       const storedUserData = localStorage.getItem('currentUser')
//       const storedToken = localStorage.getItem('authToken')
//       if (!storedUserData || !storedToken) {
//         router.push('/')
//         return
//       }
//     }
//     checkUserData()
//     setIsLoadingCompanies(true)
//     setIsLoadingLocations(true)
//     if (userData) {
//       setUser(userData)
//       if (userData?.userCompanies?.length > 0) {
//         setCompanies(userData.userCompanies)
//       }
//       if (userData?.userLocations?.length > 0) {
//         setLocations(userData.userLocations)
//       }
//       if (!userData.voucherTypes.includes('Cash Voucher')) {
//         router.push('/unauthorized-access')
//       }
//     } else {
//       toast({
//         title: 'Error',
//         description: 'Failed to load user data',
//       })
//     }
//   }, [router, userData])

//   //Function to get company IDs from localStorage data
//   function getCompanyIds(data: CompanyFromLocalstorage[]): number[] {
//     return data.map((company) => company.company.companyId)
//   }

//   //Function to get location IDs from localStorage data
//   function getLocationIds(data: LocationFromLocalstorage[]): number[] {
//     return data.map((location) => location.location.locationId)
//   }

//   //Function to get all vouchers based on company and location IDs
//   const getallVoucher = useCallback(
//     async (company: number[], location: number[]) => {
//       try {
//         const voucherQuery: JournalQuery = {
//           date: new Date().toISOString().split('T')[0],
//           companyId: company,
//           locationId: location,
//           voucherType: VoucherTypes.CashVoucher,
//         }
//         //sending the voucherQuery to the API to get all vouchers
//         const response = await getAllVoucher(voucherQuery, token)
//         // Check for errors in the response. if no errors, set the voucher grid data
//         if (!response.data) {
//           throw new Error('No data received from server')
//         }
//         setVoucherGrid(Array.isArray(response.data) ? response.data : [])
//       } catch (error) {
//         console.error('Error getting Voucher Data:', error)
//         setVoucherGrid([])
//         throw error
//       }
//     },
//     [token, setVoucherGrid]
//   )

//   //Function to fetch all vouchers when companies and locations change
//   // useEffect is used to fetch all vouchers when companies and locations change
//   const fetchVoucherData = React.useCallback(async () => {
//     if (!token) return
//     setIsLoading(true)
//     try {
//       const mycompanies = getCompanyIds(companies)
//       const mylocations = getLocationIds(locations)
//       await getallVoucher(mycompanies, mylocations)
//     } catch (error) {
//       console.error('Error fetching voucher data:', error)
//       toast({
//         title: 'Error',
//         description: 'Failed to load voucher data. Please try again.',
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }, [token, companies, locations, getallVoucher])

//   React.useEffect(() => {
//     if (companies.length > 0 && locations.length > 0) {
//       fetchVoucherData()
//     }
//   }, [companies, locations, fetchVoucherData])

//   //Function to filter chart of accounts based on isGroup and isCash properties
//   //useEffect is used to filter the chart of accounts when it changes
//   React.useEffect(() => {
//     const filteredCoa = chartOfAccounts?.filter((account) => {
//       return account.isGroup === false
//     })
//     const isCashCoa = chartOfAccounts?.filter((account) => {
//       return account.isCash === true
//     })
//     setFilteredChartOfAccounts(filteredCoa || [])
//     setCashCoa(isCashCoa || [])
//   }, [chartOfAccounts])

//   //Function to fetch chart of accounts from the API
//   const fetchChartOfAccounts = useCallback(async () => {
//     setIsLoadingAccounts(true)
//     if (!token) return
//     try {
//       const response = await getAllChartOfAccounts(token)
//       if (response?.error?.status === 401) {
//         router.push('/unauthorized-access')
//         return
//       } else if (response.error || !response.data) {
//         console.error('Error getting chart of accounts:', response.error)
//         toast({
//           title: 'Error',
//           description:
//             response.error?.message || 'Failed to load chart of accounts',
//         })
//         setChartOfAccounts([])
//         return
//       } else {
//         setChartOfAccounts(response.data)
//       }
//     } catch (error) {
//       console.error('Error getting chart of accounts:', error)
//       toast({
//         title: 'Error',
//         description: 'Failed to load chart of accounts',
//       })
//       setChartOfAccounts([])
//     } finally {
//       setIsLoadingAccounts(false)
//     }
//   }, [token, router])

//   //Function to fetch departments from the API
//   const fetchDepartments = useCallback(async () => {
//     if (!token) return
//     setIsLoadingAccounts(true)
//     try {
//       const response = await getAllDepartments(token)
//       if (response?.error?.status === 401) {
//         router.push('/unauthorized-access')
//         return
//       } else if (response.error || !response.data) {
//         console.error('Error getting chart of accounts:', response.error)
//         toast({
//           title: 'Error',
//           description:
//             response.error?.message || 'Failed to load chart of accounts',
//         })
//         setDepartments([])
//         return
//       } else {
//         setDepartments(response.data)
//       }
//     } catch (error) {
//       console.error('Error getting chart of accounts:', error)
//       toast({
//         title: 'Error',
//         description: 'Failed to load chart of accounts',
//       })
//       setDepartments([])
//     } finally {
//       setIsLoading(false)
//     }
//   }, [token, router])

//   //Function to fetch cost centers from the API
//   const fetchgetAllCostCenters = useCallback(async () => {
//     setIsLoadingCostCenters(true)
//     if (!token) return
//     try {
//       const response = await getAllCostCenters(token)
//       if (response?.error?.status === 401) {
//         router.push('/unauthorized-access')
//         return
//       } else if (response.error || !response.data) {
//         console.error('Error getting cost centers:', response.error)
//         toast({
//           title: 'Error',
//           description: response.error?.message || 'Failed to load cost centers',
//         })
//         setCostCenters([])
//         return
//       } else {
//         setCostCenters(response.data)
//       }
//     } catch (error) {
//       console.error('Error getting cost centers:', error)
//       toast({
//         title: 'Error',
//         description: 'Failed to load cost centers',
//       })
//       setCostCenters([])
//     } finally {
//       setIsLoadingCostCenters(false)
//     }
//   }, [token, router, setCostCenters])
//   //Function to fetch company wise chart of accounts from the API
//   const fetchgetCompanyChartOfAccounts = useCallback(async () => {
//     setIsLoadingCostCenters(true)
//     if (!token) return
//     try {
//       const response = await getCompanyWiseChartOfAccounts(token)
//       if (response?.error?.status === 401) {
//         router.push('/unauthorized-access')
//         return
//       } else if (response.error || !response.data) {
//         console.error('Error getting cost centers:', response.error)
//         toast({
//           title: 'Error',
//           description: response.error?.message || 'Failed to load cost centers',
//         })
//         setCompanyChartOfAccount([])
//         return
//       } else {
//         setCompanyChartOfAccount(response.data)
//         console.log('Company Chart of Accounts:', response.data)
//       }
//     } catch (error) {
//       console.error('Error getting cost centers:', error)
//       toast({
//         title: 'Error',
//         description: 'Failed to load cost centers',
//       })
//       setCompanyChartOfAccount([])
//     } finally {
//       setIsLoadingCostCenters(false)
//     }
//   }, [token, router, setCompanyChartOfAccount])

//   //Function to fetch partners from the API
//   const fetchgetResPartner = useCallback(async () => {
//     const search = ''
//     setIsLoadingPartners(true)
//     if (!token) return
//     try {
//       const response = await getResPartnersBySearch(search, token)
//       if (response?.error?.status === 401) {
//         router.push('/unauthorized-access')
//         return
//       } else if (response.error || !response.data) {
//         console.error('Error getting partners:', response.error)
//         toast({
//           title: 'Error',
//           description: response.error?.message || 'Failed to load partners',
//         })
//         setPartners([])
//         return
//       } else {
//         setPartners(response.data)
//       }
//     } catch (error) {
//       console.error('Error getting partners:', error)
//       toast({
//         title: 'Error',
//         description: 'Failed to load partners',
//       })
//       setPartners([])
//     } finally {
//       setIsLoadingPartners(false)
//     }
//   }, [token, router, setPartners])

//   useEffect(() => {
//     fetchChartOfAccounts()
//     fetchgetAllCostCenters()
//     fetchgetResPartner()
//     fetchDepartments()
//     fetchgetCompanyChartOfAccounts()
//   }, [
//     fetchChartOfAccounts,
//     fetchgetAllCostCenters,
//     fetchgetResPartner,
//     fetchDepartments,
//     fetchgetCompanyChartOfAccounts,
//   ])

//   // Function to handle voucher type change from details component
//   const handleVoucherTypeChange = (voucherType: string) => {
//     setCurrentVoucherType(voucherType)
//   }

//   //Function to handle form submission. It takes the form data and a reset function as arguments
//   const form = useForm<JournalEntryWithDetails>({
//     //zodResolver is used to validate the form data against the JournalEntryWithDetailsSchema
//     resolver: zodResolver(JournalEntryWithDetailsSchema),
//     defaultValues: initialData || {
//       // Use initialData if provided
//       journalEntry: {
//         date: new Date().toISOString().split('T')[0],
//         journalType: VoucherTypes.CashVoucher, // Ensure correct type
//         companyId: 0,
//         locationId: 0,
//         currencyId: 1,
//         amountTotal: 0,
//         exchangeRate: 1,
//         payTo: '',
//         notes: '',
//         createdBy: 0,
//       },
//       journalDetails: [
//         {
//           accountId: undefined,
//           costCenterId: null,
//           departmentId: null,
//           debit: 0,
//           credit: 0,
//           analyticTags: null,
//           taxId: null,
//           resPartnerId: null,
//           notes: '',
//           type: 'Receipt',
//           createdBy: 0,
//         },
//       ],
//     },
//   })

//   // Use useEffect to reset form if initialData changes (e.g., when duplicating a different voucher)
//   useEffect(() => {
//     if (initialData) {
//       form.reset(initialData)
//     }
//   }, [initialData, form])

// const onSubmit = async (
//   values: JournalEntryWithDetails,
//   status: 'Draft' | 'Posted'
// ) => {
//   if (userData) setUser(userData)

//   // 🔍 Log input when editing and clicking "Draft"
//   if (isEdit && status === 'Draft') {
//     console.log('🟡 Edit Mode - Draft clicked')
//     console.log('👉 Input Values (before validation):', values)
//   }

//   // --- Validate debit and credit equality ONLY for edit ---
//   if (isEdit) {
//     const totalDebit = values.journalDetails.reduce(
//       (sum, detail) => sum + (detail.debit || 0),
//       0
//     )
//     const totalCredit = values.journalDetails.reduce(
//       (sum, detail) => sum + (detail.credit || 0),
//       0
//     )

//     if (totalDebit !== totalCredit) {
//       toast({
//         title: 'Validation Error',
//         description: 'Total debit and credit must be equal before saving.',
//       })
//       return
//     }
//   }

//   // --- Prepare updatedValues with normalized resPartnerId ---
//   const updatedValues: JournalEntryWithDetails = {
//     ...values,
//     journalEntry: {
//       ...values.journalEntry,
//       state: status === 'Draft' ? 0 : 1,
//       notes: values.journalEntry.notes || '',
//       journalType: VoucherTypes.CashVoucher,
//       exchangeRate: values.journalEntry.exchangeRate || 1,
//       createdBy: user?.userId || 0,
//       amountTotal: isEdit
//         ? values.journalDetails.reduce(
//             (sum, detail) => (detail.debit || 0) + (detail.credit || 0),
//             0
//           )
//         : values.journalDetails.reduce(
//             (sum, detail) =>
//               sum + (detail.debit || 0) + (detail.credit || 0),
//             0
//           ),
//     },
//     journalDetails: values.journalDetails.map((detail) => {
//       // 🔥 Normalize resPartnerId: convert string to number, keep number as is
//       let normalizedResPartnerId = detail.resPartnerId

//       if (detail.resPartnerId) {
//         if (typeof detail.resPartnerId === 'string') {
//           const parsed = Number(detail.resPartnerId)
//           normalizedResPartnerId = isNaN(parsed) ? detail.resPartnerId : parsed
//         }
//       }

//       return {
//         ...detail,
//         notes: detail.notes || '',
//         createdBy: user?.userId || 0,
//         ...(isEdit && { updatedBy: user?.userId || 0 }),
//         ...(isEdit &&
//           (values.journalEntry as any).voucherid && {
//             voucherId: (values.journalEntry as any).voucherid,
//           }),
//         resPartnerId: normalizedResPartnerId,
//       }
//     }),
//   }

//   let finalValues: JournalEntryWithDetails

//   if (isEdit) {
//     // ✅ Edit: do NOT add cash account line
//     finalValues = updatedValues

//     // 🟢 Log final processed values when clicking Draft in Edit mode
//     if (status === 'Draft') {
//       console.log('🟢 Edit Mode - Draft Submitted')
//       console.log('🚀 Final Values (ready to send):', finalValues)
//     }
//   } else {
//     // ✅ Create: add extra cash account line
//     finalValues = {
//       ...updatedValues,
//       journalDetails: [
//         ...updatedValues.journalDetails,
//         {
//           accountId: cashCoa[0]?.accountId,
//           departmentId: null,
//           debit: updatedValues.journalDetails.reduce(
//             (sum, detail) =>
//               sum + (detail.type === 'Receipt' ? detail.credit || 0 : 0),
//             0
//           ),
//           credit: updatedValues.journalDetails.reduce(
//             (sum, detail) =>
//               sum + (detail.type === 'Payment' ? detail.debit || 0 : 0),
//             0
//           ),
//           analyticTags: null,
//           taxId: null,
//           resPartnerId: null,
//           bankaccountid: null,
//           notes: updatedValues.journalEntry.notes || '',
//           createdBy: user?.userId || 0,
//         },
//       ],
//     }
//     console.log('🚀 Creating - finalValues:', finalValues)
//   }

//   try {
//     const response = isEdit
//       ? await editJournalEntryWithDetails(
//           finalValues as JournalEditWithDetails,
//           token
//         )
//       : await createJournalEntryWithDetails(finalValues, token)

//     if (response.error || !response.data) {
//       toast({
//         title: 'Error',
//         description:
//           response.error?.message ||
//           `Error ${isEdit ? 'editing' : 'creating'} Journal`,
//       })
//       return
//     }

//     toast({
//       title: 'Success',
//       description: `Voucher ${isEdit ? 'edited' : 'created'} successfully`,
//     })

//     window.dispatchEvent(new Event('voucherUpdated'))
//     if (onSuccess) onSuccess()
//     onClose?.()

//     // --- Reset form ---
//     form.reset({
//       journalEntry: {
//         date: new Date().toISOString().split('T')[0],
//         journalType: '',
//         companyId: 0,
//         locationId: 0,
//         currencyId: 0,
//         amountTotal: 0,
//         notes: '',
//         createdBy: 0,
//       },
//       journalDetails: [
//         {
//           accountId: filteredChartOfAccounts[0]?.accountId,
//           costCenterId: null,
//           departmentId: null,
//           debit: 0,
//           credit: 0,
//           analyticTags: null,
//           taxId: null,
//           resPartnerId: null,
//           notes: '',
//           type: 'Receipt',
//           createdBy: 0,
//         },
//       ],
//     })

//     remove()
//     append({
//       accountId: filteredChartOfAccounts[0]?.accountId,
//       costCenterId: null,
//       departmentId: null,
//       debit: 0,
//       credit: 0,
//       analyticTags: null,
//       taxId: null,
//       resPartnerId: null,
//       notes: '',
//       type: 'Receipt',
//       createdBy: 0,
//     })

//     setCurrentVoucherType('')
//   } catch (err) {
//     console.error(err)
//     toast({
//       title: 'Error',
//       description: `Something went wrong ${
//         isEdit ? 'editing' : 'creating'
//       } Journal`,
//     })
//   }
// }

//   //useFieldArray is used to manage the dynamic fields in the form. it allows adding and removing fields in the journalDetails array.
//   const { fields, append, remove } = useFieldArray<
//     JournalEntryWithDetails,
//     'journalDetails'
//   >({
//     control: form.control,
//     name: 'journalDetails',
//   })
//   //Function to add a new row to the journalDetails array
//   //append is used to add a new entry to the journalDetails array in the form state
//   const addDetailRow = () => {
//     append({
//       accountId: cashCoa[0]?.accountId,
//       costCenterId: null,
//       departmentId: null,
//       debit: 0,
//       credit: 0,
//       analyticTags: null,
//       taxId: null,
//       resPartnerId: null,
//       notes: '',
//       type: currentVoucherType, // Default to Receipt
//       createdBy: 0,
//     })
//   }
//   //columns is used to define the columns for the voucher list table
//   const columns = [
//     { key: 'voucherno' as const, label: 'Voucher No.' },
//     { key: 'companyname' as const, label: 'Company Name' },
//     { key: 'currency' as const, label: 'Currency' },
//     { key: 'location' as const, label: 'Location' },
//     { key: 'date' as const, label: 'Date' },
//     { key: 'totalamount' as const, label: 'Total Amount' },
//     { key: 'state' as const, label: 'Status' },
//   ]
//   return (
//     <div className="w-full mx-auto">
//       <div className="w-full mb-10 p-8">
//         <h1 className="text-2xl font-bold mb-6">
//           Cash Vouchers{' '}
//           {currentVoucherType !== 'Mixed' &&
//             currentVoucherType &&
//             `(${currentVoucherType})`}
//         </h1>
//         <Form {...form}>
//           <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
//             <CashVoucherMaster
//               form={form}
//               companies={companies}
//               locations={locations}

//             />
//             <CashVoucherDetails
//               form={form}
//               filteredChartOfAccounts={filteredChartOfAccounts}
//               costCenters={costCenters}
//               departments={departments}
//               partners={partners}
//               onSubmit={onSubmit}
//               onVoucherTypeChange={handleVoucherTypeChange}
//               isEdit={isEdit}
//             />
//             {!initialData && ( // Only show VoucherList if not in duplication mode
//               <div className="mb-6">
//                 <VoucherList
//                   vouchers={voucherGrid}
//                   columns={columns}
//                   isLoading={isLoading}
//                   linkGenerator={linkGenerator}
//                   itemsPerPage={10}
//                 />
//               </div>
//             )}
//           </form>
//         </Form>
//       </div>
//     </div>
//   )
// }
