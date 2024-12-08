// 'use client'

// import React, { useEffect, useState } from 'react'
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
// import { Textarea } from '@/components/ui/textarea'
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from '@/components/ui/alert-dialog'
// import { Check, Printer, RotateCcw, Trash } from 'lucide-react'

// interface Company {
//   companyId: number
//   companyName: string
// }

// interface Location {
//   id: number
//   name: string
//   companyId: number
// }

// interface User {
//   userId: number
//   username: string
//   roleId: number
//   roleName: string
//   userCompanies: Company[]
//   userLocations: Location[]
//   voucherTypes: string[]
// }

// interface DetailRow {
//   id: number
//   type: string
//   accountName: string
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
//   remarks: string
//   totalAmount: string
//   status: string
// }

// interface FormData {
//   date: string
//   company: string
//   location: string
//   currency: string
// }

// export default function CashVoucher() {
//   const [user, setUser] = useState<User | null>(null)
//   const [companies, setCompanies] = useState<Company[]>([])
//   const [locations, setLocations] = useState<Location[]>([])
//   const [detailRows, setDetailRows] = useState<DetailRow[]>([
//     {
//       id: 1,
//       type: '',
//       accountName: '',
//       department: '',
//       partnerName: '',
//       costCenter: '',
//       remarks: '',
//       amount: '',
//     },
//   ])
//   const [voucherList, setVoucherList] = useState<Voucher[]>([])
//   const [formData, setFormData] = useState<FormData>({
//     date: '',
//     company: '',
//     location: '',
//     currency: '',
//   })
//   const [cashBalance, setCashBalance] = useState(125000) // Initial cash balance

//   useEffect(() => {
//     const userStr = localStorage.getItem('currentUser')
//     if (userStr) {
//       const userData: User = JSON.parse(userStr)
//       setUser(userData)
//       setCompanies(userData.userCompanies)
//       setLocations(userData.userLocations)
//       console.log('Current user from localStorage:', userData)
//     } else {
//       console.log('No user data found in localStorage')
//     }
//   }, [])

//   const addDetailRow = () => {
//     const newRow: DetailRow = {
//       id: detailRows.length + 1,
//       type: '',
//       accountName: '',
//       department: '',
//       partnerName: '',
//       costCenter: '',
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
//     setFormData((prev) => ({ ...prev, [field]: value }))
//     if (field === 'company') {
//       // Reset location when company changes
//       setFormData((prev) => ({ ...prev, location: '' }))
//       // Find the selected company and update locations
//       const selectedCompany = companies.find((c) => c.companyName === value)
//       if (selectedCompany) {
//         setLocations(
//           locations.filter((l) => l.companyId === selectedCompany.companyId)
//         )
//       }
//     }
//   }

//   const handleSubmit = (isDraft: boolean) => {
//     const totalAmount = detailRows.reduce(
//       (sum, row) => sum + Number(row.amount || 0),
//       0
//     )

//     if (totalAmount > cashBalance) {
//       alert('Error: Total amount exceeds cash balance.')
//       return
//     }

//     const newVoucher: Voucher = {
//       voucherNo: `00${voucherList.length + 1}`,
//       companyName: formData.company,
//       currency: formData.currency,
//       location: formData.location,
//       type: detailRows[0]?.type || '',
//       accountName: detailRows[0]?.accountName || '',
//       costCenter: detailRows[0]?.costCenter || '',
//       department: detailRows[0]?.department || '',
//       partnerName: detailRows[0]?.partnerName || '',
//       remarks: detailRows[0]?.remarks || '',
//       totalAmount: totalAmount.toFixed(2),
//       status: isDraft ? 'Draft' : 'Posted',
//     }
//     setVoucherList([...voucherList, newVoucher])

//     if (!isDraft) {
//       setCashBalance((prevBalance) => prevBalance - totalAmount)
//     }

//     setFormData({
//       date: '',
//       company: '',
//       location: '',
//       currency: '',
//     })
//     setDetailRows([
//       {
//         id: 1,
//         type: '',
//         accountName: '',
//         costCenter: '',
//         department: '',
//         partnerName: '',
//         remarks: '',
//         amount: '',
//       },
//     ])
//   }

