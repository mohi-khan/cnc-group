"use client"

import { Button } from "@/components/ui/button"
import type { JournalEntryWithDetailsSchema } from "@/utils/type"
import type { UseFormReturn } from "react-hook-form"
import type { z } from "zod"

// This component is used to submit the bank voucher form.
// It takes the form and onSubmit function as props and calls the onSubmit function with the form values and status when the button is clicked.
interface BankVoucherSubmitProps {
  form: UseFormReturn<any>
  onSubmit: (values: z.infer<typeof JournalEntryWithDetailsSchema>, status: "Draft" | "Posted") => Promise<void>
  disabled?: boolean // Add disabled prop
}

export default function BankVoucherSubmit({
  form,
  onSubmit,
  disabled = false, // Default to false
}: BankVoucherSubmitProps) {
  
  // 
  return (
    <div className="flex justify-end space-x-2">
      <Button
        type="button"
        variant="outline"
        disabled={disabled} // Disable when there's an error
        onClick={() => {
          const values = form.getValues()
          onSubmit(values, "Draft")
        }}
      >
        Save as Draft
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={disabled} // Disable when there's an error
        onClick={() => {
          const values = form.getValues()
          onSubmit(values, "Posted")
        }}
      >
        Save as Post
      </Button>
    </div>
  )
}


// import { Button } from '@/components/ui/button'
// import { JournalEntryWithDetailsSchema } from '@/utils/type'
// import { UseFormReturn } from 'react-hook-form'
// import { z } from 'zod'

// // This component is used to submit the bank voucher form.
// // It takes the form and onSubmit function as props and calls the onSubmit function with the form values and status when the button is clicked.
// interface BankVoucherSubmitProps {
//   form: UseFormReturn<any>
//   onSubmit: (
//     values: z.infer<typeof JournalEntryWithDetailsSchema>,
//     status: 'Draft' | 'Posted'
//   ) => Promise<void>
// }

// export default function BankVoucherSubmit({
//   form,
//   onSubmit,
// }: BankVoucherSubmitProps) {

  
//   
//   // 
//   return (
//     <div className="flex justify-end space-x-2">
//       <Button
//         type="button"
//         variant="outline"
//         onClick={() => {
//           const values = form.getValues()
//           onSubmit(values, 'Draft')
//         }}
//       >
//         Save as Draft
//       </Button>
//       <Button
//         type="button"
//         variant="outline"
//         onClick={() => {
//           const values = form.getValues()
//           onSubmit(values, 'Posted')
//         }}
//       >
//         Save as Post
//       </Button>
//     </div>
//   )
// }
