'use client'
import * as React from 'react'
import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
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

import { useForm } from 'react-hook-form'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import {
  getAllBankAccounts,
  getAllChartOfAccounts,
  getAllCostCenters,
  getAllDepartments,
  getResPartnersBySearch,
  getSettings,
} from '@/api/common-shared-api'
import OpeningBalanceSubmit from './opening-balance-submit'
import OpeningBalanceMaster from './opening-balance-master'
import OpeningBalanceDetails from './opening-balance-details'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface OpeningBalanceProps {
  // fetchAllVoucher: (company: number[], location: number[]) => void
  // onOpenChange?: (open: boolean) => void // Optional for duplication mode
  initialData?: JournalEntryWithDetails // Optional initial data for duplication
  onClose?: () => void
  isEdit?: boolean
  // isOpen?: boolean
}

export default function OpeningBalance({
  // fetchAllVoucher,
  initialData,
  onClose,
  isEdit,
  // isOpen,
  // onOpenChange,
}: OpeningBalanceProps) {
  useInitializeUser()
  const router = useRouter()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const [voucherGrid, setVoucherGrid] = React.useState<JournalResult[]>([])
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [dataLoaded, setDataLoaded] = React.useState(false)
  const [user, setUser] = React.useState<User | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [settings, setSettings] = useState<number | null>(null)

  const fetchSettings = React.useCallback(async () => {
    if (!token) return
    const data = await getSettings(token, 'Difference of Opening')
    if (data.error || !data.data) {
      toast({
        title: 'Error',
        description: data.error?.message || 'Failed to get Settings',
      })
    } else {
      setSettings(data.data)
    }
  }, [token])

  React.useEffect(() => {
    fetchSettings()
  }, [settings, token, fetchSettings])

  const form = useForm<JournalEntryWithDetails>({
    resolver: zodResolver(JournalEntryWithDetailsSchema),
    defaultValues: initialData || {
      journalEntry: {
        date: new Date().toISOString().split('T')[0],
        journalType: VoucherTypes.OpeningBalance,
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
    },
  })

  const [formState, setFormState] = React.useState<FormStateType>({
    companies: [],
    locations: [],
    bankAccounts: [],
    chartOfAccounts: [],
    filteredChartOfAccounts: [],
    costCenters: [],
    partners: [],
    departments: [],
    selectedBankAccount: null,
    formType: 'Credit',
    status: 'Draft',
  })

  React.useEffect(() => {
    const checkUserData = () => {
      const storedUserData = localStorage.getItem('currentUser')
      const storedToken = localStorage.getItem('authToken')
      if (!storedUserData || !storedToken) {
        router.push('/')
        return
      }
    }

    if (userData) {
      setFormState((prevState) => ({
        ...prevState,
        companies: userData.userCompanies,
        locations: userData.userLocations,
      }))
      if (!userData.voucherTypes.includes('OB  Voucher')) {
        router.push('/unauthorized-access')
      }
    }
  }, [router, userData])

  React.useEffect(() => {
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
        (account) => account.isGroup === false
      )

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
  }, [token, router])

  React.useEffect(() => {
    if (userData) {
      setUser(userData)
    }
  }, [userData])

  const getCompanyIds = React.useCallback((data: any[]): number[] => {
    return data.map((company) => company.company.companyId)
  }, [])

  const getLocationIds = React.useCallback((data: any[]): number[] => {
    return data.map((location) => location.location.locationId)
  }, [])

  const getallVoucher = React.useCallback(
    async (company: number[], location: number[]) => {
      if (!token) return
      let localVoucherGrid: JournalResult[] = []
      try {
        const voucherQuery: JournalQuery = {
          date: new Date().toISOString().split('T')[0],
          companyId: company,
          locationId: location,
          voucherType: VoucherTypes.OpeningBalance,
        }
        const response = await getAllVoucher(voucherQuery, token)
        if (response?.error?.status === 401) {
          router.push('/unauthorized-access')
          return
        } else if (!response.data) {
          throw new Error('No data received from server')
        }
        localVoucherGrid = Array.isArray(response.data) ? response.data : []
      } catch (error) {
        console.error('Error getting Voucher Data:', error)
        throw error
      }
      setVoucherGrid(localVoucherGrid)
    },
    [token, router]
  )

  React.useEffect(() => {
    if (
      formState.companies.length > 0 &&
      formState.locations.length > 0 &&
      !dataLoaded
    ) {
      setIsLoading(true)
      const fetchVoucherData = async () => {
        try {
          const mycompanies = getCompanyIds(formState.companies)
          const mylocations = getLocationIds(formState.locations)
          await getallVoucher(mycompanies, mylocations)
          setDataLoaded(true)
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Failed to load voucher data. Please try again.',
          })
        } finally {
          setIsLoading(false)
        }
      }
      fetchVoucherData()
    }
  }, [
    formState.companies,
    formState.locations,
    getCompanyIds,
    getLocationIds,
    getallVoucher,
    dataLoaded,
  ])

  const onSubmit = async (values: any, status: 'Draft' | 'Posted') => {
    const updatedValues = {
      ...values,
      journalEntry: {
        ...values.journalEntry,
        state: status === 'Draft' ? 0 : 1,
        notes: values.journalEntry.notes || '',
        journalType: VoucherTypes.OpeningBalance,
        currencyId: values.journalEntry.currencyId || 1,
        amountTotal: values.journalEntry.amountTotal,
        createdBy: user?.userId ?? 0,
        ...(isEdit && { updatedBy: user?.userId || 0 }),
      },
      journalDetails: values.journalDetails.map((detail: any) => ({
        ...detail,
        notes: detail.notes || '',
        createdBy: user?.userId ?? 0,
        ...(isEdit && { updatedBy: user?.userId || 0 }),
        ...(isEdit &&
          (values.journalEntry as any).voucherid && {
            voucherId: (values.journalEntry as any).voucherid,
          }),
      })),
    }

    let finalValues: any
    if (isEdit === true) {
      finalValues = updatedValues
    } else {
      finalValues = {
        ...updatedValues,
        journalDetails: [
          ...updatedValues.journalDetails,
          {
            accountId: formState.selectedBankAccount?.glCode || settings || 0,
            costCenterId: null,
            departmentId: null,
            debit:
              formState.formType === 'Credit' // Reversed logic here
                ? updatedValues.journalEntry.amountTotal
                : 0,
            credit:
              formState.formType === 'Debit' // Reversed logic here
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
    }

    if (isEdit === true) {
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
        getallVoucher(mycompanies, mylocations)
        toast({
          title: 'Success',
          description: 'Voucher is edited successfully',
        })
        onClose?.()
        setIsDialogOpen(false) // ✅ close popup after submit
        form.reset()
      }
    } else {
      const response = await createJournalEntryWithDetails(finalValues, token)
      console.log('🚀 ~ onSubmit ~ finalValues:', finalValues)
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
        toast({
          title: 'Success',
          description: 'Opening Voucher is created successfully',
        })
        onClose?.()
        setIsDialogOpen(false) // ✅ close popup after submit
        form.reset()
      }
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
    `/voucher-list/single-voucher-details/${voucherId}?voucherType=${VoucherTypes.OpeningBalance}`

  return (
    <div className="w-[97%] mx-auto py-10">
      {!initialData && (
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Opening Balance</h1>
          <Button
            onClick={() => {
              form.reset()
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
            <OpeningBalanceMaster
              form={form}
              formState={formState}
              requisition={undefined}
              setFormState={setFormState}
            />
            <OpeningBalanceDetails
              form={form}
              formState={formState}
              requisition={undefined}
              partners={formState.partners}
            />
            <OpeningBalanceSubmit form={form} onSubmit={onSubmit} />
          </form>
        </Form>
      ) : (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} modal={true}>
          <DialogContent
            onInteractOutside={(e) => e.preventDefault()} // Prevent outside click from closing
            className="max-w-6xl h-[95vh] overflow-auto"
          >
            {/* Header */}
            <DialogHeader>
              <DialogTitle>Opening Balance</DialogTitle>
              <DialogDescription>
                Enter the details for the bank voucher here. Click save when
                you are done.
              </DialogDescription>
            </DialogHeader>

            {/* Form */}
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
                <OpeningBalanceMaster
                  form={form}
                  formState={formState}
                  requisition={undefined}
                  setFormState={setFormState}
                />
                <OpeningBalanceDetails
                  form={form}
                  formState={formState}
                  requisition={undefined}
                  partners={formState.partners}
                />
                <OpeningBalanceSubmit form={form} onSubmit={onSubmit} />
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