//   const handleDelete = (voucherNo: string) => {
//     setVoucherList(voucherList.filter((v) => v.voucherNo !== voucherNo))
//   }

//   const handleReverse = (voucherNo: string) => {
//     setVoucherList(
//       voucherList.map((v) =>
//         v.voucherNo === voucherNo ? { ...v, status: 'Draft' } : v
//       )
//     )
//   }

//   const handlePost = (voucherNo: string) => {
//     setVoucherList(
//       voucherList.map((v) =>
//         v.voucherNo === voucherNo ? { ...v, status: 'Posted' } : v
//       )
//     )
//   }

//   return (
//     <div className="w-full max-w-[1200px] mx-auto">
//       <div className="w-full my-10 p-6">
//         <h1 className="text-xl font-semibold mb-6">Cash Voucher</h1>

//         {/* Form inputs */}
//         <div className="grid md:grid-cols-4 gap-6 mb-6">
//           <div className="space-y-2">
//             <Label>Company:</Label>
//             <Select
//               value={formData.company}
//               onValueChange={(value) => handleInputChange('company', value)}
//               required
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Select company" />
//               </SelectTrigger>
//               <SelectContent>
//                 {companies.map((company) => (
//                   <SelectItem
//                     key={company.companyId}
//                     value={company.company.companyName}
//                   >
//                     {company.company.companyName}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           <div className="space-y-2">
//             <Label>Location:</Label>
//             <Select
//               value={formData.location}
//               onValueChange={(value) => handleInputChange('location', value)}
//               required
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Select location" />
//               </SelectTrigger>
//               <SelectContent>
//                 {locations.map((location) => (
//                   <SelectItem
//                     key={location.id}
//                     value={location.location.address}
//                   >
//                     {location.location.address}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//           <div className="space-y-2">
//             <Label>Currency:</Label>
//             <Select
//               value={formData.currency}
//               onValueChange={(value) => handleInputChange('currency', value)}
//               required
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Select currency" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="BDT">BDT</SelectItem>
//                 <SelectItem value="USD">USD</SelectItem>
//                 <SelectItem value="EUR">EUR</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="date">Date:</Label>
//             <Input
//               type="date"
//               id="date"
//               placeholder="mm/dd/yyyy"
//               value={formData.date}
//               onChange={(e) => handleInputChange('date', e.target.value)}
//             />
//           </div>
//         </div>

//         <div className="mb-6">
//           <Table className="border">
//             <TableHeader className="border">
//               <TableRow>
//                 <TableHead>Type</TableHead>
//                 <TableHead>Account Name</TableHead>
//                 <TableHead>Cost Center</TableHead>
//                 <TableHead>Department</TableHead>
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
//                     <Select
//                       value={row.type}
//                       onValueChange={(value) =>
//                         handleDetailChange(row.id, 'type', value)
//                       }
//                       required
//                     >
//                       <SelectTrigger className="w-full">
//                         <SelectValue placeholder="Select type" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="payment">Payment</SelectItem>
//                         <SelectItem value="receipt">Receipt</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </TableCell>
//                   <TableCell>
//                     <Select
//                       value={row.accountName}
//                       onValueChange={(value) =>
//                         handleDetailChange(row.id, 'accountName', value)
//                       }
//                       required
//                     >
//                       <SelectTrigger className="w-full">
//                         <SelectValue placeholder="Select account" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="cash">Cash</SelectItem>
//                         <SelectItem value="bank">Bank</SelectItem>
//                         <SelectItem value="accounts_receivable">
//                           Accounts Receivable
//                         </SelectItem>
//                         <SelectItem value="accounts_payable">
//                           Accounts Payable
//                         </SelectItem>
//                         <SelectItem value="sales">Sales</SelectItem>
//                         <SelectItem value="purchases">Purchases</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </TableCell>

//                   <TableCell>
//                     <Select
//                       value={row.costCenter}
//                       onValueChange={(value) =>
//                         handleDetailChange(row.id, 'costCenter', value)
//                       }
//                       required
//                     >
//                       <SelectTrigger className="w-full">
//                         <SelectValue placeholder="Select cost center" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="marketing">Marketing</SelectItem>
//                         <SelectItem value="sales">Sales</SelectItem>
//                         <SelectItem value="it">IT</SelectItem>
//                         <SelectItem value="hr">Human Resources</SelectItem>
//                         <SelectItem value="finance">Finance</SelectItem>
//                         <SelectItem value="operations">Operations</SelectItem>
//                         <SelectItem value="rd">
//                           Research & Development
//                         </SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </TableCell>

