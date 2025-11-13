import { UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { JournalEntryWithDetails, JournalEditWithDetails } from '@/utils/type'
import { Loader2 } from 'lucide-react'

interface JournalVoucherSubmitProps {
  form: UseFormReturn<JournalEntryWithDetails | JournalEditWithDetails>
  onSubmit: () => void
  isSubmitting: boolean
  isBalanced: boolean
}

export function JournalVoucherSubmit({
  form,
  onSubmit,
  isSubmitting,
  isBalanced,
}: JournalVoucherSubmitProps) {
  return (
    <div className="space-y-4">
      {!isBalanced && (
        <div className="flex justify-end">
          <p className="text-red-500 text-sm font-medium">
            Debit and Credit totals must be equal to post/draft the voucher and can not be zero.
          </p>
        </div>
      )}
      <div className="flex justify-end gap-4">
        <Button
          type="submit"
          variant="outline"
          onClick={() => {
            form.setValue('journalEntry.state', 0)
            onSubmit()
          }}
          disabled={isSubmitting || !isBalanced}
        >
          {isSubmitting && form.getValues('journalEntry.state') === 0 ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save as Draft'
          )}
        </Button>
        <Button
          type="submit"
          variant="outline"
          onClick={() => {
            form.setValue('journalEntry.state', 1)
            onSubmit()
          }}
          disabled={isSubmitting || !isBalanced}
        >
          {isSubmitting && form.getValues('journalEntry.state') === 1 ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Posting...
            </>
          ) : (
            'Save as Post'
          )}
        </Button>
      </div>
    </div>
  )
}