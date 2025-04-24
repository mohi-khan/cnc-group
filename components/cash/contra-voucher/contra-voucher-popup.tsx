'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Plus } from 'lucide-react'

import {
  type JournalEntryWithDetails,
  JournalEntryWithDetailsSchema,
  VoucherTypes,
} from '@/utils/type'
import { createJournalEntryWithDetails } from '@/api/journal-voucher-api'
import { toast } from '@/hooks/use-toast'
import { ContraVoucherMasterSection } from './contra-voucher-master-section'
import { ContraVoucherDetailsSection } from './contra-voucher-details-section'
import { ContraVoucherSubmit } from './contra-voucher-submit'
import { Popup } from '@/utils/popup'
import { useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'

//child component props interface to define the props for the ContraVoucherPopup component
interface ChildComponentProps {
  fetchAllVoucher: (company: number[], location: number[]) => void
}

export const ContraVoucherPopup: React.FC<ChildComponentProps> = ({
  fetchAllVoucher,
}) => {
  //getting userData from jotai atom component
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)

  //state variables
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userId, setUserId] = useState<number | null>(null)

  //getting user data from localStorage and setting it to state
  useEffect(() => {
    if (userData) {
      setUserId(userData.userId)
      console.log(
        'Current userId from localStorage in everywhere:',
        userData.userId
      )
    } else {
      console.log('No user data found in localStorage')
    }
  }, [userData])

  //defaultValues is used to set the default values for the form fields
  const form = useForm<JournalEntryWithDetails>({
    //zodResolver is used to validate the form data using the JournalEntryWithDetailsSchema
    resolver: zodResolver(JournalEntryWithDetailsSchema),
    defaultValues: {
      journalEntry: {
        date: new Date().toISOString().split('T')[0],
        journalType: VoucherTypes.ContraVoucher,
        state: 0,
        companyId: 0,
        locationId: 0,
        currencyId: 0,
        amountTotal: 0,
        createdBy: undefined,
      },
      journalDetails: [
        {
          accountId: 0,
          debit: 0,
          credit: 0,
          createdBy: undefined,
        },
      ],
    },
  })

  useEffect(() => {
    if (userId !== null) {
      form.setValue('journalEntry.createdBy', userId)
      form.setValue(
        'journalDetails',
        form.getValues('journalDetails').map((detail) => ({
          ...detail,
          createdBy: userId,
        }))
      )
    }
  }, [userId, form])

  const handleSubmit = async (data: JournalEntryWithDetails) => {
    setIsSubmitting(true)
    console.log('Submitting voucher:', data)

    const amountTotal = data.journalDetails.reduce(
      (sum, detail) => sum + Number(detail.debit),
      0
    )

    const submissionData = {
      ...data,
      journalEntry: {
        ...data.journalEntry,
        amountTotal,
      },
    }

    try {
      const response = await createJournalEntryWithDetails(submissionData)
      if (response.error || !response.data) {
        throw new Error(response.error?.message || 'Failed to create voucher')
      }

      toast({
        title: 'Success',
        description: 'Voucher created successfully',
      })

      form.reset()
    } catch (error) {
      console.error('Error creating voucher:', error)
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to create voucher',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
      fetchAllVoucher(
        [data.journalEntry.companyId],
        [data.journalEntry.locationId]
      )
      setIsOpen(false)
    }
  }

  const removeEntry = (index: number) => {
    const currentEntries = form.getValues('journalDetails')
    if (currentEntries.length > 1) {
      form.setValue(
        'journalDetails',
        currentEntries.filter((_, i) => i !== index)
      )
    }
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="mr-2 h-4 w-4" /> ADD
      </Button>
      <Popup
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Contra Voucher"
        size="max-w-6xl"
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <ContraVoucherMasterSection form={form} />
            <ContraVoucherDetailsSection
              form={form}
              onRemoveEntry={removeEntry}
            />
            <ContraVoucherSubmit
              form={form}
              onSubmit={form.handleSubmit(handleSubmit)}
              isSubmitting={isSubmitting}
            />
          </form>
        </Form>
      </Popup>
    </>
  )
}