//                   <TableCell>
//                     <Select
//                       value={row.department}
//                       onValueChange={(value) =>
//                         handleDetailChange(row.id, 'department', value)
//                       }
//                       required
//                     >
//                       <SelectTrigger className="w-full">
//                         <SelectValue placeholder="Select department" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="sales">Sales</SelectItem>
//                         <SelectItem value="marketing">Marketing</SelectItem>
//                         <SelectItem value="engineering">Engineering</SelectItem>
//                         <SelectItem value="finance">Finance</SelectItem>
//                         <SelectItem value="hr">Human Resources</SelectItem>
//                         <SelectItem value="operations">Operations</SelectItem>
//                         <SelectItem value="customer_service">
//                           Customer Service
//                         </SelectItem>
//                         <SelectItem value="rd">
//                           Research & Development
//                         </SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </TableCell>

//                   <TableCell>
//                     <Select
//                       value={row.partnerName}
//                       onValueChange={(value) =>
//                         handleDetailChange(row.id, 'partnerName', value)
//                       }
//                       required
//                     >
//                       <SelectTrigger className="w-full">
//                         <SelectValue placeholder="Select partner" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="acme_corp">
//                           Acme Corporation
//                         </SelectItem>
//                         <SelectItem value="globex">
//                           Globex Corporation
//                         </SelectItem>
//                         <SelectItem value="initech">Initech</SelectItem>
//                         <SelectItem value="umbrella_corp">
//                           Umbrella Corporation
//                         </SelectItem>
//                         <SelectItem value="stark_industries">
//                           Stark Industries
//                         </SelectItem>
//                         <SelectItem value="wayne_enterprises">
//                           Wayne Enterprises
//                         </SelectItem>
//                         <SelectItem value="oscorp">
//                           Oscorp Industries
//                         </SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </TableCell>

//                   <TableCell>
//                     <Textarea
//                       value={row.remarks}
//                       onChange={(e) =>
//                         handleDetailChange(row.id, 'remarks', e.target.value)
//                       }
//                       placeholder="Enter remarks"
//                       className="w-full min-h-[60px]"
//                     />
//                   </TableCell>

//                   <TableCell>
//                     <Input
//                       type="number"
//                       value={row.amount}
//                       onChange={(e) =>
//                         handleDetailChange(row.id, 'amount', e.target.value)
//                       }
//                       required
//                     />
//                   </TableCell>
//                   <TableCell>
//                     {/* Action Buttons */}
//                     <div className="flex justify-end gap-2">
//                       <Button
//                         variant="outline"
//                         onClick={() => handleSubmit(true)}
//                       >
//                         Save as Draft
//                       </Button>
//                       <Button onClick={() => handleSubmit(false)}>Post</Button>
//                     </div>
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
//                 <TableHead>Department</TableHead>
//                 <TableHead>Partner Name</TableHead>
//                 <TableHead>Remarks</TableHead>
//                 <TableHead>Total Amount</TableHead>
//                 <TableHead>Status</TableHead>
//                 <TableHead>Action</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {voucherList.map((voucher) => (
//                 <TableRow key={voucher.voucherNo}>
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
//                   <TableCell>
//                     <div className="flex space-x-2">
//                       <AlertDialog>
//                         <AlertDialogTrigger asChild>
//                           <Button variant="outline" size="icon">
//                             <Trash className="h-4 w-4" />
//                           </Button>
//                         </AlertDialogTrigger>
//                         <AlertDialogContent className="bg-white">
//                           <AlertDialogHeader>
//                             <AlertDialogTitle>Are you sure?</AlertDialogTitle>
//                             <AlertDialogDescription>
//                               This action cannot be undone. This will
//                               permanently delete the voucher.
//                             </AlertDialogDescription>
//                           </AlertDialogHeader>
//                           <AlertDialogFooter>
//                             <AlertDialogCancel>Cancel</AlertDialogCancel>
//                             <AlertDialogAction
//                               onClick={() => handleDelete(voucher.voucherNo)}
//                             >
//                               Delete
//                             </AlertDialogAction>
//                           </AlertDialogFooter>
//                         </AlertDialogContent>
//                       </AlertDialog>
//                       <AlertDialog>
//                         <AlertDialogTrigger asChild>
//                           <Button variant="outline" size="icon">
//                             <RotateCcw className="h-4 w-4" />
//                           </Button>
//                         </AlertDialogTrigger>
//                         <AlertDialogContent className="bg-white">
//                           <AlertDialogHeader>
//                             <AlertDialogTitle>Are you sure?</AlertDialogTitle>
//                             <AlertDialogDescription>
//                               This will reverse the voucher status to Draft.
//                             </AlertDialogDescription>
//                           </AlertDialogHeader>
//                           <AlertDialogFooter>
//                             <AlertDialogCancel>Cancel</AlertDialogCancel>
//                             <AlertDialogAction
//                               onClick={() => handleReverse(voucher.voucherNo)}
//                             >
//                               Reverse
//                             </AlertDialogAction>
//                           </AlertDialogFooter>
//                         </AlertDialogContent>
//                       </AlertDialog>
//                       <Button
//                         variant="outline"
//                         size="icon"
//                         onClick={() => handlePost(voucher.voucherNo)}
//                       >
//                         <Check className="h-4 w-4" />
//                       </Button>
//                       <Button variant="outline" size="icon">
//                         <Printer className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </div>
//       </div>
//     </div>
//   )
// }

