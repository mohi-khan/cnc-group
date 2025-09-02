

// 'use client'

// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Label } from '@/components/ui/label'
// import { Input } from '@/components/ui/input'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select'
// import { CalendarIcon } from 'lucide-react'

// interface LoanGraphReportHeadingProps {
//   date: string
//   month: string
//   onDateChange: (newDate: string) => void
//   onMonthChange: (newMonth: string) => void
// }

// const LoanGraphReportHeading = ({
//   date,
//   month,
//   onDateChange,
//   onMonthChange,
// }: LoanGraphReportHeadingProps) => {
//   const periods = [
 
//     { value: '1', label: 'Last 1 Month' },
//     { value: '3', label: 'Last 3 Months' },
//     { value: '6', label: 'Last 6 Months' },
//     { value: '12', label: 'Last 12 Months' },
//   ]

//   return (
//     <Card className="mb-6">
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2">
         
        
//         </CardTitle>
//       </CardHeader>
//       <CardContent>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div className="space-y-2">
//             <Label htmlFor="date">Select Date</Label>
//             <Input
//               id="date"
//               type="date"
//               value={date}
//               onChange={(e) => onDateChange(e.target.value)}
//               className="w-full"
//             />
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="period">Select Period</Label>
//             <Select value={month} onValueChange={onMonthChange}>
//               <SelectTrigger>
//                 <SelectValue placeholder="Select period" />
//               </SelectTrigger>
//               <SelectContent>
//                 {periods.map((p) => (
//                   <SelectItem key={p.value} value={p.value}>
//                     {p.label}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }

// export default LoanGraphReportHeading


'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { FileText, Download } from 'lucide-react'

interface LoanGraphReportHeadingProps {
  date: string
  month: string
  onDateChange: (newDate: string) => void
  onMonthChange: (newMonth: string) => void
  onExportPDF: () => void
  onExportExcel: () => void
}

const LoanGraphReportHeading = ({
  date,
  month,
  onDateChange,
  onMonthChange,
  onExportPDF,
  onExportExcel,
}: LoanGraphReportHeadingProps) => {
  const periods = [
    { value: '1', label: 'Last 1 Month' },
    { value: '3', label: 'Last 3 Months' },
    { value: '6', label: 'Last 6 Months' },
    { value: '12', label: 'Last 12 Months' },
  ]

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Report Filters</span>
          <div className="flex gap-2">
            <Button onClick={onExportPDF} variant="outline" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button onClick={onExportExcel} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Select Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="period">Select Period</Label>
            <Select value={month} onValueChange={onMonthChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                {periods.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default LoanGraphReportHeading
