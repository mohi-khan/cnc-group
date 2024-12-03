'use client'

import React, { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Edit2Icon, PlusIcon } from 'lucide-react'
import { SmallButton } from '../../custom-ui/small-button'

type Bank = {
  id: string
  bankCode: string
  bankName: string
  branchName: string
  routerNo: string
  accountNo: string
  accountName: string
  companyCodes: string[]
  accountCode: string
}

type Company = {
  code: string
  name: string
}

const dummyBanks: Bank[] = [
  {
    id: '1',
    bankCode: 'BNK001',
    bankName: 'Bank A',
    branchName: 'Main Branch',
    routerNo: '001122',
    accountNo: '1234567890',
    accountName: 'Company Account',
    companyCodes: ['CC001', 'CC002'],
    accountCode: 'AC001',
  },
  {
    id: '2',
    bankCode: 'BNK002',
    bankName: 'Bank B',
    branchName: 'Downtown',
    routerNo: '002233',
    accountNo: '0987654321',
    accountName: 'Payroll Account',
    companyCodes: ['CC002'],
    accountCode: 'AC002',
  },
]

const bankNames = ['Bank A', 'Bank B', 'Bank C', 'Bank D']
const companies: Company[] = [
  { code: 'CC001', name: 'Company A' },
  { code: 'CC002', name: 'Company B' },
  { code: 'CC003', name: 'Company C' },
  { code: 'CC004', name: 'Company D' },
]

export default function Banks() {
  const [banks, setBanks] = useState<Bank[]>(dummyBanks)
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null)
  const [isMainDialogOpen, setIsMainDialogOpen] = useState(false)
  const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedBank) {
      setSelectedBank({ ...selectedBank, [e.target.name]: e.target.value })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    if (selectedBank) {
      setSelectedBank({ ...selectedBank, [name]: value })
    }
  }

  const handleCompanyCodeChange = (companyCode: string) => {
    if (selectedBank) {
      const updatedCompanyCodes = selectedBank.companyCodes.includes(
        companyCode
      )
        ? selectedBank.companyCodes.filter((code) => code !== companyCode)
        : [...selectedBank.companyCodes, companyCode]

      setSelectedBank({ ...selectedBank, companyCodes: updatedCompanyCodes })
    }
  }

  const saveBank = () => {
    if (selectedBank) {
      if (selectedBank.id) {
        setBanks(
          banks.map((bank) =>
            bank.id === selectedBank.id ? selectedBank : bank
          )
        )
      } else {
        setBanks([...banks, { ...selectedBank, id: Date.now().toString() }])
      }
      setIsMainDialogOpen(false)
      setSelectedBank(null)
    }
  }

  const saveCompanyCodes = () => {
    if (selectedBank) {
      setBanks(
        banks.map((bank) =>
          bank.id === selectedBank.id
            ? { ...bank, companyCodes: selectedBank.companyCodes }
            : bank
        )
      )
    }
  }

  const addNewBank = () => {
    setSelectedBank({
      id: '',
      bankCode: '',
      bankName: '',
      branchName: '',
      routerNo: '',
      accountNo: '',
      accountName: '',
      companyCodes: [],
      accountCode: '',
    })
    setIsMainDialogOpen(true)
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Banks</h1>
        <Button onClick={addNewBank}>
          <PlusIcon className="mr-2 h-4 w-4" /> Add Bank
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bank Code</TableHead>
              <TableHead>Bank Name</TableHead>
              <TableHead>Branch Name</TableHead>
              <TableHead>Router No</TableHead>
              <TableHead>Account No</TableHead>
              <TableHead>Account Name</TableHead>
              <TableHead>Company Codes</TableHead>
              <TableHead>Account Code</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {banks.map((bank) => (
              <TableRow key={bank.id}>
                <TableCell>{bank.bankCode}</TableCell>
                <TableCell>{bank.bankName}</TableCell>
                <TableCell>{bank.branchName}</TableCell>
                <TableCell>{bank.routerNo}</TableCell>
                <TableCell>{bank.accountNo}</TableCell>
                <TableCell>{bank.accountName}</TableCell>
                <TableCell>{bank.companyCodes.join(', ')}</TableCell>
                <TableCell>{bank.accountCode}</TableCell>
                <TableCell>
                  <SmallButton
                    onClick={() => {
                      setSelectedBank(bank)
                      setIsMainDialogOpen(true)
                    }}
                  >
                    <Edit2Icon className="h-4 w-4" />
                  </SmallButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isMainDialogOpen} onOpenChange={setIsMainDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedBank?.id ? 'Edit Bank' : 'Add Bank'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bankCode" className="text-right">
                Bank Code
              </Label>
              <Input
                id="bankCode"
                name="bankCode"
                value={selectedBank?.bankCode || ''}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bankName" className="text-right">
                Bank Name
              </Label>
              <Select
                onValueChange={(value) => handleSelectChange('bankName', value)}
                value={selectedBank?.bankName}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select bank" />
                </SelectTrigger>
                <SelectContent>
                  {bankNames.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="branchName" className="text-right">
                Branch Name
              </Label>
              <Input
                id="branchName"
                name="branchName"
                value={selectedBank?.branchName || ''}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="routerNo" className="text-right">
                Router No
              </Label>
              <Input
                id="routerNo"
                name="routerNo"
                value={selectedBank?.routerNo || ''}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="accountNo" className="text-right">
                Account No
              </Label>
              <Input
                id="accountNo"
                name="accountNo"
                value={selectedBank?.accountNo || ''}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="accountName" className="text-right">
                Account Nam
              </Label>
              <Input
                id="accountName"
                name="accountName"
                value={selectedBank?.accountName || ''}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="companyCodes" className="text-right">
                Company Codes
              </Label>
              <div className="col-span-3 flex justify-between items-center">
                <p>{selectedBank?.companyCodes.join(', ')}</p>
                <Dialog
                  open={isCompanyDialogOpen}
                  onOpenChange={setIsCompanyDialogOpen}
                >
                  <DialogTrigger asChild>
                    <SmallButton onClick={() => setIsCompanyDialogOpen(true)}>
                      <Edit2Icon className="h-4 w-4" />
                    </SmallButton>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Edit Company Codes</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      {companies.map((company) => (
                        <div
                          key={company.code}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={company.code}
                            checked={selectedBank?.companyCodes.includes(
                              company.code
                            )}
                            onCheckedChange={() =>
                              handleCompanyCodeChange(company.code)
                            }
                          />
                          <label
                            htmlFor={company.code}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {company.code} - {company.name}
                          </label>
                        </div>
                      ))}
                    </div>
                    <DialogClose asChild>
                      <Button onClick={saveCompanyCodes}>Save</Button>
                    </DialogClose>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="accountCode" className="text-right">
                Account Code
              </Label>
              <Input
                id="accountCode"
                name="accountCode"
                value={selectedBank?.accountCode || ''}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsMainDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={saveBank}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
