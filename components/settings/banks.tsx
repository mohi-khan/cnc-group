'use client'

import React, { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit2Icon } from 'lucide-react'
import { SmallButton } from '../custom-ui/small-button'

type Bank = {
    id: string
    bankCode: string
    bankName: string
    branchName: string
    routerNo: string
    accountNo: string
    accountName: string
    companyCode: string
    accountCode: string
}

type Company = {
    code: string
    name: string
}

const dummyData: Bank[] = [
    { id: 'B001', bankCode: 'ABCD', bankName: 'Bank A', branchName: 'Main Branch', routerNo: '123456', accountNo: '1234567890', accountName: 'Company Account 1', companyCode: 'CC001', accountCode: 'AC001' },
    { id: 'B002', bankCode: 'EFGH', bankName: 'Bank B', branchName: 'Downtown', routerNo: '234567', accountNo: '2345678901', accountName: 'Company Account 2', companyCode: 'CC002', accountCode: 'AC002' },
    { id: 'B003', bankCode: 'IJKL', bankName: 'Bank C', branchName: 'Uptown', routerNo: '345678', accountNo: '3456789012', accountName: 'Company Account 3', companyCode: 'CC003', accountCode: 'AC003' },
]

const companies: Company[] = [
    { code: 'CC001', name: 'Company A' },
    { code: 'CC002', name: 'Company B' },
    { code: 'CC003', name: 'Company C' },
    { code: 'CC004', name: 'Company D' },
    { code: 'CC005', name: 'Company E' },
]

const bankNames = ['Bank A', 'Bank B', 'Bank C', 'Bank D', 'Bank E']

export default function Banks() {
    const [banks, setBanks] = useState<Bank[]>(dummyData)
    const [selectedBank, setSelectedBank] = useState<Bank | null>(null)
    const [open, setOpen] = useState(false)

    const handleInputChange = (field: keyof Bank, value: string) => {
        if (selectedBank) {
            setSelectedBank({ ...selectedBank, [field]: value })
        }
    }

    const generateAccountCode = () => {
        // Simple implementation: use 'AC' prefix and a random number
        return `AC${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
    }

    const saveBank = () => {
        if (selectedBank) {
            const updatedBank = {
                ...selectedBank,
                accountCode: selectedBank.accountCode || generateAccountCode()
            }
            setBanks(banks.map(bank => bank.id === updatedBank.id ? updatedBank : bank))
            setSelectedBank(null)
            setOpen(false)
        }
    }

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-6">Banks</h1>
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
                            <TableHead>Company Code</TableHead>
                            <TableHead>Account Code</TableHead>
                            <TableHead>Actions</TableHead>
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
                                <TableCell>{bank.companyCode}</TableCell>
                                <TableCell>{bank.accountCode}</TableCell>
                                <TableCell>
                                    <Dialog open={open} onOpenChange={setOpen}>
                                        <DialogTrigger asChild>
                                            <SmallButton onClick={() => {
                                                setSelectedBank(bank)
                                                setOpen(true)
                                            }}>
                                                <Edit2Icon className="h-4 w-4" />
                                            </SmallButton>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px] bg-white shadow-lg">
                                            <DialogHeader>
                                                <DialogTitle>Edit Bank</DialogTitle>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <label htmlFor="bankCode">Bank Code</label>
                                                    <Input
                                                        id="bankCode"
                                                        value={selectedBank?.bankCode}
                                                        onChange={(e) => handleInputChange('bankCode', e.target.value)}
                                                        className="col-span-3"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <label htmlFor="bankName">Bank Name</label>
                                                    <Select
                                                        value={selectedBank?.bankName}
                                                        onValueChange={(value) => handleInputChange('bankName', value)}
                                                    >
                                                        <SelectTrigger className="col-span-3">
                                                            <SelectValue placeholder="Select bank" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {bankNames.map((name) => (
                                                                <SelectItem key={name} value={name}>{name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <label htmlFor="branchName">Branch Name</label>
                                                    <Input
                                                        id="branchName"
                                                        value={selectedBank?.branchName}
                                                        onChange={(e) => handleInputChange('branchName', e.target.value)}
                                                        className="col-span-3"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <label htmlFor="routerNo">Router No</label>
                                                    <Input
                                                        id="routerNo"
                                                        value={selectedBank?.routerNo}
                                                        onChange={(e) => handleInputChange('routerNo', e.target.value)}
                                                        className="col-span-3"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <label htmlFor="accountNo">Account No</label>
                                                    <Input
                                                        id="accountNo"
                                                        value={selectedBank?.accountNo}
                                                        onChange={(e) => handleInputChange('accountNo', e.target.value)}
                                                        className="col-span-3"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <label htmlFor="accountName">Account Name</label>
                                                    <Input
                                                        id="accountName"
                                                        value={selectedBank?.accountName}
                                                        onChange={(e) => handleInputChange('accountName', e.target.value)}
                                                        className="col-span-3"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <label htmlFor="companyCode">Company Code</label>
                                                    <Select
                                                        value={selectedBank?.companyCode}
                                                        onValueChange={(value) => handleInputChange('companyCode', value)}
                                                    >
                                                        <SelectTrigger className="col-span-3">
                                                            <SelectValue placeholder="Select company" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {companies.map((company) => (
                                                                <SelectItem key={company.code} value={company.code}>{company.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <label htmlFor="accountCode">Account Code</label>
                                                    <Input
                                                        id="accountCode"
                                                        value={selectedBank?.accountCode}
                                                        readOnly
                                                        className="col-span-3"
                                                    />
                                                </div>
                                            </div>
                                            <Button onClick={saveBank}>Save</Button>
                                        </DialogContent>
                                    </Dialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}