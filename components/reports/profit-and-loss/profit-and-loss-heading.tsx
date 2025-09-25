

// 'use client'

// import { Button } from '@/components/ui/button'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select'
// import { File, FileText } from 'lucide-react'

// interface ProfitAndLossHeadingProps {
//   generatePdf: () => void
//   generateExcel: () => void
//   onDocumentChange: (document: string) => void
//   selectedDocument: string
//   availableDocuments: string[]
// }

// export default function ProfitAndLossHeading({
//   generatePdf,
//   generateExcel,
//   onDocumentChange,
//   selectedDocument,
//   availableDocuments,
// }: ProfitAndLossHeadingProps) {
//   return (
//     <div className="flex items-center justify-between gap-4 p-4 border-b w-full">
//       <div className="flex items-center gap-2">
//         <Button
//           onClick={generatePdf}
//           variant="ghost"
//           size="sm"
//           className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-900 hover:bg-purple-200"
//         >
//           <FileText className="h-4 w-4" />
//           <span className="font-medium">PDF</span>
//         </Button>
//         <Button
//           onClick={generateExcel}
//           variant="ghost"
//           size="sm"
//           className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-900 hover:bg-green-200"
//         >
//           <File className="h-4 w-4" />
//           <span className="font-medium">Excel</span>
//         </Button>
//       </div>

//       <div className="flex items-center gap-4 flex-1 justify-center">
//         <div className="flex items-center gap-2">
//           <span className="font-medium text-sm">Document Type:</span>
//           <Select value={selectedDocument} onValueChange={onDocumentChange}>
//             <SelectTrigger className="w-[200px]">
//               <SelectValue placeholder="Select document type" />
//             </SelectTrigger>
//             <SelectContent>
//               {availableDocuments.map((document) => (
//                 <SelectItem key={document} value={document}>
//                   {document}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>
//       </div>

//       {/* Right side spacer */}
//       <div className="w-[100px]" />
//     </div>
//   )
// }


'use client'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { File, FileText } from 'lucide-react'

interface ProfitAndLossHeadingProps {
  generatePdf: () => void
  generateExcel: () => void
  onDocumentChange: (document: string) => void
  selectedDocument: string
  availableDocuments: string[]
  selectedDate: string
  onDateChange: (date: string) => void
}

export default function ProfitAndLossHeading({
  generatePdf,
  generateExcel,
  onDocumentChange,
  selectedDocument,
  availableDocuments,
  selectedDate,
  onDateChange,
}: ProfitAndLossHeadingProps) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 border-b w-full">
      <div className="flex items-center gap-2">
        <Button
          onClick={generatePdf}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-900 hover:bg-purple-200"
        >
          <FileText className="h-4 w-4" />
          <span className="font-medium">PDF</span>
        </Button>
        <Button
          onClick={generateExcel}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-900 hover:bg-green-200"
        >
          <File className="h-4 w-4" />
          <span className="font-medium">Excel</span>
        </Button>
      </div>

      <div className="flex items-center gap-6 flex-1 justify-center">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">Document Type:</span>
          <Select value={selectedDocument} onValueChange={onDocumentChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              {availableDocuments.map((document) => (
                <SelectItem key={document} value={document}>
                  {document}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="border rounded-md px-2 py-1 text-sm"
          />
        </div>
      </div>

      <div className="w-[100px]" />
    </div>
  )
}
