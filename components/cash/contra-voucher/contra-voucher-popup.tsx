'use client'

import type React from 'react'
import { useState, useEffect, useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
} from '@/components/ui/form'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, X } from 'lucide-react'
import {
  exchangeSchema,
  JournalEditWithDetails,
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
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { editJournalEntryWithDetails } from '@/api/vouchers-api'

// Updated interface to support both normal usage and duplication
interface ContraVoucherPopupProps {
  fetchAllVoucher: (company: number[], location: number[]) => void
  isOpen?: boolean // Optional for duplication mode
  onOpenChange?: (open: boolean) => void // Optional for duplication mode
  initialData?: JournalEntryWithDetails // Optional initial data for duplication
  isEdit?: boolean // Optional flag to indicate edit mode
  onClose?: () => void // Optional callback when popup closes
  closeOnOutsideClick: boolean
}

export const ContraVoucherPopup: React.FC<ContraVoucherPopupProps> = ({
  fetchAllVoucher,
  isOpen: externalIsOpen,
  onOpenChange,
  initialData,
  isEdit,
  onClose,
}) => {
  // Initialize user data
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)
  const router = useRouter()

  // State variables
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userId, setUserId] = useState<number | null>(null)

  // Determine if we're in duplication mode or normal mode
  const isDuplicationMode = initialData !== undefined
  console.log(
    '🚀 ~ ContraVoucherPopup ~ initialData -> bankaccountid:',
    initialData?.journalDetails.map((ba) => ba.bankaccountid)
  )
  console.log('🚀 ~ ContraVoucherPopup ~ initialData:', initialData)
  const isOpen = isDuplicationMode ? (externalIsOpen ?? false) : internalIsOpen
  const setIsOpen = isDuplicationMode
    ? (open: boolean) => onOpenChange?.(open)
    : setInternalIsOpen

  // Get user data from localStorage and set it to state
  useEffect(() => {
    if (userData) {
      setUserId(userData.userId)
    }
  }, [userData])

  // Create default values with useMemo to handle initialData
  const defaultValues = useMemo(() => {
    if (initialData) {
      return {
        ...initialData,
        journalEntry: {
          ...initialData.journalEntry,
          createdBy: userData?.userId || 0,
        },
        journalDetails: initialData.journalDetails.map((detail) => ({
          ...detail,
          createdBy: userData?.userId || 0,
          bankaccountid: detail.bankaccountid || 0, // ✅ fix here
        })),
      }
    }

    // Default values for new voucher
    return {
      journalEntry: {
        date: new Date().toISOString().split('T')[0],
        journalType: VoucherTypes.ContraVoucher,
        state: 0,
        companyId: 0,
        locationId: 0,
        currencyId: 1,
        exchangeRate: 1,
        amountTotal: 0,
        createdBy: userData?.userId || 0,
      },
      journalDetails: [
        {
          accountId: 0,
          debit: 0,
          credit: 0,
          createdBy: userData?.userId || 0,
        },
      ],
    }
  }, [initialData, userData?.userId])

  // Initialize form with default values
  const form = useForm<JournalEntryWithDetails>({
    resolver: zodResolver(JournalEntryWithDetailsSchema),
    defaultValues,
  })

  // Update form when userId changes or when initialData/defaultValues change
  useEffect(() => {
    if (userId !== null) {
      form.reset(defaultValues)
    }
  }, [userId, form, defaultValues])

  // Reset form when popup opens/closes
  useEffect(() => {
    if (isOpen) {
      form.reset(defaultValues)
    }
  }, [isOpen, defaultValues, form])

  const handleSubmit = async (data: JournalEntryWithDetails) => {
    if (!isEdit) {
      setIsSubmitting(true)

      const amountTotal = data.journalDetails.reduce(
        (sum, detail) => sum + Number(detail.debit),
        0
      )

      const submissionData = {
        ...data,
        journalEntry: {
          ...data.journalEntry,
          amountTotal,
          exchangeRate: data.journalEntry.exchangeRate || 1,
        },
      }

      try {
        const response = await createJournalEntryWithDetails(
          submissionData,
          token
        )

        if (response.error || !response.data) {
          throw new Error(response.error?.message || 'Failed to create voucher')
        }

        toast({
          title: 'Success',
          description: 'Voucher created successfully',
        })

        form.reset(defaultValues)
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
    } else {
      const payload: JournalEditWithDetails = {
        ...(initialData as JournalEditWithDetails),
        ...data,
        journalEntry: {
          ...(initialData as JournalEditWithDetails).journalEntry,
          ...data.journalEntry,
          id: (initialData as JournalEditWithDetails).journalEntry.id, // keep entry id
        },
        journalDetails: (data.journalDetails || []).map((detail, idx) => ({
          ...(initialData as JournalEditWithDetails).journalDetails[idx], // gives id and other required props
          ...detail, // override with edited values
        })),
      }
      const response = await editJournalEntryWithDetails(payload, token)

      if (response.error || !response.data) {
        toast({
          title: 'Error',
          description: response.error?.message || 'Error editing Journal',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Voucher is edited successfully',
        })
        form.reset()
        onClose?.()
      }
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
      {/* Only show ADD button in normal mode (not duplication mode) */}
      {!isDuplicationMode && (
        <Button onClick={() => setIsOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> ADD
        </Button>
      )}

      {/* <Popup
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
      </Popup> */}
      <Dialog open={isOpen} onOpenChange={setIsOpen} modal={true}>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()} // ✅ prevent outside click
          className="max-w-6xl h-[95vh] overflow-auto"
        >
          <DialogHeader>
            <DialogTitle>Contra Voucher</DialogTitle>
            <DialogDescription>
              Enter your voucher details here.
            </DialogDescription>
          </DialogHeader>

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
        </DialogContent>
      </Dialog>
    </>
  )
}
