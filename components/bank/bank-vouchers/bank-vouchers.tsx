'use client'

import * as React from 'react'
import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type * as z from 'zod'
import { Plus } from 'lucide-react'
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
} from '@/utils/type'
import {
  getAllBankAccounts,
  getAllChartOfAccounts,
  getAllCostCenters,
  getAllDepartments,
  getAllResPartners,
} from '@/api/bank-vouchers-api'
import {
  createJournalEntryWithDetails,
  getAllVoucher,
} from '@/api/vouchers-api'
import VoucherList from '@/components/voucher-list/voucher-list'
import { Popup } from '@/utils/popup'
import BankVoucherMaster from './bank-voucher-master'
import BankVoucherDetails from './bank-voucher-details'
import BankVoucherSubmit from './bank-voucher-submit'

export default function BankVoucher() {
  const [voucherGrid, setVoucherGrid] = React.useState<JournalResult[]>([])
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [dataLoaded, setDataLoaded] = React.useState(false)
  const [user, setUser] = React.useState<User | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const router = useRouter()

  const form = useForm<JournalEntryWithDetails>({
    resolver: zodResolver(JournalEntryWithDetailsSchema),
    defaultValues: {
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
          accountId: 0,
          costCenterId: null,
          departmentId: null,
          debit: 0,
          credit: 0,
          analyticTags: null,
          taxId: null,
          resPartnerId: null,
          notes: '',
          createdBy: 0,
        },
      ],
    },
  })

  interface FormStateType {
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

  const [formState, setFormState] = React.useState<FormStateType>({
    companies: [],
    locations: [],
    bankAccounts: [],
    chartOfAccounts: [],
    filteredChartOfAccounts: [],
    costCenters: [],
    partners: [],
    departments: [],
    formType: 'Credit',
    selectedBankAccount: null,
    status: 'Draft',
  })

  React.useEffect(() => {
    const userStr = localStorage.getItem('currentUser')
    if (userStr) {
      const userData = JSON.parse(userStr)
      setFormState((prevState) => ({
        ...prevState,
        companies: userData.userCompanies,
        locations: userData.userLocations,
      }))
      console.log('Current user from localStorage:', userData)

      if (!userData.voucherTypes.includes('Bank Voucher')) {
        console.log('User does not have access to Bank Voucher')
        router.push('/unauthorized-access')
      }
    } else {
      console.log('No user data found in localStorage')
      router.push('/unauthorized-access')
    }
  }, [router])

  React.useEffect(() => {
    const fetchInitialData = async () => {
      const [
        bankAccountsResponse,
        chartOfAccountsResponse,
        costCentersResponse,
        partnersResponse,
        departmentsResponse,
      ] = await Promise.all([
        getAllBankAccounts(),
        getAllChartOfAccounts(),
        getAllCostCenters(),
        getAllResPartners(),
        getAllDepartments(),
      ])
      const filteredCoa = chartOfAccountsResponse.data?.filter((account) => {
        return account.isGroup === false
      })
      setFormState((prevState) => ({
        ...prevState,
        bankAccounts: bankAccountsResponse.data || [],
        chartOfAccounts: chartOfAccountsResponse.data || [],
        filteredChartOfAccounts: filteredCoa || [],
        costCenters: costCentersResponse.data || [],
        partners: partnersResponse.data || [],
        departments: departmentsResponse.data || [],
      }))
    }

    fetchInitialData()
  }, [])

  const getCompanyIds = React.useCallback((data: any[]): number[] => {
    return data.map((company) => company.company.companyId)
  }, [])

  const getLocationIds = React.useCallback((data: any[]): number[] => {
    return data.map((location) => location.location.locationId)
  }, [])

  async function getallVoucher(company: number[], location: number[]) {
    let localVoucherGrid: JournalResult[] = []
    try {
      const voucherQuery: JournalQuery = {
        date: new Date().toISOString().split('T')[0],
        companyId: company,
        locationId: location,
        voucherType: VoucherTypes.BankVoucher,
      }
      const response = await getAllVoucher(voucherQuery)
      if (!response.data) {
        throw new Error('No data received from server')
      }
      localVoucherGrid = Array.isArray(response.data) ? response.data : []
      console.log('Voucher data:', localVoucherGrid)
    } catch (error) {
      console.error('Error getting Voucher Data:', error)
      throw error
    }
    setVoucherGrid(localVoucherGrid)
  }

  React.useEffect(() => {
    const userStr = localStorage.getItem('currentUser')
    if (userStr) {
      const userData = JSON.parse(userStr)
      setUser(userData)
      console.log('Current userId from localStorage:', userData.userId)
    } else {
      console.log('No user data found in localStorage')
    }
  }, [])

  React.useEffect(() => {
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
  }, [formState.companies, formState.locations, getCompanyIds, getLocationIds])

  const onSubmit = async (
    values: z.infer<typeof JournalEntryWithDetailsSchema>,
    status: 'Draft' | 'Posted'
  ) => {
    console.log('Before Any edit', values)
    const userStr = localStorage.getItem('currentUser')
    if (userStr) {
      const userData = JSON.parse(userStr)
      console.log('Current userId from localStorage:', userData.userId)
    }

    const totalDetailsAmount = values.journalDetails.reduce(
      (sum, detail) => sum + (detail.debit || detail.credit || 0),
      0
    )

    if (Math.abs(values.journalEntry.amountTotal - totalDetailsAmount) > 0.01) {
      setValidationError(
        "The total amount in journal details doesn't match the journal entry amount total."
      )
      return
    }

    setValidationError(null)

    const updatedValues = {
      ...values,
      journalEntry: {
        ...values.journalEntry,
        state: status === 'Draft' ? 0 : 1,
        notes: values.journalEntry.notes || '',
        journalType: 'Bank Voucher',
        amountTotal: totalDetailsAmount,
        createdBy: user?.userId ?? 0,
      },
      journalDetails: values.journalDetails.map((detail) => ({
        ...detail,
        notes: detail.notes || '',
        createdBy: user?.userId ?? 0,
      })),
    }

    console.log('After Adding created by', updatedValues)

    const updateValueswithBank = {
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
          notes: updatedValues.journalEntry.notes || '',
          createdBy: user?.userId ?? 0,
        },
      ],
    }

    console.log(
      'Submitted values:',
      JSON.stringify(updateValueswithBank, null, 2)
    )

    const response = await createJournalEntryWithDetails(updateValueswithBank)
    if (response.error || !response.data) {
      toast({
        title: 'Error',
        description: response.error?.message || 'Error creating Journal',
      })
    } else {
      setDataLoaded(false)
      const mycompanies = getCompanyIds(formState.companies)
      const mylocations = getLocationIds(formState.locations)
      getallVoucher(mycompanies, mylocations)

      console.log('Voucher is created successfully', response.data)
      toast({
        title: 'Success',
        description: 'Voucher is created successfully',
      })

      // Close popup and reset form
      setIsDialogOpen(false)
      form.reset()
      setFormState({
        ...formState,
        selectedBankAccount: null,
        formType: 'Credit',
        status: 'Draft',
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bank Vouchers</h1>
        <Button
          onClick={() => {
            form.reset()
            setIsDialogOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Add
        </Button>
        <Popup
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          title="Add New Voucher"
          size="max-w-6xl"
        >
          <p className="text-sm text-muted-foreground mb-4">
            Enter the details for the bank voucher here. Click save when
            you&apos;re done.
          </p>
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
                setFormState={setFormState}
              />
              <BankVoucherDetails form={form} formState={formState} />
              <BankVoucherSubmit form={form} onSubmit={onSubmit} />
            </form>
          </Form>
        </Popup>
      </div>

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
    </div>
  )
}
