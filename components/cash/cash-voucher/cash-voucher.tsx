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
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  getAllChartOfAccounts,
  getAllResPartners,
} from '@/api/cash-vouchers-api'
import { toast } from '@/hooks/use-toast'
import {
  Account,
  CostCenter,
  FormData,
  ResPartner,
  User,
  Voucher,
} from '@/utils/type'
import { getAllCostCenters } from '@/api/cost-centers-api'
import { Checkbox } from '@/components/ui/checkbox'

//i will be shift this type in the types file...not shifting  right now because of not to make conflict.

interface Company {
  company: {
    companyName: string
  }
  companyId: number
}

interface Location {
  id: number
  name: string
  locationId: number
  location: {
    address: string
  }
  companyId: number
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
  isDraft: boolean
}

export default function CashVoucher() {
  const router = useRouter()
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
      isDraft: false,
    },
  ])
  const [voucherList, setVoucherList] = useState<Voucher[]>([])
  const [formData, setFormData] = useState<FormData>({
    date: '',
    company: '',
    location: '',
    currency: '',
  })
  const [cashBalance, setCashBalance] = useState(120000) // Initial cash balance
  const [isLoading, setIsLoading] = useState(true)
  const [chartOfAccounts, setChartOfAccounts] = React.useState<Account[]>([])
  const [costCenters, setCostCenters] = React.useState<CostCenter[]>([])
  const [partners, setPartners] = React.useState<ResPartner[]>([])
  const [formType, setFormType] = React.useState('Payment')
  const [filteredChartOfAccounts, setFilteredChartOfAccounts] = React.useState<
    Account[]
  >([])

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser')
    if (userStr) {
      const userData: User = JSON.parse(userStr)
      setUser(userData)
      setCompanies(userData.userCompanies)
      setLocations(userData.userLocations)
      console.log('Current user from localStorage:', userData)
      if (!userData.voucherTypes.includes('Cash Voucher')) {
        console.log('User does not have access to Cash Voucher')
        router.push('/unauthorized-access')
      }
    } else {
      console.log('No user data found in localStorage')
      router.push('/unauthorized-access')
    }
    setIsLoading(false)
  }, [])

  React.useEffect(() => {
    console.log(formType)
    console.log('fdg', chartOfAccounts)
    const filteredCoa = chartOfAccounts?.filter((account) => {
      if (account.isGroup == true) {
        if (formType == 'Receipt') {
          return account.type == 'Income'
        } else if (formType == 'Payment') {
          return account.type == 'Expenses'
        }
      } else {
        return false
      }
    })
    setFilteredChartOfAccounts(filteredCoa)
    console.log('🚀 ~ React.useEffect ~ filteredCoa:', filteredCoa)
  }, [formType, chartOfAccounts])

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
      isDraft: false,
    }
    setDetailRows([...detailRows, newRow])
  }

  const handleDetailChange = (
    id: number,
    field: keyof DetailRow,
    value: string | boolean
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
        (c: any) => c.companyName === value
      )
      if (selectedCompany) {
        setLocations(
          locations.filter((l) => l.companyId === selectedCompany.companyId)
        )
      }
    }
  }

  useEffect(() => {
    fetchChartOfAccounts()
    fetchgetAllCostCenters()
    fetchgetResPartner()
  }, [])

  //chart of accounts

  async function fetchChartOfAccounts() {
    const response = await getAllChartOfAccounts()
    console.log('Fetched Chart Of accounts:', response.data)

    if (response.error || !response.data) {
      console.error('Error getting ChartOf bank account:', response.error)
      toast({
        title: 'Error',
        description:
          response.error?.message || 'Failed to get ChartOf bank accounts',
      })
    } else {
      setChartOfAccounts(response.data)
      console.log('data', response.data)
    }
  }
  //res partner
  async function fetchgetAllCostCenters() {
    const response = await getAllCostCenters()
    console.log('Fetched cost center data:', response.data)

    if (response.error || !response.data) {
      console.error('Error getting  cost center:', response.error)
      toast({
        title: 'Error',
        description: response.error?.message || 'Failed to get  cost center',
      })
    } else {
      setCostCenters(response.data)
      console.log('data', response.data)
    }
  }

  //res partner
  async function fetchgetResPartner() {
    const response = await getAllResPartners()
    console.log('Fetched Res partner data:', response.data)

    if (response.error || !response.data) {
      console.error('Error getting  Res partner:', response.error)
      toast({
        title: 'Error',
        description: response.error?.message || 'Failed to get  Res partner',
      })
    } else {
      setPartners(response.data)
      console.log('data', response.data)
    }
  }

  const handleSubmit = (rowId: number) => {
    const row = detailRows.find((r) => r.id === rowId)
    if (!row) return

    const totalAmount = Number(row.amount || 0)

    if (totalAmount > cashBalance) {
      alert('Error: Total amount exceeds cash balance.')
      return
    }

    const newVoucher: Voucher = {
      voucherNo: `00${voucherList.length + 1}`,
      companyName: formData.company,
      currency: formData.currency,
      location: formData.location,
      type: row.type,
      accountName: row.accountName,
      costCenter: row.costCenter,
      department: row.department,
      partnerName: row.partnerName,
      remarks: row.remarks,
      totalAmount: totalAmount.toFixed(2),
      status: row.isDraft ? 'Draft' : 'Posted',
    }
    setVoucherList([...voucherList, newVoucher])
    console.log(newVoucher)

    if (!row.isDraft) {
      setCashBalance((prevBalance) => prevBalance - totalAmount)
    }

    // Reset the form and remove the submitted row
    setDetailRows(detailRows.filter((r) => r.id !== rowId))
    if (detailRows.length === 1) {
      addDetailRow() // Add a new empty row if this was the last one
    }
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
        <h1 className="text-xl font-semibold mb-6">Cash Voucher</h1>

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
                {companies.map((company) => (
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
                {locations.map((location) => (
                  <SelectItem
                    key={location.locationId}
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
                      onValueChange={(value) => {
                        handleDetailChange(row.id, 'type', value)
                        setFormType(value)
                      }}
                      required
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Payment">Payment</SelectItem>
                        <SelectItem value="Receipt">Receipt</SelectItem>
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
                        {filteredChartOfAccounts.map((account, index) => (
                          <SelectItem
                            key={account?.id || `default-chart-${index}`}
                            value={
                              account?.name?.toString() || `chart-${index}`
                            }
                          >
                            {account?.name || 'Unnamed Account'}
                          </SelectItem>
                        ))}
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
                        {costCenters.map((center, index) => (
                          <SelectItem
                            key={
                              center?.costCenterId || `default-cost-${index}`
                            }
                            value={
                              center?.costCenterName?.toString() ||
                              `cost-${index}`
                            }
                          >
                            {center?.costCenterName || 'Unnamed Cost Center'}
                          </SelectItem>
                        ))}
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
                        {partners.map((partner, index) => (
                          <SelectItem
                            key={partner?.id || `default-partner-${index}`}
                            value={
                              partner?.name?.toString() || `partner-${index}`
                            }
                          >
                            {partner?.name || 'Unnamed Partner'}
                          </SelectItem>
                        ))}
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
                    <div className="flex justify-end items-center gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`draft-${row.id}`}
                          checked={row.isDraft}
                          onCheckedChange={(checked) =>
                            handleDetailChange(row.id, 'isDraft', checked)
                          }
                        />
                        <label
                          htmlFor={`draft-${row.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Draft
                        </label>
                      </div>
                      <Button onClick={() => handleSubmit(row.id)}>Post</Button>
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
                        <Link
                          href={
                            voucher.type.toLowerCase() === 'Payment'
                              ? '/cash/cash-voucher/payment-preview'
                              : '/cash/cash-voucher/receipt-preview'
                          }
                        >
                          <Printer className="h-4 w-4" />
                        </Link>
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