'use client'

import React, { useEffect, useState } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Check, Printer, RotateCcw, Trash } from 'lucide-react'

interface Company {
  company: string
  companyId: number
}

interface Location {
  id: number
  name: string
  companyId: number
}

interface User {
  userId: number
  username: string
  roleId: number
  roleName: string
  userCompanies: Company[]
  userLocations: Location[]
  voucherTypes: string[]
}

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
  const [user, setUser] = useState<User | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [locations, setLocations] = useState<Location[]>([])
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
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser')
    if (userStr) {
      const userData: User = JSON.parse(userStr)
      setUser(userData)
      setCompanies(userData.userCompanies)
      setLocations(userData.userLocations)
      console.log('Current user from localStorage:', userData)
    } else {
      console.log('No user data found in localStorage')
    }
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return <div>Loading...</div>
  }

  const addDetailRow = () => {
    const newRow: DetailRow = {
      id: detailRows.length + 1,
      type: '',
      accountName: '',
      department: '',
      partnerName: '',
      costCenter: '',
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
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (field === 'company') {
      // Reset location when company changes
      setFormData((prev) => ({ ...prev, location: '' }))
      // Find the selected company and update locations
      const selectedCompany = companies.find(
        (c) => c.company.companyName === value
      )
      if (selectedCompany) {
        setLocations(
          locations.filter((l) => l.companyId === selectedCompany.companyId)
        )
      }
    }
  }

  //  async function fetchGlAccounts() {
  //    console.log('Fetching gl accounts')
  //    try {
  //      const fetchedGlAccounts = await getAllGlAccounts()
  //      console.log('Fetched gl accounts:', fetchedGlAccounts)
  //      setGlAccounts(fetchedGlAccounts)
  //    } catch (error) {
  //      console.error('Error fetching gl accounts:', error)
  //      toast({
  //        title: 'Error',
  //        description: 'Failed to fetch gl accounts',
  //        variant: 'destructive',
  //      })
  //    }
  //  }

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
      type: detailRows[0]?.type || '',
      accountName: detailRows[0]?.accountName || '',
      costCenter: detailRows[0]?.costCenter || '',
      department: detailRows[0]?.department || '',
      partnerName: detailRows[0]?.partnerName || '',
      remarks: detailRows[0]?.remarks || '',
      totalAmount: totalAmount.toFixed(2),
      status: isDraft ? 'Draft' : 'Posted',
    }
    setVoucherList([...voucherList, newVoucher])

    if (!isDraft) {
      setCashBalance((prevBalance) => prevBalance - totalAmount)
    }

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

  const handleDelete = (voucherNo: string) => {
    setVoucherList(voucherList.filter((v) => v.voucherNo !== voucherNo))
  }

  const handleReverse = (voucherNo: string) => {
    setVoucherList(
      voucherList.map((v) =>
        v.voucherNo === voucherNo ? { ...v, status: 'Draft' } : v
      )
    )
  }

  const handlePost = (voucherNo: string) => {
    setVoucherList(
      voucherList.map((v) =>
        v.voucherNo === voucherNo ? { ...v, status: 'Posted' } : v
      )
    )
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto">
      <div className="w-full my-10 p-6">
        <h1 className="text-xl font-semibold mb-6">Screen for Cash Voucher</h1>

        {/* Form inputs */}
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <div className="space-y-2">
            <Label>Company:</Label>
            <Select
              value={formData.company}
              onValueChange={(value) => handleInputChange('company', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company: any) => (
                  <SelectItem
                    key={company.companyId}
                    value={company.company.companyName}
                  >
                    {company.company.companyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Location:</Label>
            <Select
              value={formData.location}
              onValueChange={(value) => handleInputChange('location', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location: any) => (
                  <SelectItem
                    key={location.id}
                    value={location.location.address}
                  >
                    {location.location.address}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
        </div>

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
                    <Select
                      value={row.type}
                      onValueChange={(value) =>
                        handleDetailChange(row.id, 'type', value)
                      }
                      required
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="payment">Payment</SelectItem>
                        <SelectItem value="receipt">Receipt</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={row.accountName}
                      onValueChange={(value) =>
                        handleDetailChange(row.id, 'accountName', value)
                      }
                      required
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="bank">Bank</SelectItem>
                        <SelectItem value="accounts_receivable">
                          Accounts Receivable
                        </SelectItem>
                        <SelectItem value="accounts_payable">
                          Accounts Payable
                        </SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="purchases">Purchases</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>

                  <TableCell>
                    <Select
                      value={row.costCenter}
                      onValueChange={(value) =>
                        handleDetailChange(row.id, 'costCenter', value)
                      }
                      required
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select cost center" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="it">IT</SelectItem>
                        <SelectItem value="hr">Human Resources</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="operations">Operations</SelectItem>
                        <SelectItem value="rd">
                          Research & Development
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>

                  <TableCell>
                    <Select
                      value={row.department}
                      onValueChange={(value) =>
                        handleDetailChange(row.id, 'department', value)
                      }
                      required
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="hr">Human Resources</SelectItem>
                        <SelectItem value="operations">Operations</SelectItem>
                        <SelectItem value="customer_service">
                          Customer Service
                        </SelectItem>
                        <SelectItem value="rd">
                          Research & Development
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>

                  <TableCell>
                    <Select
                      value={row.partnerName}
                      onValueChange={(value) =>
                        handleDetailChange(row.id, 'partnerName', value)
                      }
                      required
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select partner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="acme_corp">
                          Acme Corporation
                        </SelectItem>
                        <SelectItem value="globex">
                          Globex Corporation
                        </SelectItem>
                        <SelectItem value="initech">Initech</SelectItem>
                        <SelectItem value="umbrella_corp">
                          Umbrella Corporation
                        </SelectItem>
                        <SelectItem value="stark_industries">
                          Stark Industries
                        </SelectItem>
                        <SelectItem value="wayne_enterprises">
                          Wayne Enterprises
                        </SelectItem>
                        <SelectItem value="oscorp">
                          Oscorp Industries
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>

                  <TableCell>
                    <Textarea
                      value={row.remarks}
                      onChange={(e) =>
                        handleDetailChange(row.id, 'remarks', e.target.value)
                      }
                      placeholder="Enter remarks"
                      className="w-full min-h-[60px]"
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
                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleSubmit(true)}
                      >
                        Save as Draft
                      </Button>
                      <Button onClick={() => handleSubmit(false)}>Post</Button>
                    </div>
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
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {voucherList.map((voucher) => (
                <TableRow key={voucher.voucherNo}>
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
                  <TableCell>
                    <div className="flex space-x-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="icon">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete the voucher.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(voucher.voucherNo)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="icon">
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will reverse the voucher status to Draft.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleReverse(voucher.voucherNo)}
                            >
                              Reverse
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePost(voucher.voucherNo)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon">
                        <Printer className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
