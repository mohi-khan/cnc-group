// 'use client'
// import React from 'react'

// interface Props {
//   date: string
//   setDate: (date: string) => void
// }

// const LoanSanctionReportHeading: React.FC<Props> = ({ date, setDate }) => {
//   return (
//     <div className="flex items-center justify-between mb-4 p-3 bg-gray-100 rounded-lg shadow">
//       <h2 className="text-lg font-semibold">Loan Sanction Report</h2>
//       <div>
//         <label className="mr-2 font-medium">Select Date:</label>
//         <input
//           type="date"
//           value={date}
//           onChange={(e) => setDate(e.target.value)}
//           className="border rounded px-2 py-1"
//         />
//       </div>
//     </div>
//   )
// }

// export default LoanSanctionReportHeading


'use client'
import type React from 'react'
import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'

interface Props {
  date: string
  setDate: (date: string) => void
  generatePdf: () => void
  generateExcel: () => void
}

const LoanSanctionReportHeading: React.FC<Props> = ({
  date,
  setDate,
  generatePdf,
  generateExcel,
}) => {
  return (
    <div className="flex items-center justify-between mb-4 p-3 bg-gray-100 rounded-lg shadow">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold mr-4">Loan Sanction Report</h2>
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
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14.5 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V7.5L14.5 2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14 2V8H20"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8 13H16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8 17H16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 9H8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-medium">Excel</span>
        </Button>
      </div>

      <div>
        <label className="mr-2 font-medium">Select Date:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded px-2 py-1"
        />
      </div>
    </div>
  )
}

export default LoanSanctionReportHeading
