'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Form } from '@/components/ui/form'
import { Popup } from '@/utils/popup'
import { useToast } from '@/hooks/use-toast'
import {
  type JournalEntryWithDetails,
  JournalEntryWithDetailsSchema,
  PurchaseEntryType,
  type User,
  VoucherTypes,
} from '@/utils/type'
import BankVoucherMaster from '@/components/bank/bank-vouchers/bank-voucher-master'
import BankVoucherDetails from '@/components/bank/bank-vouchers/bank-voucher-details'
import BankVoucherSubmit from '@/components/bank/bank-vouchers/bank-voucher-submit'

import type { z } from 'zod'
import { createJournalEntryWithDetails } from '@/api/vouchers-api'
import PaymentRequisitionAdvanceForm from './payment-requisition-advance-form'
import PaymentRequisitionCreateInvoiceForm from './payment-requisition-create-invoice'
import { useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { getAllBankAccounts, getAllChartOfAccounts, getAllCostCenters, getAllDepartments, getAllResPartners } from '@/api/common-shared-api'

interface PaymentRequisitionPopupProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  requisition: any // Replace with proper type
  token: string
  onSuccess: () => void
  status: string
}

export function PaymentRequisitionPopup({
  isOpen,
  onOpenChange,
  requisition,
  token,
  onSuccess,
  status,
}: PaymentRequisitionPopupProps) {
  //getting userData from jotai atom component
  useInitializeUser()
  console.log('dataaaaa', requisition)
  const [userData] = useAtom(userDataAtom)

  // State variables
  const { toast } = useToast()
  const [validationError, setValidationError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // const getCompanyIds = useCallback((data: any[]): number[] => {
  //   return data.map((company) => company.company.companyId)
  // }, [])

  // const getLocationIds = useCallback((data: any[]): number[] => {
  //   return data.map((location) => location.location.locationId)
  // }, [])

  interface FormState {
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

  const [formState, setFormState] = useState<FormState>({
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

  // Default values for the payment form
  const defaultValues = useRef({
    journalEntry: {
      date: new Date().toISOString().split('T')[0],
      journalType: VoucherTypes.BankVoucher,
      state: 0,
      companyId: requisition?.companyId || 0,
      locationId: requisition?.locationId || 0,
      currencyId: 1,
      amountTotal: requisition?.amount || 0,
      createdBy: 60,
      notes: '',
      poId: requisition?.id || null,
    },
    journalDetails: [
      {
        accountId: 0, // Account payable
        debit: requisition?.amount || 0,
        credit: 0,
        createdBy: 60,
        notes: `Payment for PO: ${requisition?.poNo || ''}`,
        resPartnerId: requisition?.vendorId || 0,
      },
    ],
  }).current

  const form = useForm<JournalEntryWithDetails>({
    resolver: zodResolver(JournalEntryWithDetailsSchema),
    defaultValues,
  })

  // Load user data when component mounts
  useEffect(() => {
    if (userData) {
      setUser(userData)

      // Load the available companies and locations for dropdown options
      setFormState((prevState) => ({
        ...prevState,
        companies: userData.userCompanies || [],
        locations: userData.userLocations || [],
      }))
    }
  }, [userData])

  // Reset form when requisition changes or popup opens/closes
  useEffect(() => {
    if (isOpen && requisition) {
      form.reset({
        ...defaultValues,
        journalEntry: {
          ...defaultValues.journalEntry,
          companyId: requisition.companyId || 0, // Use companyId from requisition
          locationId: 0, // No default location, user will select
          amountTotal: Number(requisition.amount) || 0,
          notes: '',
        },
        journalDetails: [
          {
            accountId: 0, // Account payable
            debit: Number(requisition.amount) || 0,
            credit: 0,
            createdBy: 60,
            notes: `Payment for PO: ${requisition.poNo || ''}`,
            resPartnerId: requisition?.vendorId || 0,
          },
        ],
      })
    } else if (!isOpen) {
      form.reset(defaultValues)
    }
  }, [isOpen, requisition, form, defaultValues])

  // Load user data when component mounts
  useEffect(() => {
    if (userData) {
      setUser(userData)
      setFormState((prevState) => ({
        ...prevState,
        companies: userData.userCompanies || [],
        locations: userData.userLocations || [],
      }))
    }
  }, [userData])

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
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
          getAllResPartners(token),
          getAllDepartments(token),
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
      } catch (error) {
        console.error('Error fetching initial data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load form data. Please try again.',
        })
      }
    }

    if (isOpen) {
      fetchInitialData()
    }
  }, [isOpen, toast,token])

  const onSubmit = async (
    values: z.infer<typeof JournalEntryWithDetailsSchema>,
    status: 'Draft' | 'Posted'
  ) => {
    console.log('Before Any edit', values)

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

    const updatedValues = {
      ...values,
      journalEntry: {
        ...values.journalEntry,
        state: status === 'Draft' ? 0 : 1,
        notes: values.journalEntry.notes || '',
        journalType: 'Bank Voucher',
        amountTotal: Number(totalDetailsAmount),
        createdBy: user?.userId ?? 60,
        exchangeRate: values.journalEntry.exchangeRate || 1,
      },
      journalDetails: values.journalDetails.map((detail) => ({
        ...detail,
        notes: detail.notes || '',
        createdBy: user?.userId ?? 60,
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
              ? Number(updatedValues.journalEntry.amountTotal)
              : 0,
          credit:
            formState.formType === 'Credit'
              ? Number(updatedValues.journalEntry.amountTotal)
              : 0,
          analyticTags: null,
          taxId: null,
          resPartnerId: null,
          bankaccountid: formState.selectedBankAccount?.id,
          notes: updatedValues.journalEntry.notes || '',
          createdBy: user?.userId ?? 60,
        },
      ],
    }

    console.log(
      'Submitted values:',
      JSON.stringify(updateValueswithBank, null, 2)
    )

    const response = await createJournalEntryWithDetails(updateValueswithBank, token)
    if (response.error || !response.data) {
      toast({
        title: 'Error',
        description: response.error?.message || 'Error creating Journal',
      })
    } else {
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

  // const addEntry = () => {
  //   const currentEntries = form.getValues('journalDetails')
  //   form.setValue('journalDetails', [
  //     ...currentEntries,
  //     {
  //       accountId: 0,
  //       debit: 0,
  //       credit: 0,
  //       createdBy: 60,
  //     },
  //   ])
  // }

  // const removeEntry = (index: number) => {
  //   const currentEntries = form.getValues('journalDetails')
  //   if (currentEntries.length > 2) {
  //     form.setValue(
  //       'journalDetails',
  //       currentEntries.filter((_, i) => i !== index)
  //     )
  //   }
  // }

  // Render different forms based on status
  const renderFormContent = () => {
    switch (status) {
      case 'Invoice Approved':
        return (
          <>
            <BankVoucherMaster
              form={form}
              formState={formState}
              requisition={requisition}
              setFormState={setFormState}
            />
            <BankVoucherDetails form={form} partners={formState.partners} formState={formState} requisition={requisition} />
            <BankVoucherSubmit form={form} onSubmit={onSubmit} />
          </>
        )
      case 'GRN Completed':
        return (
          <div className="w-full">
            <PaymentRequisitionCreateInvoiceForm />
          </div>
        )
      case 'Purchase Order':
        return (
          <div className="w-full">
            <PaymentRequisitionAdvanceForm
              requisition={requisition}
              token={token}
              onSuccess={() => {
                onSuccess()
                onOpenChange(false)
              }}
            />
          </div>
        )
      default:
        return <div>No form available for this status</div>
    }
  }

  const getPopupTitle = () => {
    switch (status) {
      case 'Invoice Approved':
        return 'Create Payment'
      case 'GRN Completed':
        return 'Create Invoice'
      case 'Purchase Order':
        return 'Create Advance'
      default:
        return 'Payment Requisition'
    }
  }

  return (
    <Popup
      isOpen={isOpen}
      onClose={() => onOpenChange(false)}
      title={getPopupTitle()}
      size="max-w-6xl"
    >
      {status === 'Purchase Order' ? (
        renderFormContent()
      ) : (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) =>
              onSubmit(values, formState.status)
            )}
            className="space-y-6"
          >
            {renderFormContent()}
          </form>
        </Form>
      )}
    </Popup>
  )
}
