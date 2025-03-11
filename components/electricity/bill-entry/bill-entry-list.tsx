// 'use client'
// import { Button } from '@/components/ui/button'
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table'
// import { Plus } from 'lucide-react'
// import React from 'react'

// interface BillEntryListProps {
//   onAddCategory: () => void
// }

// const BillEntryList: React.FC<BillEntryListProps> = ({ onAddCategory }) => {
//   const data = [
//     {
//       meterName: 'Meter 1',
//       companyName: 'Company A',
//       meterType: 'Type A',
//       costCenter: 'Cost Center 1',
//       meterDescription: 'Description of Meter 1',
//       provisionAccountName: 'Account 1',
//       expenseAccountName: 'Expense 1',
//     },
//     {
//       meterName: 'Meter 2',
//       companyName: 'Company B',
//       meterType: 'Type B',
//       costCenter: 'Cost Center 2',
//       meterDescription: 'Description of Meter 2',
//       provisionAccountName: 'Account 2',
//       expenseAccountName: 'Expense 2',
//     },
//     {
//       meterName: 'Meter 3',
//       companyName: 'Company C',
//       meterType: 'Type C',
//       costCenter: 'Cost Center 3',
//       meterDescription: 'Description of Meter 3',
//       provisionAccountName: 'Account 3',
//       expenseAccountName: 'Expense 3',
//     },
//     {
//       meterName: 'Meter 4',
//       companyName: 'Company D',
//       meterType: 'Type A',
//       costCenter: 'Cost Center 4',
//       meterDescription: 'Description of Meter 4',
//       provisionAccountName: 'Account 4',
//       expenseAccountName: 'Expense 4',
//     },
//     {
//       meterName: 'Meter 5',
//       companyName: 'Company E',
//       meterType: 'Type B',
//       costCenter: 'Cost Center 5',
//       meterDescription: 'Description of Meter 5',
//       provisionAccountName: 'Account 5',
//       expenseAccountName: 'Expense 5',
//     }, // Add more data here as needed
//   ]
//   return (
//     <div>
//       <div className="p-4">
//         <div className="flex justify-between items-center mb-6">
//           <div className="flex items-center gap-4">
//             <h1 className="text-2xl font-bold">Bill List</h1>
//           </div>
//           <Button onClick={onAddCategory}>
//             <Plus className="h-4 w-4 mr-2" />
//             ADD
//           </Button>
//         </div>
//         <div>
//           <Table className="shadow-md border ">
//             <TableHeader className="bg-slate-200 shadow-md ">
//               <TableRow>
//                 <TableHead>Meter Name</TableHead>
//                 <TableHead>Company Name</TableHead>
//                 <TableHead>Meter Type</TableHead>
//                 <TableHead>Cost Center</TableHead>
//                 <TableHead>Meter Description</TableHead>
//                 <TableHead>Provision Account Name</TableHead>
//                 <TableHead>Expense Account Name</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {data.map((row, index) => (
//                 <TableRow key={index}>
//                   <TableCell>{row.meterName}</TableCell>
//                   <TableCell>{row.companyName}</TableCell>
//                   <TableCell>{row.meterType}</TableCell>
//                   <TableCell>{row.costCenter}</TableCell>
//                   <TableCell>{row.meterDescription}</TableCell>
//                   <TableCell>{row.provisionAccountName}</TableCell>
//                   <TableCell>{row.expenseAccountName}</TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default BillEntryList

'use client'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus } from 'lucide-react'
import React from 'react'

interface BillTableProps {
  onAddCategory: () => void
}

const BillTable: React.FC<BillTableProps> = ({ onAddCategory }) => {
  const data = [
    {
      meterNo: '001',
      billDate: '2024-03-01',
      billAmount: '$100',
      payment: 'Paid',
    },
    {
      meterNo: '002',
      billDate: '2024-03-05',
      billAmount: '$150',
      payment: 'Pending',
    },
    {
      meterNo: '003',
      billDate: '2024-03-10',
      billAmount: '$200',
      payment: 'Paid',
    },
    {
      meterNo: '004',
      billDate: '2024-03-15',
      billAmount: '$250',
      payment: 'Pending',
    },
    {
      meterNo: '005',
      billDate: '2024-03-20',
      billAmount: '$300',
      payment: 'Paid',
    },
  ]

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bill List</h1>
        <Button onClick={onAddCategory}>
          <Plus className="h-4 w-4 mr-2" />
          ADD
        </Button>
      </div>
      <Table className="shadow-md border">
        <TableHeader className="bg-slate-200 shadow-md">
          <TableRow>
            <TableHead>Meter No</TableHead>
            <TableHead>Bill Date</TableHead>
            <TableHead>Bill Amount</TableHead>
            <TableHead>Payment</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.meterNo}</TableCell>
              <TableCell>{row.billDate}</TableCell>
              <TableCell>{row.billAmount}</TableCell>
              <TableCell>{row.payment}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default BillTable