import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Label } from '@/components/ui/label'

// Updated dummy data
const voucherData = {
  companyName: 'Your Company Name',
  phoneNumber: '+123 456 7890',
  email: 'info@company.com',
  state: 'State Name',
  address1: '123 Main Street',
  address2: 'Suite 456',
  logo: '/logo.webp',
  date: '2024-12-23',
  voucherNo: 'V-2024-001',
  payableTo: 'Payee Name',
}

const tableData = [
  {
    serialNo: 1,
    particulars: 'Particulars 1',
    paymentMode: 'Cash',
    account: 100,
  },
  {
    serialNo: 2,
    particulars: 'Particulars 2',
    paymentMode: 'Card',
    account: 200,
  },
  {
    serialNo: 3,
    particulars: 'Particulars 3',
    paymentMode: 'Bank Transfer',
    account: 900,
  },
]

// Calculate total amount
const totalAmount = tableData.reduce((sum, row) => sum + row.account, 0)

export default function Voucher() {
  return (
    <Card className="w-full max-w-4xl mx-auto my-8 p-4 border shadow-lg ">
      {/* Header Section */}
      <CardHeader className="grid grid-cols-2 gap-4 border-b pb-4">
        <div className="space-y-2">
          <div className="text-center py-4 bg-yellow-100">
            <h1 className="text-2xl font-bold uppercase">
              {voucherData.companyName}
            </h1>
          </div>
          <p>Phone: {voucherData.phoneNumber}</p>
          <p>Email: {voucherData.email}</p>
          <p>State: {voucherData.state}</p>
          <p>Address 1: {voucherData.address1}</p>
          <p>Address 2: {voucherData.address2}</p>
        </div>
        <div className="flex flex-col items-end">
          <img
            src={voucherData.logo}
            alt="Company Logo"
            className="w-24 h-24 object-contain"
          />
          <div className="mt-4 space-y-2">
            <Label>Date</Label>
            <p>{voucherData.date}</p>
            <Label>Voucher No</Label>
            <p>{voucherData.voucherNo}</p>
            <Label>Payable To</Label>
            <p>{voucherData.payableTo}</p>
          </div>
        </div>
      </CardHeader>

      {/* Title Section */}
      <div className="text-center py-4 bg-yellow-100">
        <h2 className="text-2xl font-bold uppercase">Cash Voucher</h2>
      </div>

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
            {tableData.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.serialNo}</TableCell>
                <TableCell>{row.particulars}</TableCell>
                <TableCell>{row.paymentMode}</TableCell>
                <TableCell>{row.account}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-4 text-right font-bold">
          Total Amount: ${totalAmount.toFixed(2)}
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
// // Convert number to words (for example "1200" -> "One thousand two hundred")
// const numberToWords = (num: number) => {
//   const a = [
//     'Zero',
//     'One',
//     'Two',
//     'Three',
//     'Four',
//     'Five',
//     'Six',
//     'Seven',
//     'Eight',
//     'Nine',
//     'Ten',
//     'Eleven',
//     'Twelve',
//     'Thirteen',
//     'Fourteen',
//     'Fifteen',
//     'Sixteen',
//     'Seventeen',
//     'Eighteen',
//     'Nineteen',
//     'Twenty',
//   ]
//   const b = [
//     '',
//     '',
//     'Twenty',
//     'Thirty',
//     'Forty',
//     'Fifty',
//     'Sixty',
//     'Seventy',
//     'Eighty',
//     'Ninety',
//   ]
//   if (num <= 20) return a[num]
//   else if (num < 100)
//     return b[Math.floor(num / 10)] + (num % 10 ? ' ' + a[num % 10] : '')
//   else return a[Math.floor(num / 100)] + ' Hundred ' + numberToWords(num % 100)
// }

// export default function Voucher() {
//   const paidAmount = 500
//   const balanceAmount = totalAmount - paidAmount

//   return (
//     <Card className="w-full max-w-4xl mx-auto my-8 p-4 border shadow-lg">
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
//               <TableHead className="w-[50px]">S/N</TableHead>
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

//       {/* Total, Paid, and Balance Section */}
//       <CardContent>
//         <div className="grid grid-cols-2 gap-4 mt-4">
//           <div className="text-left">
//             <p>Total Amount (in words):</p>
//             <p>Paid Amount:</p>
//             <p>Balance Amount:</p>
//           </div>
//           <div className="text-right">
//             <p>{numberToWords(totalAmount)} </p>
//             <p>${paidAmount}</p>
//             <p>${balanceAmount}</p>
//           </div>
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
