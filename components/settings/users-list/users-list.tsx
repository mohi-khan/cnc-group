'use client'

import React, { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import {
  getAllCompanies,
  getAllLocations,
  getAllRoles,
} from '@/api/common-shared-api'
import { tokenAtom, useInitializeUser } from '@/utils/user'
import { useAtom } from 'jotai'
import { RoleData } from '@/api/create-user-api'
import { GetUsersByRoles } from '@/api/user-list-api'
import { toast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { changeNewPassword } from '@/api/change-password-api'
import { CompanyType } from '@/api/company-api'
import { LocationData } from '@/utils/type'

interface User {
  id: number
  username: string
  voucherTypes: string[]
  roleId: number | null
  active: boolean
  roleName?: string
  companyId?: number | null
}

interface UpdateUserData {
  username?: string
  voucherTypes?: string[]
  roleName?: string
  roleId?: number | null
  active?: boolean
  companyIds?: number[]
  locationIds?: number[]
}

const USERS_PER_PAGE = 10
const VOUCHER_TYPES = [
  'Cash Voucher',
  'Bank Voucher',
  'Journal Voucher',
  'Contra Voucher',
]

export default function UsersList() {
  useInitializeUser()
  const [token] = useAtom(tokenAtom)
  const router = useRouter()

  const [users, setUsers] = useState<User[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [roles, setRoles] = useState<RoleData[]>([])

  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [selectedUserForPassword, setSelectedUserForPassword] =
    useState<User | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [companies, setCompanies] = useState<CompanyType[]>([])
  const [getLoaction, setGetLocation] = useState<LocationData[]>([])
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

  const fetchCompanies = React.useCallback(async () => {
    if (!token) return
    const data = await getAllCompanies(token)

    if (data.error || !data.data) {
      console.error('Error getting companies:', data.error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: data.error?.message || 'Failed to get companies',
      })
      setCompanies([])
    } else {
      const companyData = Array.isArray(data.data) ? data.data : []
      setCompanies(companyData)
      console.log('company :', companyData)
    }
  }, [token])

  const fetchLocation = React.useCallback(async () => {
    if (!token) return
    const response = await getAllLocations(token)
    setGetLocation(response.data ?? [])
  }, [token])

  const fetchUsers = React.useCallback(async () => {
    if (!token) return
    const data = await GetUsersByRoles(token)

    if (data?.error?.status === 401) {
      router.push('/unauthorized-access')
      return
    } else if (data.error || !data.data) {
      console.error('Error getting users:', data.error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: data.error?.message || 'Failed to get users',
      })
    } else {
      setUsers(data.data)
      console.log('show all user with company and location :', data.data)
    }
  }, [token, router])

  const fetchRoles = React.useCallback(async () => {
    if (!token) return
    const fetchedRoles = await getAllRoles(token)
    if (fetchedRoles.error || !fetchedRoles.data) {
      console.error('Error getting roles:', fetchedRoles.error)
      toast({
        title: 'Error',
        description: fetchedRoles.error?.message || 'Failed to get roles',
      })
    } else {
      setRoles(fetchedRoles.data)
    }
  }, [token])

  const refreshAttachment = async () => {
    try {
      await fetchUsers()
    } catch (error) {
      console.error('Error refreshing attachment:', error)
    }
  }

  useEffect(() => {
    const checkUserData = () => {
      const storedUserData = localStorage.getItem('currentUser')
      const storedToken = localStorage.getItem('authToken')

      if (!storedUserData || !storedToken) {
        router.push('/')
        return
      }
    }

    checkUserData()
    fetchUsers()
    fetchRoles()
    fetchCompanies()
    fetchLocation()
  }, [fetchUsers, fetchRoles, router, fetchCompanies, fetchLocation])

  const uniqueUsers = React.useMemo(() => {
    const userMap = new Map<number, any>()
    users.forEach((user) => {
      if (!userMap.has(user.id)) {
        userMap.set(user.id, user)
      }
    })
    const result = Array.from(userMap.values())
    console.log('Unique users:', result)
    return result
  }, [users])

  const totalPages = Math.ceil(uniqueUsers.length / USERS_PER_PAGE)
  const startIndex = (currentPage - 1) * USERS_PER_PAGE
  const endIndex = startIndex + USERS_PER_PAGE
  const currentUsers = uniqueUsers.slice(startIndex, endIndex)

  const handleEditUser = (user: User) => {
    const userCompanyIds = users
      .filter((u: any) => u.id === user.id)
      .map((u: any) => u.companyId)
      .filter((id: number | null) => id !== null) as number[]

    const userLocationIds = users
      .filter((u: any) => u.id === user.id)
      .map((u: any) => u.locationId)
      .filter((id: number | null) => id !== null) as number[]

    setEditingUser({
      ...user,
      roleId: user.roleId ?? user.roleId,
      voucherTypes: user.voucherTypes || [],
      username: user.username || '',
      companyIds: Array.from(new Set(userCompanyIds)),
      locationIds: Array.from(new Set(userLocationIds)),
    } as any)
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (editingUser) {
      try {
        const updateData: any = {
          username: editingUser.username,
          voucherTypes: editingUser.voucherTypes,
          roleId: editingUser.roleId === 0 ? null : editingUser.roleId,
          active: editingUser.active,
          companyIds: (editingUser as any).companyIds || [],
          locationIds: (editingUser as any).locationIds || [],
        }

        console.log('Updating user with data:', updateData)

        const response = await fetch(
          `${API_BASE_URL}/api/auth/users/${editingUser.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `${token}`,
            },
            body: JSON.stringify(updateData),
          }
        )

        console.log('Response status:', response.status)

        if (!response.ok) {
          const errorData = await response.json()
          console.error('Error response:', errorData)
          throw new Error(errorData.message || 'Failed to update user')
        }

        const result = await response.json()
        console.log('Update result:', result)

        if (result.status === 'success') {
          setEditingUser(null)
          setIsEditDialogOpen(false)
          await refreshAttachment()
          toast({
            title: 'Success',
            description: 'User updated successfully',
          })
        } else {
          throw new Error(result.message || 'Failed to update user')
        }
      } catch (error) {
        console.error('Error updating user:', error)
        toast({
          variant: 'destructive',
          title: 'Error',
          description: `Error updating user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        })
      } finally {
        setIsEditDialogOpen(false)
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditingUser((prev) => (prev ? { ...prev, [name]: value } : null))
  }

  const handleVoucherTypeChange = (voucherType: string, checked: boolean) => {
    setEditingUser((prev) => {
      if (!prev) return null
      const updatedVoucherTypes = checked
        ? [...prev.voucherTypes, voucherType]
        : prev.voucherTypes.filter((type) => type !== voucherType)
      return { ...prev, voucherTypes: updatedVoucherTypes }
    })
  }

  const handleCompanyChange = (companyId: number, checked: boolean) => {
    setEditingUser((prev: any) => {
      if (!prev) return null
      const updatedCompanyIds = checked
        ? [...(prev.companyIds || []), companyId]
        : (prev.companyIds || []).filter((id: number) => id !== companyId)
      return { ...prev, companyIds: updatedCompanyIds }
    })
  }

  const handleLocationChange = (locationId: number, checked: boolean) => {
    setEditingUser((prev: any) => {
      if (!prev) return null
      const updatedLocationIds = checked
        ? [...(prev.locationIds || []), locationId]
        : (prev.locationIds || []).filter((id: number) => id !== locationId)
      return { ...prev, locationIds: updatedLocationIds }
    })
  }

  const handleToggleActive = async (
    userId: number,
    currentActiveState: boolean
  ) => {
    const newActiveState = !currentActiveState

    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, active: newActiveState } : user
      )
    )

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        },
        body: JSON.stringify({ active: newActiveState }),
      })

      if (!response.ok) {
        throw new Error('Failed to toggle user active state')
      }

      const result = await response.json()

      if (result.status !== 'success') {
        setUsers(
          users.map((user) =>
            user.id === userId ? { ...user, active: currentActiveState } : user
          )
        )
        throw new Error(result.message || 'Failed to toggle user active state')
      }
      await refreshAttachment()
    } catch (error) {
      console.error('Error toggling user active state:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Error toggling user active state: ${error instanceof Error ? error.message : 'Unknown error'}`,
      })
    }
  }

  const handleOpenPasswordDialog = (user: User) => {
    setSelectedUserForPassword(user)
    setNewPassword('')
    setConfirmPassword('')
    setPasswordError('')
    setShowNewPassword(false)
    setShowConfirmPassword(false)
    setIsPasswordDialogOpen(true)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')

    if (!selectedUserForPassword) return

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters')
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'New password must be at least 8 characters',
      })
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords don't match")
      toast({
        variant: 'destructive',
        title: 'Error',
        description: "New passwords don't match",
      })
      return
    }

    setIsChangingPassword(true)

    try {
      const result = await changeNewPassword(
        selectedUserForPassword.id,
        newPassword,
        confirmPassword,
        token
      )

      if (result.error || !result.data) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error?.message || 'Failed to change password',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Password changed successfully',
        })
        setIsPasswordDialogOpen(false)
        setNewPassword('')
        setConfirmPassword('')
        setSelectedUserForPassword(null)
      }
    } catch (error) {
      console.error('Error changing password:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to change password',
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  const getUserCompanies = (userId: number) => {
    if (!Array.isArray(users) || !Array.isArray(companies)) {
      return []
    }

    const userRecords = users.filter((u: any) => u.id === userId)

    const uniqueCompanyIds = Array.from(
      new Set(
        userRecords
          .map((record: any) => record.companyId)
          .filter((id) => id !== null)
      )
    )

    const companyNames = uniqueCompanyIds
      .map((companyId) => {
        const company = companies.find((c: any) => c.companyId === companyId)
        return company ? company.companyName : null
      })
      .filter((name) => name !== null)

    console.log(`User ${userId} companies:`, companyNames)
    return companyNames as string[]
  }

  const getUserLocations = (userId: number) => {
    if (!Array.isArray(users) || !Array.isArray(getLoaction)) {
      return []
    }

    const userRecords = users.filter((u: any) => u.id === userId)

    const uniqueLocationIds = Array.from(
      new Set(
        userRecords
          .map((record: any) => record.locationId)
          .filter((id) => id !== null)
      )
    )

    const locationNames = uniqueLocationIds
      .map((locationId) => {
        const location = getLoaction.find(
          (l: any) => l.locationId === locationId
        )
        return location ? location.address : null
      })
      .filter((name) => name !== null)

    console.log(`User ${userId} locations:`, locationNames)
    return locationNames as string[]
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User List</h1>

      <Table className="border shadow-md">
        <TableHeader className="bg-slate-200 shadow-sm sticky top-28 z-10">
          <TableRow>
            <TableHead className="w-[100px]">Serial Number</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentUsers.map((user, index) => (
            <TableRow key={`user-${user.id}-${index}`}>
              <TableCell className="font-medium">
                {startIndex + index + 1}
              </TableCell>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.roleName || 'N/A'}</TableCell>
              <TableCell className="text-right space-x-2">
                <Dialog key={`view-${user.id}-${index}`}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        <span className="ring-2 px-3 py-1 rounded-xl hover:bg-slate-200 capitalize">
                          {user.username}
                        </span>
                      </DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                      <div>
                        <p className="font-semibold">Voucher Types:</p>
                        <p className="ml-4">
                          {user.voucherTypes && user.voucherTypes.length > 0
                            ? user.voucherTypes.join(', ')
                            : 'None'}
                        </p>
                      </div>

                      <div>
                        <p className="font-semibold">Role:</p>
                        <p className="ml-4">{user.roleName || 'N/A'}</p>
                      </div>

                      <div>
                        <p className="font-semibold">Active:</p>
                        <p className="ml-4">{user.active ? 'Yes' : 'No'}</p>
                      </div>

                      <div>
                        <p className="font-semibold mb-3">
                          Company and Location
                        </p>
                        {(() => {
                          const userRecords = users.filter(
                            (u: any) => u.id === user.id
                          )

                          const companyGroups = new Map<number, Set<number>>()

                          userRecords.forEach((record: any) => {
                            if (record.companyId) {
                              if (!companyGroups.has(record.companyId)) {
                                companyGroups.set(record.companyId, new Set())
                              }
                              if (record.locationId) {
                                companyGroups
                                  .get(record.companyId)!
                                  .add(record.locationId)
                              }
                            }
                          })

                          if (companyGroups.size === 0) {
                            return (
                              <p className="ml-4 text-gray-500">
                                No companies and locations assigned
                              </p>
                            )
                          }

                          return (
                            <div className="space-y-3">
                              {Array.from(companyGroups.entries()).map(
                                ([companyId, locationIds]) => {
                                  const company = companies.find(
                                    (c: any) => c.companyId === companyId
                                  )

                                  const companyLocations = Array.from(
                                    locationIds
                                  )
                                    .map((locId) =>
                                      getLoaction.find(
                                        (l: any) =>
                                          l.locationId === locId &&
                                          l.companyId === companyId
                                      )
                                    )
                                    .filter(Boolean)

                                  return (
                                    <div
                                      key={`company-group-${companyId}`}
                                      className="rounded-md p-3 bg-white ring-1 ring-gray-200"
                                    >
                                      <div className="flex items-start gap-2 mb-2">
                                        <Checkbox
                                          checked={true}
                                          disabled
                                          className="mt-0.5 rounded-full data-[state=checked]:bg-primary data-[state=checked]:text-white"
                                          style={{
                                            borderRadius: '50%',
                                          }}
                                        />

                                        <p className="font-semibold text-sm text-black">
                                          {company?.companyName ||
                                            'Unknown Company'}
                                        </p>
                                      </div>
                                      {companyLocations.length > 0 ? (
                                        <div className="ml-6 grid grid-cols-2 gap-x-4 gap-y-1">
                                          {companyLocations.map(
                                            (location: any, idx) => (
                                              <div
                                                key={`location-${location.locationId}-${idx}`}
                                                className="flex items-start gap-2"
                                              >
                                                <div className="w-2 h-2 bg-black mt-1" />
                                                <p className="text-sm text-black">
                                                  {location.address}
                                                </p>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      ) : (
                                        <p className="ml-6 text-sm text-gray-400">
                                          No specific location
                                        </p>
                                      )}
                                    </div>
                                  )
                                }
                              )}
                            </div>
                          )
                        })()}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenPasswordDialog(user)}
                >
                  Change Password
                </Button>

                <Dialog
                  open={isEditDialogOpen}
                  onOpenChange={setIsEditDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditUser(user)}
                    >
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
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
                      <Label htmlFor="roleId">Role</Label>
                      <Select
                        value={editingUser?.roleId?.toString() || 'no-role'}
                        onValueChange={(value) =>
                          setEditingUser((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  roleId:
                                    value !== 'no-role'
                                      ? parseInt(value)
                                      : null,
                                }
                              : null
                          )
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no-role">
                            {editingUser?.roleName || 'No Role'}
                          </SelectItem>
                          {roles.map((role) => (
                            <SelectItem
                              key={role.roleId}
                              value={role.roleId.toString()}
                            >
                              {role.roleName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Label htmlFor="voucherTypes" className="mt-4 block">
                        Voucher Types
                      </Label>
                      <div className="space-y-2">
                        {VOUCHER_TYPES.map((voucherType) => (
                          <div
                            key={voucherType}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`voucherType-${voucherType}`}
                              checked={
                                editingUser?.voucherTypes?.includes(
                                  voucherType
                                ) || false
                              }
                              onCheckedChange={(checked) =>
                                handleVoucherTypeChange(
                                  voucherType,
                                  checked as boolean
                                )
                              }
                            />
                            <Label
                              htmlFor={`voucherType-${voucherType}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {voucherType}
                            </Label>
                          </div>
                        ))}
                      </div>

                      <Label htmlFor="companies" className="mt-4 block">
                        Companies
                      </Label>
                      <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
                        {companies
                          .filter((company) => company.companyId !== undefined)
                          .map((company) => (
                            <div
                              key={company.companyId}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`company-${company.companyId}`}
                                checked={
                                  (editingUser as any)?.companyIds?.includes(
                                    company.companyId!
                                  ) || false
                                }
                                onCheckedChange={(checked) =>
                                  handleCompanyChange(
                                    company.companyId!,
                                    checked as boolean
                                  )
                                }
                              />
                              <Label
                                htmlFor={`company-${company.companyId}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {company.companyName}
                              </Label>
                            </div>
                          ))}
                      </div>

                      <Label htmlFor="locations" className="mt-4 block">
                        Locations (Company-wise)
                      </Label>
                      <div className="space-y-3 max-h-60 overflow-y-auto border rounded-md p-3">
                        {companies
                          .filter((company) => company.companyId !== undefined)
                          .map((company) => {
                            // Get locations for this company
                            const companyLocations = getLoaction.filter(
                              (location) =>
                                location.companyId === company.companyId
                            )

                            // Only show companies that have locations
                            if (companyLocations.length === 0) return null

                            return (
                              <div
                                key={`company-loc-${company.companyId}`}
                                className="border rounded-lg p-3 bg-slate-50"
                              >
                                <p className="font-semibold text-sm mb-2 text-gray-700">
                                  {company.companyName}
                                </p>
                                <div className="space-y-2 ml-4">
                                  {companyLocations.map((location) => (
                                    <div
                                      key={location.locationId}
                                      className="flex items-center space-x-2"
                                    >
                                      <Checkbox
                                        id={`location-${location.locationId}`}
                                        checked={
                                          (
                                            editingUser as any
                                          )?.locationIds?.includes(
                                            location.locationId!
                                          ) || false
                                        }
                                        onCheckedChange={(checked) =>
                                          handleLocationChange(
                                            location.locationId!,
                                            checked as boolean
                                          )
                                        }
                                      />
                                      <Label
                                        htmlFor={`location-${location.locationId}`}
                                        className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                      >
                                        {location.address}
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleSaveEdit}>Submit</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button
                  variant={user.active ? 'ghost' : 'destructive'}
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

      <Dialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Change Password for {selectedUserForPassword?.username}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={8}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={8}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            {passwordError && (
              <Alert variant="destructive">
                <AlertDescription>{passwordError}</AlertDescription>
              </Alert>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPasswordDialogOpen(false)}
                disabled={isChangingPassword}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={isChangingPassword}
                onClick={handleChangePassword}
              >
                {isChangingPassword ? 'Changing...' : 'Change Password'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <div className="mt-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                aria-disabled={currentPage === 1}
                tabIndex={currentPage === 1 ? -1 : undefined}
                className={
                  currentPage === 1 ? 'pointer-events-none opacity-50' : ''
                }
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={`page-${i}`}>
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
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                aria-disabled={currentPage === totalPages}
                tabIndex={currentPage === totalPages ? -1 : undefined}
                className={
                  currentPage === totalPages
                    ? 'pointer-events-none opacity-50'
                    : ''
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}
