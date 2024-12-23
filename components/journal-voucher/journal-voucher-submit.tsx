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
import { Upload } from 'lucide-react'
import { JournalEntryWithDetails } from '@/utils/type'

interface JournalVoucherSubmitProps {
  form: UseFormReturn<JournalEntryWithDetails>
  onSubmit: () => void
}

export function JournalVoucherSubmit({
  form,
  onSubmit,
}: JournalVoucherSubmitProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="attachment"
        render={({ field: { value, onChange, ...field } }) => (
          <FormItem>
            <FormLabel>Attachment</FormLabel>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                onChange={(e) => onChange(e.target.files?.[0] || null)}
                className="hidden"
                id="file-upload"
                {...field}
              />
              <FormLabel htmlFor="file-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-accent">
                  <Upload className="h-4 w-4" />
                  <span>Upload File</span>
                </div>
              </FormLabel>
              {value && (
                <span className="text-sm text-muted-foreground">
                  {value.name}
                </span>
              )}
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="journalEntry.state"
        render={({ field }) => (
          <FormItem className="flex items-center gap-2">
            <FormControl>
              <Checkbox
                checked={field.value === 1}
                onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)}
              />
            </FormControl>
            <FormLabel>Draft</FormLabel>
          </FormItem>
        )}
      />

      <div className="flex justify-end gap-4">
        <Button type="submit" onClick={onSubmit}>
          {form.getValues('journalEntry.state') === 1
            ? 'Save as Draft'
            : 'Post'}
        </Button>
      </div>
    </div>
  )
}
