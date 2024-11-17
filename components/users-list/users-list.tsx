'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface User {
    id: number
    name: string
    isDisabled: boolean
    company: string
    voucher: string
    role: string
}

const USERS_PER_PAGE = 10

export default function UsersList() {
    const [users, setUsers] = useState<User[]>([
        { id: 1, name: "John Doe", isDisabled: false, company: "Acme Inc.", voucher: "ACME001", role: "Manager" },
        { id: 2, name: "Jane Smith", isDisabled: false, company: "TechCorp", voucher: "TECH002", role: "Developer" },
        { id: 3, name: "Alice Johnson", isDisabled: false, company: "DataSoft", voucher: "DATA003", role: "Analyst" },
        // Add more users as needed
    ])
    const [currentPage, setCurrentPage] = useState(1)

    const totalPages = Math.ceil(users.length / USERS_PER_PAGE)
    const startIndex = (currentPage - 1) * USERS_PER_PAGE
    const endIndex = startIndex + USERS_PER_PAGE
    const currentUsers = users.slice(startIndex, endIndex)

    const handleDisableAccount = (userId: number) => {
        setUsers(users.map(user =>
            user.id === userId ? { ...user, isDisabled: !user.isDisabled } : user
        ))
    }

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-4">Users List</h1>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Sl No</TableHead>
                        <TableHead>Name of the Employee</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {currentUsers.map((user, index) => (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium">{startIndex + index + 1}</TableCell>
                            <TableCell>{user.name}</TableCell>
                            <TableCell className="text-right space-x-2">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            View Details
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>{user.name}</DialogTitle>
                                        </DialogHeader>
                                        <div className="py-4">
                                            <p><strong>Company:</strong> {user.company}</p>
                                            <p><strong>Voucher:</strong> {user.voucher}</p>
                                            <p><strong>Role:</strong> {user.role}</p>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                                <Button
                                    variant={user.isDisabled ? "outline" : "destructive"}
                                    size="sm"
                                    onClick={() => handleDisableAccount(user.id)}
                                >
                                    {user.isDisabled ? "Enable Account" : "Disable Account"}
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div className="mt-4">
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            />
                        </PaginationItem>
                        {[...Array(totalPages)].map((_, i) => (
                            <PaginationItem key={i}>
                                <PaginationLink
                                    onClick={() => setCurrentPage(i + 1)}
                                    isActive={currentPage === i + 1}
                                >
                                    {i + 1}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                        <PaginationItem>
                            <PaginationNext
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    )
}