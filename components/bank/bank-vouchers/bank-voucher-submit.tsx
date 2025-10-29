"use client"

import { Button } from "@/components/ui/button"
import type { JournalEntryWithDetailsSchema } from "@/utils/type"
import type { UseFormReturn } from "react-hook-form"
import type { z } from "zod"

interface BankVoucherSubmitProps {
  form: UseFormReturn<any>
  onSubmit: (values: z.infer<typeof JournalEntryWithDetailsSchema>, status: "Draft" | "Posted") => Promise<void>
  disabled?: boolean
}

export default function BankVoucherSubmit({
  form,
  onSubmit,
  disabled = false,
}: BankVoucherSubmitProps) {
  
  const handleSubmit = async (status: "Draft" | "Posted") => {
    // Call the validation function attached by BankVoucherDetails
    const validateBankVoucherDetails = (form as any).validateBankVoucherDetails
    
    if (validateBankVoucherDetails && !validateBankVoucherDetails()) {
      // Validation failed - don't proceed
      return
    }
    
    // If validation passes, proceed with submission
    const values = form.getValues()
    await onSubmit(values, status)
  }
  
  return (
    <div className="flex justify-end space-x-2">
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => handleSubmit("Draft")}
      >
        Save as Draft
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => handleSubmit("Posted")}
      >
        Save as Post
      </Button>
    </div>
  )
}