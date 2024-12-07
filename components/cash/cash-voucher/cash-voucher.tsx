// // New Screen for Cash Voucher

// 'use client'

// import { useState } from 'react'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select'
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table'

// interface DetailRow {
//   id: number
//   type: string
//   accoundName: string
//   costCenter: string
//   department: string
//   partnerName: string
//   remarks: string
//   amount: string
// }

// interface Voucher {
//   voucherNo: string
//   companyName: string
//   location: string
//   currency: string
//   type: string
//   accountName: string
//   costCenter: string
//   department: string
//   partnerName: string
//   remarks:string
//   totalAmount: string
//   status: string
// }

// interface FormData {
//   // date: string
//   company: string
//   location: string
//   currency: string

// }

// export default function CashVoucher() {
//   const [detailRows, setDetailRows] = useState<DetailRow[]>([
//     {
//       id: 1,
//       type: '',
//       accoundName: '',
//       department: '',
//       partnerName: '',
//       costCenter: '',
//       remarks: '',
//       amount: '',
//     },
//   ])
//   const [voucherList, setVoucherList] = useState<Voucher[]>([])
//   const [formData, setFormData] = useState<FormData>({
//     // date: '',
//     company: '',
//     location: '',
//     currency: '',

//   })

//   const addDetailRow = () => {
//     const newRow: DetailRow = {
//       id: detailRows.length + 1,
//       type: '',
//       accoundName: '',
//       costCenter: '',
//       department: '',
//       partnerName: '',
//       remarks: '',
//       amount: '',
//     }
//     setDetailRows([...detailRows, newRow])
//   }

//   const handleDetailChange = (
//     id: number,
//     field: keyof DetailRow,
//     value: string
//   ) => {
//     setDetailRows(
//       detailRows.map((row) =>
//         row.id === id ? { ...row, [field]: value } : row
//       )
//     )
//   }

//   const deleteDetailRow = (id: number) => {
//     setDetailRows(detailRows.filter((row) => row.id !== id))
//   }

//   const handleInputChange = (field: keyof FormData, value: string) => {
//     setFormData({ ...formData, [field]: value })
//   }

//   const handleSubmit = (isDraft: boolean) => {
//     const totalAmount = detailRows.reduce(
//       (sum, row) => sum + Number(row.amount || 0),
//       0
//     )
//     const newVoucher: Voucher = {
//       voucherNo: `00${voucherList.length + 1}`,
//       companyName: formData.company,
//       currency: formData.currency,
//       location: formData.location,
//       type: voucher.type,

//       totalAmount: totalAmount.toFixed(2),
//       status: isDraft ? 'Draft' : 'Posted',
//     }
//     setVoucherList([...voucherList, newVoucher])

//     // Reset form and detail rows
//     setFormData({
//       // date: '',
//       company: '',
//       location: '',
//       currency: '',

//     })
//     setDetailRows([
//       {
//         id: 1,
//         type: '',
//         accoundName: '',
//         costCenter: '',
//         department: '',
//         partnerName: '',
//         remarks: '',
//         amount: '',
//       },
//     ])
//   }

//   return (
//     <div className="w-full max-w-[1200px] mx-auto">
//       <div className="w-full my-10 p-6">
//         <h1 className="text-xl font-semibold mb-6">Screen for Cash Voucher</h1>

//         <div className="grid md:grid-cols-3 gap-6 mb-6">
//           {/* <div className="space-y-2">
//             <Label htmlFor="date">Date:</Label>
//             <Input
//               type="date"
//               id="date"
//               placeholder="mm/dd/yyyy"
//               value={formData.date}
//               onChange={(e) => handleInputChange('date', e.target.value)}
//             />
//           </div> */}

//           <div className="space-y-2">
//             <Label htmlFor="company">Company Name:</Label>
//             <Input
//               type="text"
//               id="company"
//               value={formData.company}
//               onChange={(e) => handleInputChange('company', e.target.value)}
//             />
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="location">Location:</Label>
//             <Input
//               type="text"
//               id="location"
//               value={formData.location}
//               onChange={(e) => handleInputChange('location', e.target.value)}
//             />
//           </div>

