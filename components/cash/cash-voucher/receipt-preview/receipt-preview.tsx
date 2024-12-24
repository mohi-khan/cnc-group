'use client'
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import { getAllVoucherById } from '@/api/vouchers-api'
import { useParams } from 'next/navigation'
import { toast } from '@/hooks/use-toast'
import { useEffect, useState } from 'react'
import { JournalEntryWithDetails } from '@/utils/type'

export default function Voucher() {
  const { voucherid } = useParams() // Extract voucherId from the URL
  console.log(voucherid)
  const [voucherData, setVoucherData] = useState<JournalEntryWithDetails>()
  const [tableData, setTableData] = useState([])
  // const [totalAmount, setTotalAmount] = useState(0)

  async function getVoucherDetailsById() {
    if (!voucherid) {
      throw new Error('Voucher ID is missing')
    }

    const response = await getAllVoucherById(voucherid as string)

    if (response.error || !response.data) {
      console.error('Error getting voucher details:', response.error)
      toast({
        title: 'Error',
        description: response.error?.message || 'Failed to get voucher details',
      })
      return
    }
    const data = response.data.data
    setVoucherData(data)
    console.log(data)

    setTableData(data)

    // Calculate total amount
    // const total = items.reduce((sum: number, row:) => sum + row.account, 0)
    // setTotalAmount(total)
  }

  useEffect(() => {
    getVoucherDetailsById()
  }, [voucherid])

  if (!voucherData) {
    return <p>Loading...</p>
  }

  return (
    <Card className="w-full max-w-4xl mx-auto my-8 p-4 border shadow-lg">
      {/* Header Section */}
      <CardHeader className="grid grid-cols-2 gap-4 border-b pb-4">
        <div className="space-y-2">
          <div className="text-center py-4 bg-yellow-100">
            <h1 className="text-xl font-bold uppercase">
              {voucherData[0].companyname}
            </h1>
          </div>
          <p>Phone: {voucherData.phoneNumber}</p>
          <p>Email: {voucherData.email}</p>
          <p>State: {voucherData.state}</p>
          <p>Address 1: {voucherData[0].location}</p>
          <p>Address 2: {voucherData.address2}</p>
        </div>
        <div className="flex flex-col items-end">
          <img
            src="/logo.webp"
            alt="Company Logo"
            className="w-24 h-24 object-contain"
          />
          <div className="mt-4 space-y-2">
            <Label>Date</Label>
            <p>{voucherData[0].date}</p>
            <Label>Voucher No</Label>
            <p>{voucherData[0].voucherno}</p>
            <Label>Payable To</Label>
            <p>{voucherData.payableTo}</p>
          </div>
        </div>
      </CardHeader>

      {/* Table Section */}
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Serial no:</TableHead>
              <TableHead>Particulars</TableHead>
              <TableHead>Payment Mode</TableHead>
              <TableHead>Account</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* {tableData.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.serialNo}</TableCell>
                <TableCell>{row.particulars}</TableCell>
                <TableCell>{row.paymentMode}</TableCell>
                <TableCell>{row.account}</TableCell>
              </TableRow>
            ))} */}
          </TableBody>
        </Table>
        <div className="mt-4 text-right font-bold">
          {/* Total Amount: ${totalAmount.toFixed(2)} */}
        </div>
      </CardContent>

      {/* Footer Section */}
      <CardFooter className="text-center mt-4 space-y-2">
        <p className="text-sm text-muted-foreground">
          Generated on {voucherData.date}
        </p>
      </CardFooter>
    </Card>
  )
}

// 'use client'
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardFooter,
// } from '@/components/ui/card'
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table'
// import { Label } from '@/components/ui/label'

// // Updated dummy data
// const voucherData = {
//   companyName: 'Your Company Name',
//   phoneNumber: '+123 456 7890',
//   email: 'info@company.com',
//   state: 'State Name',
//   address1: '123 Main Street',
//   address2: 'Suite 456',
//   logo: '/logo.webp',
//   date: '2024-12-23',
//   voucherNo: 'V-2024-001',
//   payableTo: 'Payee Name',
// }

// const tableData = [
//   {
//     serialNo: 1,
//     particulars: 'Particulars 1',
//     paymentMode: 'Cash',
//     account: 100,
//   },
//   {
//     serialNo: 2,
//     particulars: 'Particulars 2',
//     paymentMode: 'Card',
//     account: 200,
//   },
//   {
//     serialNo: 3,
//     particulars: 'Particulars 3',
//     paymentMode: 'Bank Transfer',
//     account: 900,
//   },
// ]

// // Calculate total amount
// const totalAmount = tableData.reduce((sum, row) => sum + row.account, 0)

// export default function Voucher() {
//   return (
//     <Card className="w-full max-w-4xl mx-auto my-8 p-4 border shadow-lg ">
//       {/* Header Section */}
//       <CardHeader className="grid grid-cols-2 gap-4 border-b pb-4">
//         <div className="space-y-2">
//           <div className="text-center py-4 bg-yellow-100">
//             <h1 className="text-2xl font-bold uppercase">
//               {voucherData.companyName}
//             </h1>
//           </div>
//           <p>Phone: {voucherData.phoneNumber}</p>
//           <p>Email: {voucherData.email}</p>
//           <p>State: {voucherData.state}</p>
//           <p>Address 1: {voucherData.address1}</p>
//           <p>Address 2: {voucherData.address2}</p>
//         </div>
//         <div className="flex flex-col items-end">
//           <img
//             src={voucherData.logo}
//             alt="Company Logo"
//             className="w-24 h-24 object-contain"
//           />
//           <div className="mt-4 space-y-2">
//             <Label>Date</Label>
//             <p>{voucherData.date}</p>
//             <Label>Voucher No</Label>
//             <p>{voucherData.voucherNo}</p>
//             <Label>Payable To</Label>
//             <p>{voucherData.payableTo}</p>
//           </div>
//         </div>
//       </CardHeader>

//       {/* Title Section */}
//       <div className="text-center py-4 bg-yellow-100">
//         <h2 className="text-2xl font-bold uppercase">Cash Voucher</h2>
//       </div>

//       {/* Table Section */}
//       <CardContent>
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead className="w-[50px]">Serial no:</TableHead>
//               <TableHead>Particulars</TableHead>
//               <TableHead>Payment Mode</TableHead>
//               <TableHead>Account</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {tableData.map((row, index) => (
//               <TableRow key={index}>
//                 <TableCell>{row.serialNo}</TableCell>
//                 <TableCell>{row.particulars}</TableCell>
//                 <TableCell>{row.paymentMode}</TableCell>
//                 <TableCell>{row.account}</TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//         <div className="mt-4 text-right font-bold">
//           Total Amount: ${totalAmount.toFixed(2)}
//         </div>
//       </CardContent>

//       {/* Footer Section */}
//       <CardFooter className="text-center mt-4 space-y-2">
//         <p className="text-sm text-muted-foreground">
//           Generated on {voucherData.date}
//         </p>
//       </CardFooter>
//     </Card>
//   )
// }
