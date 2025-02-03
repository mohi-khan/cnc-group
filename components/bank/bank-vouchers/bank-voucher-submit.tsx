import { Button } from '@/components/ui/button'
import { JournalEntryWithDetailsSchema } from '@/utils/type'
import { UseFormReturn } from 'react-hook-form'
import { z } from 'zod'

interface BankVoucherSubmitProps {
  form: any
  onSubmit: (
    values: z.infer<typeof JournalEntryWithDetailsSchema>,
    status: 'Draft' | 'Posted'
  ) => Promise<void>
}

export default function BankVoucherSubmit({
  form,
  onSubmit,
}: {
  form: UseFormReturn<any>
  onSubmit: (values: Number, status: 'Draft' | 'Posted') => void
}) {
  return (
    <div className="flex justify-end space-x-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          const values = form.getValues()
          onSubmit(values, 'Draft')
        }}
      >
        Save as Draft
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          const values = form.getValues()
          onSubmit(values, 'Posted')
        }}
      >
        Save as Post
      </Button>
    </div>
  )
}