//           <div className="space-y-2">
//             <Label>Currency:</Label>
//             <Select
//               value={formData.currency}
//               onValueChange={(value) => handleInputChange('currency', value)}
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="currency" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="BDT">BDT</SelectItem>
//                 <SelectItem value="USD">USD</SelectItem>
//                 <SelectItem value="EUR">EUR</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           {/* <div className="space-y-2">
//             <Label htmlFor="ref">Ref. No:</Label>
//             <Input
//               type="text"
//               id="ref"
//               value={formData.refNo}
//               onChange={(e) => handleInputChange('refNo', e.target.value)}
//             />
//           </div> */}

//           {/* <div className="space-y-2">
//             <Label htmlFor="payee">Payee:</Label>
//             <Input
//               type="text"
//               id="payee"
//               value={formData.payee}
//               onChange={(e) => handleInputChange('payee', e.target.value)}
//             />
//           </div> */}

//           {/* <div className="space-y-2">
//             <Label htmlFor="payee-ph">Payee Ph:</Label>
//             <Input
//               type="tel"
//               id="payee-ph"
//               value={formData.payeePh}
//               onChange={(e) => handleInputChange('payeePh', e.target.value)}
//             />
//           </div> */}
//         </div>

//         {/* Detail Section */}
//         <div className="mb-6">
//           <Table className="border">
//             <TableHeader className="border">
//               <TableRow>
//                 <TableHead>Type</TableHead>
//                 <TableHead>Account Name</TableHead>
//                 <TableHead>Cost Center </TableHead>
//                 <TableHead>Deparment</TableHead>
//                 <TableHead>Partner Name</TableHead>
//                 <TableHead>Remarks</TableHead>
//                 <TableHead>Amount</TableHead>
//                 <TableHead>Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {detailRows.map((row) => (
//                 <TableRow key={row.id}>
//                   <TableCell>
//                     <Input
//                       type="text"
//                       value={row.type}
//                       onChange={(e) =>
//                         handleDetailChange(
//                           row.id,
//                           'type',
//                           e.target.value
//                         )
//                       }
//                     />
//                   </TableCell>
//                   <TableCell>
//                     <Input
//                       type="text"
//                       value={row.accoundName}
//                       onChange={(e) =>
//                         handleDetailChange(
//                           row.id,
//                           'accoundName',
//                           e.target.value
//                         )
//                       }
//                     />
//                   </TableCell>

//                   <TableCell>
//                     <Input
//                       type="text"
//                       value={row.costCenter}
//                       onChange={(e) =>
//                         handleDetailChange(row.id, 'costCenter', e.target.value)
//                       }
//                     />
//                   </TableCell>
//                   <TableCell>
//                     <Input
//                       type="text"
//                       value={row.department}
//                       onChange={(e) =>
//                         handleDetailChange(row.id, 'department', e.target.value)
//                       }
//                     />
//                   </TableCell>
//                   <TableCell>
//                     <Input
//                       type="text"
//                       value={row.partnerName}
//                       onChange={(e) =>
//                         handleDetailChange(
//                           row.id,
//                           'partnerName',
//                           e.target.value
//                         )
//                       }
//                     />
//                   </TableCell>
//                   <TableCell>
//                     <Input
//                       type="text"
//                       value={row.remarks}
//                       onChange={(e) =>
//                         handleDetailChange(row.id, 'remarks', e.target.value)
//                       }
//                     />
//                   </TableCell>
//                   <TableCell>
//                     <Input
//                       type="number"
//                       value={row.amount}
//                       onChange={(e) =>
//                         handleDetailChange(row.id, 'amount', e.target.value)
//                       }
//                     />
//                   </TableCell>
//                   <TableCell>
//                     <Button
//                       variant="ghost"
//                       onClick={() => deleteDetailRow(row.id)}
//                     >
//                       Delete
//                     </Button>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//           <div className="text-right">
//             <Button onClick={addDetailRow} className="mt-4">
//               Add Another
//             </Button>
//           </div>
//         </div>

//         {/* Total and Remarks */}
//         <div className="grid md:grid-cols-2 gap-6 mb-6">
//           <div className="space-y-2">
//             <Label htmlFor="total">Total Amount:</Label>
//             <Input
//               type="number"
//               id="total"
//               readOnly
//               value={detailRows.reduce(
//                 (sum, row) => sum + Number(row.amount || 0),
//                 0
//               )}
//             />
//           </div>

//         </div>

