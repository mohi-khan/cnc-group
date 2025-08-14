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
  editJournalEntryWithDetails, // Added import for edit function
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
} from '@/api/common-shared-api'

// Add props interface for duplication
interface BankVoucherProps {
  initialData?: JournalEntryWithDetails
  onClose?: () => void
  isEdit?: boolean
}

export default function BankVoucher({
  initialData,
  onClose,
  isEdit,
}: BankVoucherProps) {
  console.log('🚀 ~ BankVoucher ~ initialData:', initialData)
  //getting userData from jotai atom component
  useInitializeUser()
  const router = useRouter()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  //State Variables
  const [voucherGrid, setVoucherGrid] = React.useState<JournalResult[]>([])
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [dataLoaded, setDataLoaded] = React.useState(false)
  const [user, setUser] = React.useState<User | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  const form = useForm<JournalEntryWithDetails>({
    resolver: zodResolver(JournalEntryWithDetailsSchema),
    defaultValues: initialData || {
      // Use initialData if provided
      journalEntry: {
        date: new Date().toISOString().split('T')[0],
        journalType: VoucherTypes.BankVoucher, // Ensure correct type
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

  // Retrivin user data and set companies and locations based on user Data
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
      // Retrivin user data and set companies and locations based on user Data
      //Check If user have the previlage
      if (!userData.voucherTypes.includes('Bank Voucher')) {
        router.push('/unauthorized-access')
      }
    } else {
      // router.push('/unauthorized-access')
    }
    checkUserData()
  }, [router, userData])

  //Check If user have the previlage
  // Initialze all the Combo Box in the system
  React.useEffect(() => {
    const fetchInitialData = async () => {
      const search = ''
      if (!token) return

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
  }, [token, router])

  React.useEffect(() => {
    if (initialData) {
      form.reset(initialData)
      // Also set formState for bank-specific fields if needed
      if (initialData.journalDetails.length > 0) {
        // Find the detail that represents the bank account - handle both field name variations
        const bankDetail = initialData.journalDetails.find(
          (d) => d.bankaccountid || (d as any).bankAccountid
        )

        console.log('Found bank detail in edit mode:', bankDetail)

        if (bankDetail) {
          // Handle both field name variations - your console shows bankAccountid (camelCase)
          const bankAccountId =
            (bankDetail as any).bankAccountid || bankDetail.bankaccountid

          if (bankAccountId && formState.bankAccounts.length > 0) {
            console.log('Looking for bank account with ID:', bankAccountId)

            const selectedBank = formState.bankAccounts.find(
              (acc) => acc.id === bankAccountId
            )

            console.log('Found bank account:', selectedBank)

            if (selectedBank) {
              setFormState((prev) => ({
                ...prev,
                selectedBankAccount: {
                  id: selectedBank.id,
                  glCode: selectedBank.glAccountId || 0,
                },
                // Determine formType based on debit/credit of the bank account detail
                formType: bankDetail.debit > 0 ? 'Debit' : 'Credit',
              }))
              console.log(
                'Successfully set selected bank account:',
                selectedBank
              )
            } else if (bankAccountId) {
              // Retry mechanism in case bank accounts are still loading
              console.log('Bank account not found, retrying in 500ms...')
              setTimeout(() => {
                const retrySelectedBank = formState.bankAccounts.find(
                  (acc) => acc.id === bankAccountId
                )
                if (retrySelectedBank) {
                  setFormState((prev) => ({
                    ...prev,
                    selectedBankAccount: {
                      id: retrySelectedBank.id,
                      glCode: retrySelectedBank.glAccountId || 0,
                    },
                    formType: bankDetail.debit > 0 ? 'Debit' : 'Credit',
                  }))
                  console.log(
                    'Retry successful - Set selected bank account:',
                    retrySelectedBank
                  )
                } else {
                  console.log('Bank account still not found after retry')
                }
              }, 500)
            }
          }
        }
        
      }
    }
  }, [initialData, formState.bankAccounts,form])

  // Initialze all the Combo Box in the system
  const getCompanyIds = React.useCallback((data: any[]): number[] => {
    return data.map((company) => company.company.companyId)
  }, [])

  const getLocationIds = React.useCallback((data: any[]): number[] => {
    return data.map((location) => location.location.locationId)
  }, [])

  // fetch today's Voucher List from Database and populate the grid
  const getallVoucher = React.useCallback(
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

  // fetch today's Voucher List from Database and populate the grid
  React.useEffect(() => {
    if (userData) {
      setUser(userData)
    } else {
    }
  }, [userData])

  //Calling function for fetching voucherlist to populate the form state variables
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
  }, [
    formState.companies,
    formState.locations,
    getCompanyIds,
    getLocationIds,
    getallVoucher,
    dataLoaded,
  ])

  // Use useEffect to reset form if initialData changes
  React.useEffect(() => {
    if (initialData) {
      form.reset(initialData)
      // Also set formState for bank-specific fields if needed
      if (initialData.journalDetails.length > 0) {
        // Find the detail that represents the bank account (usually the last one added by the form)
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
              // Determine formType based on debit/credit of the bank account detail
              formType: bankDetail.debit > 0 ? 'Debit' : 'Credit',
            }))
          }
        }
      }
    }
  }, [initialData, form, formState.bankAccounts])

  //Submission Data Logic:
  // 1. Validate Data
  // 2. Check Toal Amount and ensure both debit and credit are same
  // 3. Save Data
  const onSubmit = async (values: any, status: 'Draft' | 'Posted') => {
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
      journalDetails: values.journalDetails.map((detail: any) => ({
        ...detail,
        notes: detail.notes || '',
        createdBy: user?.userId ?? 0,
        ...(isEdit && { updatedBy: user?.userId || 0 }),
        ...(isEdit &&
          (values.journalEntry as any).voucherid && {
            voucherId: (values.journalEntry as any).voucherid,
          }),
        bankaccountid: formState.selectedBankAccount?.id || null,
      })),
    }

    let finalValues: any

    if (isEdit === true) {
      // For editing, use the journal details as-is without adding bank account entry
      finalValues = updatedValues
    } else {
      // For creating new voucher, add the bank account entry
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
      console.log('🚀 ~ onSubmit ~ finalValues:', finalValues)
      // Check for errors in the response. if no error, show success message
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
        onClose?.() // Close the modal after successful submission
        // Reset the form after successful submission
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
        })
      }
    } else {
      const response = await createJournalEntryWithDetails(finalValues, token)

      console.log('🚀 ~ onSubmit ~ finalValues:', finalValues)
      console.log(
        '🚀 ~ onSubmit ~ selectedBankAccount:',
        formState.selectedBankAccount
      )

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
          description: 'Voucher is created successfully',
        })
        onClose?.() // Close the modal after successful submission
        // Reset the form after successful submission
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
        })
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

  //Creating Link for showing voucher details
  const linkGenerator = (voucherId: number) =>
    `/voucher-list/single-voucher-details/${voucherId}?voucherType=${VoucherTypes.BankVoucher}`

  return (
    <div className="w-[97%] mx-auto py-10">
      {/* Conditionally render ADD button and Popup */}
      {!initialData && (
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Bank Vouchers</h1>
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

      {/* The Popup is now controlled by the parent (SingleGenralLedger) when duplicating */}
      {/* When not duplicating, this component's internal popup logic takes over */}
      {initialData ? ( // If initialData is present, render form directly
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
            />
            <BankVoucherDetails
              form={form}
              formState={formState}
              requisition={undefined}
              partners={formState.partners}
            />
            <BankVoucherSubmit form={form} onSubmit={onSubmit} />
          </form>
        </Form> // Otherwise, use existing popup logic
      ) : (
        <Popup
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          title="Bank Vouchers"
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
                requisition={undefined}
                setFormState={setFormState}
              />
              <BankVoucherDetails
                form={form}
                formState={formState}
                requisition={undefined}
                partners={formState.partners}
              />
              <BankVoucherSubmit form={form} onSubmit={onSubmit} />
            </form>
          </Form>
        </Popup>
      )}

      {!initialData && ( // Only show VoucherList if not in duplication mode
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
