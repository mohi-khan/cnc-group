import { UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, Upload } from 'lucide-react'
import { JournalEntryWithDetails } from '@/utils/type'

interface ContraVoucherSubmitProps {
  form: UseFormReturn<JournalEntryWithDetails>
  onSubmit: () => void
  isSubmitting: boolean
}

export function ContraVoucherSubmit({
  form,
  onSubmit,
  isSubmitting,
}: ContraVoucherSubmitProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="journalEntry.state"
        render={({ field }) => (
          <FormItem className="flex items-center gap-2 focus-within:ring-1 focus-within:ring-black focus-within:ring-offset-2 focus-within:rounded-md">
            <FormControl>
              <Checkbox
                checked={field.value === 1}
                onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)}
                disabled={isSubmitting}
              />
            </FormControl>
            <FormLabel className={isSubmitting ? 'opacity-50' : ''}>
              Draft
            </FormLabel>
          </FormItem>
        )}
      />

      <div className="flex justify-end gap-4">
        <Button type="submit" onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {form.getValues('journalEntry.state') === 1
                ? 'Saving...'
                : 'Posting...'}
            </>
          ) : form.getValues('journalEntry.state') === 1 ? (
            'Save as Draft'
          ) : (
            'Post'
          )}
        </Button>
      </div>
    </div>
  )
}