//         {/* List Section */}
//         <div className="mb-6">
//           <Table className="border">
//             <TableHeader className="border">
//               <TableRow>
//                 <TableHead>Voucher No</TableHead>
//                 <TableHead>Company Name</TableHead>
//                 <TableHead>Currency</TableHead>
//                 <TableHead>Location</TableHead>
//                 <TableHead>Type</TableHead>
//                 <TableHead>Account Name</TableHead>
//                 <TableHead>Cost Center</TableHead>
//                 <TableHead>Departmen</TableHead>
//                 <TableHead>Partner Name</TableHead>
//                 <TableHead>Remarks</TableHead>
//                 <TableHead>Total Amount</TableHead>
//                 <TableHead>Draft/Post</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {voucherList.map((voucher, index) => (
//                 <TableRow key={index}>
//                   <TableCell>{voucher.voucherNo}</TableCell>
//                   <TableCell>{voucher.companyName}</TableCell>
//                   <TableCell>{voucher.currency}</TableCell>
//                   <TableCell>{voucher.location}</TableCell>
//                   <TableCell>{voucher.type}</TableCell>
//                   <TableCell>{voucher.accountName}</TableCell>
//                   <TableCell>{voucher.costCenter}</TableCell>
//                   <TableCell>{voucher.department}</TableCell>
//                   <TableCell>{voucher.partnerName}</TableCell>
//                   <TableCell>{voucher.remarks}</TableCell>

//                   <TableCell>{voucher.totalAmount}</TableCell>
//                   <TableCell>{voucher.status}</TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </div>

//         {/* Cash Balance */}
//         <div className="flex justify-between items-center mb-6">
//           <div className="font-medium">Cash Balance:</div>
//           <div className="font-medium">TK. 125000</div>
//         </div>

//         {/* Action Buttons */}
//         <div className="flex justify-end gap-2">
//           <Button variant="outline" onClick={() => handleSubmit(true)}>
//             Save as Draft
//           </Button>
//           <Button onClick={() => handleSubmit(false)}>Post</Button>
//         </div>
//       </div>
//     </div>
//   )
// }

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface DetailRow {
  id: number
  type: string
  accountName: string
  costCenter: string
  department: string
  partnerName: string
  remarks: string
  amount: string
}

interface Voucher {
  voucherNo: string
  companyName: string
  location: string
  currency: string
  type: string
  accountName: string
  costCenter: string
  department: string
  partnerName: string
  remarks: string
  totalAmount: string
  status: string
}

interface FormData {
  date: string
  company: string
  location: string
  currency: string
}

