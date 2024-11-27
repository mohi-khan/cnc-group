"use client"

import React, { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"

interface User {
    id: number
    username: string
    VoucherTypes: string[]
    roleId: string | number | null
    active: boolean
}

interface UpdateUserData {
    username?: string
    voucherTypes?: string[]
    roleId?: string | number | null
    active?: boolean
}

const USERS_PER_PAGE = 5

export default function UsersList() {
    const [users, setUsers] = useState<User[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [availableRoles, setAvailableRoles] = useState<{ id: number, name: string }[]>([])

    useEffect(() => {
        fetchUsers()
        fetchRoles()
    }, [])

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/auth/users')
            if (!response.ok) {
                throw new Error('Failed to fetch users')
            }
            const data = await response.json()
            if (data.status === 'success' && Array.isArray(data.data.users)) {
                setUsers(data.data.users)
            } else {
                throw new Error('Unexpected data format')
            }
        } catch (error) {
            console.error('Error fetching users:', error)
        }
    }

    const fetchRoles = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/roles/get-all-roles')
            if (!response.ok) {
                throw new Error('Failed to fetch roles')
            }
            const data = await response.json()
            console.log(data.data[0].roleName);
            if (data.status === 'success' && Array.isArray(data.data)) {


                setAvailableRoles(data.data)

            } else {
                throw new Error('Unexpected data format')
            }
        } catch (error) {
            console.error('Error fetching roles:', error)
        }
    }

    const totalPages = Math.ceil(users.length / USERS_PER_PAGE)
    const startIndex = (currentPage - 1) * USERS_PER_PAGE
    const endIndex = startIndex + USERS_PER_PAGE
    const currentUsers = users.slice(startIndex, endIndex)

    const handleEditUser = (user: User) => {
        setEditingUser({
            ...user,
            roleId: user.roleId ? user.roleId.toString() : ''
        })
        setIsEditDialogOpen(true)
    }

    const handleSaveEdit = async () => {
        if (editingUser) {
            try {
                const updateData: UpdateUserData = {
                    username: editingUser.username,
                    voucherTypes: editingUser.VoucherTypes,
                    roleId: editingUser.roleId ? Number(editingUser.roleId) : undefined,
                    active: editingUser.active
                }

                const response = await fetch(`http://localhost:4000/api/auth/users/${editingUser.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updateData),
                })

                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.message || 'Failed to update user')
                }

                const result = await response.json()

                if (result.status === "success") {
                    setUsers(users.map(user =>
                        user.id === editingUser.id ? { ...editingUser } : user
                    ))
                    setEditingUser(null)
                    setIsEditDialogOpen(false)
                } else {
                    throw new Error(result.message || 'Failed to update user')
                }
            } catch (error) {
                console.error('Error updating user:', error)
                alert(`Error updating user: ${error instanceof Error ? error.message : 'Unknown error'}`)
            }
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setEditingUser(prev => prev ? { ...prev, [name]: value } : null)
    }

    const handleToggleActive = async (userId: number, currentActiveState: boolean) => {
        const newActiveState = !currentActiveState;

        setUsers(users.map(user =>
            user.id === userId ? { ...user, active: newActiveState } : user
        ));

        try {
            const response = await fetch(`http://localhost:4000/api/auth/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ active: newActiveState }),
            });

            if (!response.ok) {
                throw new Error('Failed to toggle user active state');
            }

            const result = await response.json();

            if (result.status !== "success") {
                setUsers(users.map(user =>
                    user.id === userId ? { ...user, active: currentActiveState } : user
                ));
                throw new Error(result.message || 'Failed to toggle user active state');
            }
        } catch (error) {
            console.error('Error toggling user active state:', error);
            alert(`Error toggling user active state: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-4">Employee List</h1>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Serial Number</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {currentUsers.map((user, index) => (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium">{startIndex + index + 1}</TableCell>
                            <TableCell>{user.username}</TableCell>
                            <TableCell className="text-right space-x-2">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            View Details
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle><span className='ring-2 px-3 py-1 rounded-xl hover:bg-slate-200'>{user.username}</span></DialogTitle>
                                        </DialogHeader>
                                        <div className="py-4">
                                            <p><strong>Voucher Types:</strong> {user.VoucherTypes.join(', ')}</p>
                                            <p><strong>Role Id:</strong> {user.roleId}</p>
                                            <p><strong>Active:</strong> {user.active ? 'Yes' : 'No'}</p>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                                            Edit
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Edit User</DialogTitle>
                                        </DialogHeader>
                                        <div className="py-4">
                                            <Label htmlFor="username">Username</Label>
                                            <Input
                                                id="username"
                                                name="username"
                                                value={editingUser?.username || ''}
                                                onChange={handleInputChange}
                                                className="mb-2"
                                            />
                                            <Label htmlFor="roleModel">Role Model</Label>
                                            <Select
                                                value={editingUser?.roleId?.toString()}
                                                onValueChange={(value) => setEditingUser(prev => prev ? { ...prev, roleModel: value } : null)}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select a role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableRoles.map((role) => (
                                                        <SelectItem key={role.id} value={role.id}>
                                                            {role.roleName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Label htmlFor="voucherTypes">Voucher Types</Label>
                                            <Input
                                                id="voucherTypes"
                                                name="VoucherTypes"
                                                value={editingUser?.VoucherTypes.join(', ') || ''}
                                                onChange={(e) => setEditingUser(prev => prev ? { ...prev, VoucherTypes: e.target.value.split(', ') } : null)}
                                                className="mb-2"
                                            />
                                        </div>
                                        <DialogFooter>
                                            <Button onClick={handleSaveEdit}>Save Changes</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                                <Button
                                    variant={user.active ? "ghost" : "destructive"}
                                    size="sm"
                                    onClick={() => handleToggleActive(user.id, user.active)}
                                >
                                    {user.active ? 'Deactivate' : 'Activate'}
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
                                aria-disabled={currentPage === 1}
                                tabIndex={currentPage === 1 ? -1 : undefined}
                                className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
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
                                aria-disabled={currentPage === totalPages}
                                tabIndex={currentPage === totalPages ? -1 : undefined}
                                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    )
}