export default function CashVoucher() {
  const [detailRows, setDetailRows] = useState<DetailRow[]>([
    {
      id: 1,
      type: '',
      accountName: '',
      department: '',
      partnerName: '',
      costCenter: '',
      remarks: '',
      amount: '',
    },
  ])
  const [voucherList, setVoucherList] = useState<Voucher[]>([])
  const [formData, setFormData] = useState<FormData>({
    date: '',
    company: '',
    location: '',
    currency: '',
  })
  const [cashBalance, setCashBalance] = useState(125000) // Initial cash balance

  const addDetailRow = () => {
    const newRow: DetailRow = {
      id: detailRows.length + 1,
      type: '',
      accountName: '',
      costCenter: '',
      department: '',
      partnerName: '',
      remarks: '',
      amount: '',
    }
    setDetailRows([...detailRows, newRow])
  }

  const handleDetailChange = (
    id: number,
    field: keyof DetailRow,
    value: string
  ) => {
    setDetailRows(
      detailRows.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      )
    )
  }

  const deleteDetailRow = (id: number) => {
    setDetailRows(detailRows.filter((row) => row.id !== id))
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleSubmit = (isDraft: boolean) => {
    const totalAmount = detailRows.reduce(
      (sum, row) => sum + Number(row.amount || 0),
      0
    )

    if (totalAmount > cashBalance) {
      alert('Error: Total amount exceeds cash balance.')
      return
    }

    const newVoucher: Voucher = {
      voucherNo: `00${voucherList.length + 1}`,
      companyName: formData.company,
      currency: formData.currency,
      location: formData.location,
      type: detailRows[0]?.type || '', // Use the type from the first detail row
      accountName: detailRows[0]?.accountName || '',
      costCenter: detailRows[0]?.costCenter || '',
      department: detailRows[0]?.department || '',
      partnerName: detailRows[0]?.partnerName || '',
      remarks: detailRows[0]?.remarks || '',
      totalAmount: totalAmount.toFixed(2),
      status: isDraft ? 'Draft' : 'Posted',
    }
    setVoucherList([...voucherList, newVoucher])

    // Update cash balance if not a draft
    if (!isDraft) {
      setCashBalance((prevBalance) => prevBalance - totalAmount)
    }

    // Reset form and detail rows
    setFormData({
      date: '',
      company: '',
      location: '',
      currency: '',
    })
    setDetailRows([
      {
        id: 1,
        type: '',
        accountName: '',
        costCenter: '',
        department: '',
        partnerName: '',
        remarks: '',
        amount: '',
      },
    ])
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto">
      <div className="w-full my-10 p-6">
        <h1 className="text-xl font-semibold mb-6">Screen for Cash Voucher</h1>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="space-y-2">
            <Label htmlFor="company">Company Name:</Label>
            <Input
              type="text"
              id="company"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location:</Label>
            <Input
              type="text"
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Currency:</Label>
            <Select
              value={formData.currency}
              onValueChange={(value) => handleInputChange('currency', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BDT">BDT</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Detail Section */}
        <div className="mb-6">
          <Table className="border">
            <TableHeader className="border">
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Account Name</TableHead>
                <TableHead>Cost Center</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Partner Name</TableHead>
                <TableHead>Remarks</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detailRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Input
                      type="text"
                      value={row.type}
                      onChange={(e) =>
                        handleDetailChange(row.id, 'type', e.target.value)
                      }
                      required
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      value={row.accountName}
                      onChange={(e) =>
                        handleDetailChange(
                          row.id,
                          'accountName',
                          e.target.value
                        )
                      }
                      required
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      value={row.costCenter}
                      onChange={(e) =>
                        handleDetailChange(row.id, 'costCenter', e.target.value)
                      }
                      required
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      value={row.department}
                      onChange={(e) =>
                        handleDetailChange(row.id, 'department', e.target.value)
                      }
                      required
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      value={row.partnerName}
                      onChange={(e) =>
                        handleDetailChange(
                          row.id,
                          'partnerName',
                          e.target.value
                        )
                      }
                      required
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      value={row.remarks}
                      onChange={(e) =>
                        handleDetailChange(row.id, 'remarks', e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={row.amount}
                      onChange={(e) =>
                        handleDetailChange(row.id, 'amount', e.target.value)
                      }
                      required
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      onClick={() => deleteDetailRow(row.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="text-right">
            <Button onClick={addDetailRow} className="mt-4">
              Add Another
            </Button>
          </div>
        </div>

        {/* Total and Remarks */}
        <div className="grid md:grid-cols-1 gap-6 mb-6">
          <div className="space-y-2">
            <Label htmlFor="date">Date:</Label>
            <Input
              type="date"
              id="date"
              placeholder="mm/dd/yyyy"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="total">Total Amount:</Label>
            <Input
              type="number"
              id="total"
              readOnly
              value={detailRows.reduce(
                (sum, row) => sum + Number(row.amount || 0),
                0
              )}
            />
          </div>
        </div>

        {/* List Section */}
        <div className="mb-6">
          <Table className="border">
            <TableHeader className="border">
              <TableRow>
                <TableHead>Voucher No</TableHead>
                <TableHead>Company Name</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Account Name</TableHead>
                <TableHead>Cost Center</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Partner Name</TableHead>
                <TableHead>Remarks</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Draft/Post</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {voucherList.map((voucher, index) => (
                <TableRow key={index}>
                  <TableCell>{voucher.voucherNo}</TableCell>
                  <TableCell>{voucher.companyName}</TableCell>
                  <TableCell>{voucher.currency}</TableCell>
                  <TableCell>{voucher.location}</TableCell>
                  <TableCell>{voucher.type}</TableCell>
                  <TableCell>{voucher.accountName}</TableCell>
                  <TableCell>{voucher.costCenter}</TableCell>
                  <TableCell>{voucher.department}</TableCell>
                  <TableCell>{voucher.partnerName}</TableCell>
                  <TableCell>{voucher.remarks}</TableCell>
                  <TableCell>{voucher.totalAmount}</TableCell>
                  <TableCell>{voucher.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Cash Balance */}
        <div className="flex justify-between items-center mb-6">
          <div className="font-medium">Cash Balance:</div>
          <div className="font-medium">TK. {cashBalance.toFixed(2)}</div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => handleSubmit(true)}>
            Save as Draft
          </Button>
          <Button onClick={() => handleSubmit(false)}>Post</Button>
        </div>
      </div>
    </div>
  )
}
