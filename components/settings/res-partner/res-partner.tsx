'use client'

import * as React from 'react'

import { zodResolver } from '@hookform/resolvers/zod'

import { useForm } from 'react-hook-form'

import { Plus, Edit, ArrowUpDown, Search } from 'lucide-react'

import { useState, useMemo } from 'react'

import { Button } from '@/components/ui/button'

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import { Input } from '@/components/ui/input'

import { Textarea } from '@/components/ui/textarea'

import { Switch } from '@/components/ui/switch'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { createResPartner, editResPartner } from '../../../api/res-partner-api'

import { useToast } from '@/hooks/use-toast'

import { type Company, resPartnerSchema, type ResPartner } from '@/utils/type'

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'

import { useAtom } from 'jotai'

import { getAllCompanies, getAllResPartners } from '@/api/common-shared-api'

import { useRouter } from 'next/navigation'

import { CustomCombobox } from '@/utils/custom-combobox'

export default function ResPartners() {
  //getting userData from jotai atom component

  useInitializeUser()

  const [userData] = useAtom(userDataAtom)

  const [token] = useAtom(tokenAtom)

  const router = useRouter()

  // State variables

  const [partners, setPartners] = React.useState<ResPartner[]>([])

  const [companies, setCompanies] = React.useState<Company[]>([])

  const [isDialogOpen, setIsDialogOpen] = React.useState(false)

  const [editingPartner, setEditingPartner] = React.useState<ResPartner | null>(
    null
  )

  const [userId, setUserId] = React.useState<number | undefined>()

  const { toast } = useToast()

  const [currentPage, setCurrentPage] = useState(1)

  const [itemsPerPage] = useState(10)

  const [sortColumn, setSortColumn] = useState<keyof ResPartner>('name')

  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const [searchTerm, setSearchTerm] = useState('')

  const form = useForm<ResPartner>({
    resolver: zodResolver(resPartnerSchema),

    defaultValues: {
      name: '',

      companyName: '',

      type: '',

      email: '',

      phone: '',

      mobile: '',

      website: '',

      isCompany: false,

      vat: '',

      street: '',

      city: '',

      zip: '',

      active: true,

      creditLimit: 0,

      // customerRank: 0,

      // supplierRank: 0,

      comment: '',
    },
  })

  React.useEffect(() => {
    const checkUserData = () => {
      const storedUserData = localStorage.getItem('currentUser')

      const storedToken = localStorage.getItem('authToken')

      if (!storedUserData || !storedToken) {
        console.log('No user data or token found in localStorage')

        router.push('/')

        return
      }
    }

    checkUserData()

    if (userData) {
      setUserId(userData?.userId)

      console.log('Current userId from localStorage:', userData.userId)
    } else {
      console.log('No user data found in localStorage')
    }
  }, [userData, router])

  const fetchResPartners = React.useCallback(async () => {
    if (!token) return

    const data = await getAllResPartners(token)

    console.log('🚀 ~ fetchrespartners ~ data:', data)

    if (data?.error?.status === 401) {
      router.push('/unauthorized-access')

      console.log('Unauthorized access')

      return
    }

    if (data.error || !data.data || !data.data) {
      console.error('Error getting res partners:', data.error)
    } else {
      console.log('partner', data)

      setPartners(data.data)
    }

    // console.log('companies here', companies)

    // setIsLoading(false)
  }, [token, router])

  const fetchCompanies = React.useCallback(async () => {
    if (!token) return

    const data = await getAllCompanies(token)

    console.log('🚀 ~ fetchCompanies ~ data:', data)

    if (data?.error?.status === 401) {
      router.push('/unauthorized-access')

      console.log('Unauthorized access')

      return
    } else if (data.error || !data.data) {
      console.error('Error getting companies:', data.error)
    } else {
      console.log('company', data.data)

      setCompanies(data.data)
    }
  }, [token, router])

  React.useEffect(() => {
    fetchResPartners()

    fetchCompanies()
  }, [fetchResPartners, fetchCompanies])

  React.useEffect(() => {
    console.log('Resetting form', { editingPartner })

    if (editingPartner) {
      form.reset({
        ...editingPartner,

        creditLimit: Number(editingPartner.creditLimit),

        updatedBy: userId,
      })
    } else {
      form.reset({
        name: '',

        companyName: '',

        type: '',

        email: '',

        phone: '',

        mobile: '',

        website: '',

        isCompany: false,

        vat: '',

        street: '',

        city: '',

        zip: '',

        active: true,

        creditLimit: 0,

        customerRank: 0,

        supplierRank: 0,

        comment: '',

        createdBy: userId,
      })
    }
  }, [editingPartner, form, userId])

  async function onSubmit(values: ResPartner) {
    console.log('Form submitted:', values)

    if (editingPartner) {
      console.log('Editing partner:', editingPartner.id)

      const response = await editResPartner(
        editingPartner.id!,

        {
          ...values,

          updatedBy: userId,
        },

        token
      )

      console.log('🚀 ~ onSubmit ~ response:', response)

      if (response.error || !response.data) {
        console.error('Error editing res partner:', response.error)

        toast({
          title: 'Error',

          description: response.error?.message || 'Failed to edit res partner',
        })
      } else {
        console.log('Account edited successfully')

        toast({
          title: 'Success',

          description: 'res partner updated successfully',
        })
      }
    } else {
      console.log('Creating new partner')

      const response = await createResPartner(
        {
          ...values,

          createdBy: userId,
        },

        token
      )

      if (response.error || !response.data) {
        console.error('Error creating res partner:', response.error)

        toast({
          title: 'Error',

          description:
            response.error?.message || 'Failed to create res partner',
        })
      } else {
        console.log('Res partner created successfully')

        toast({
          title: 'Success',

          description: 'Res partner created successfully',
        })
      }
    }

    setIsDialogOpen(false)

    setEditingPartner(null)

    form.reset()

    fetchResPartners()
  }

  function handleEdit(partner: ResPartner) {
    setEditingPartner(partner)

    setIsDialogOpen(true)

    console.log(partner, 'partner')
  }

  const handleSort = (column: keyof ResPartner | 'company') => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column as keyof ResPartner)

      setSortDirection('asc')
    }
  }

  const filteredPartners = useMemo(() => {
    return partners.filter((partner) => {
      const searchLower = searchTerm.toLowerCase()

      return (
        partner.name?.toLowerCase().includes(searchLower) ||
        partner.companyName?.toLowerCase().includes(searchLower) ||
        partner.email?.toLowerCase().includes(searchLower) ||
        partner.phone?.toLowerCase().includes(searchLower) ||
        partner.type?.toLowerCase().includes(searchLower)
      )
    })
  }, [partners, searchTerm])

  const sortedPartners = useMemo(() => {
    return [...filteredPartners].sort((a, b) => {
      if (sortColumn === 'companyName') {
        const aCompany =
          companies.find((c) => c.companyId === a.companyId)?.companyName || ''

        const bCompany =
          companies.find((c) => c.companyId === b.companyId)?.companyName || ''

        return sortDirection === 'asc'
          ? aCompany.localeCompare(bCompany)
          : bCompany.localeCompare(aCompany)
      }

      if (sortColumn === 'isCompany') {
        return sortDirection === 'asc'
          ? a.isCompany === b.isCompany
            ? 0
            : a.isCompany
              ? -1
              : 1
          : a.isCompany === b.isCompany
            ? 0
            : a.isCompany
              ? 1
              : -1
      }

      const aValue = a[sortColumn] ?? ''

      const bValue = b[sortColumn] ?? ''

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1

      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1

      return 0
    })
  }, [filteredPartners, companies, sortColumn, sortDirection])

  const paginatedPartners = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage

    return sortedPartners.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedPartners, currentPage, itemsPerPage])

  const totalPages = Math.ceil(sortedPartners.length / itemsPerPage)

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6 mx-4">
        <h1 className="text-3xl font-bold">Res Partners</h1>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />

            <Input
              placeholder="Search partners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>

          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open)

              if (!open) setEditingPartner(null)
            }}
          >
            <DialogTrigger asChild>
              <Button variant="default" className="bg-black hover:bg-black/90">
                <Plus className="mr-2 h-4 w-4" /> Add Res Partner
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPartner ? 'Edit Res Partner' : 'Add New Res Partner'}
                </DialogTitle>

                <DialogDescription>
                  {editingPartner
                    ? 'Edit the details for the res partner here.'
                    : 'Enter the details for the new res partner here.'}
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <div className="pr-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>

                            <FormControl>
                              <Input placeholder="Enter name" {...field} />
                            </FormControl>

                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company</FormLabel>

                            <FormControl>
                              <Input
                                placeholder="Enter company name"
                                {...field}
                                value={field.value ?? ''}
                              />
                            </FormControl>

                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type</FormLabel>

                            <CustomCombobox
                              items={[
                                { id: 'contact', name: 'Contact' },

                                { id: 'invoice', name: 'Invoice' },

                                { id: 'delivery', name: 'Delivery' },

                                { id: 'other', name: 'Other' },
                              ]}
                              value={{
                                id: field.value ?? '',

                                name: field.value ?? '',
                              }}
                              onChange={(value) => field.onChange(value?.id)}
                              placeholder="Select type"
                            />

                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>

                            <FormControl>
                              <Input placeholder="Enter email" {...field} />
                            </FormControl>

                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>

                            <FormControl>
                              <Input
                                placeholder="Enter phone number"
                                {...field}
                              />
                            </FormControl>

                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="mobile"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mobile</FormLabel>

                            <FormControl>
                              <Input
                                placeholder="Enter mobile number (optional)"
                                {...field}
                              />
                            </FormControl>

                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website</FormLabel>

                            <FormControl>
                              <Input
                                placeholder="Enter website (optional)"
                                {...field}
                                onChange={(e) => {
                                  const value = e.target.value

                                  field.onChange(
                                    value === '' ? undefined : value
                                  )
                                }}
                              />
                            </FormControl>

                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="vat"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>VAT</FormLabel>

                            <FormControl>
                              <Input
                                placeholder="Enter VAT number"
                                {...field}
                              />
                            </FormControl>

                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="street"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street</FormLabel>

                            <FormControl>
                              <Input
                                placeholder="Enter street address"
                                {...field}
                              />
                            </FormControl>

                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>

                            <FormControl>
                              <Input placeholder="Enter city" {...field} />
                            </FormControl>

                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="zip"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ZIP</FormLabel>

                            <FormControl>
                              <Input placeholder="Enter ZIP code" {...field} />
                            </FormControl>

                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="creditLimit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Credit Limit</FormLabel>

                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    Number.parseFloat(e.target.value)
                                  )
                                }
                              />
                            </FormControl>

                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex space-x-4 pt-5">
                      <FormField
                        control={form.control}
                        name="isCompany"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 w-full focus-within:ring-1 focus-within:ring-black focus-within:ring-offset-2 focus-within:rounded-md">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Is Company
                              </FormLabel>

                              <FormDescription>
                                Is this res partner a company?
                              </FormDescription>
                            </div>

                            <FormControl>
                              <Switch
                                checked={field.value}
                                onChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="active"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 w-full focus-within:ring-1 focus-within:ring-black focus-within:ring-offset-2 focus-within:rounded-md">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Active
                              </FormLabel>

                              <FormDescription>
                                Is this res partner active?
                              </FormDescription>
                            </div>

                            <FormControl>
                              <Switch
                                checked={field.value}
                                onChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 py-5">
                      <FormField
                        control={form.control}
                        name="comment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Comment</FormLabel>

                            <FormControl>
                              <Textarea
                                placeholder="Enter any additional comments"
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>

                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className=" bg-background pt-2 pb-4">
                    <Button type="submit" className="w-full">
                      {editingPartner ? 'Update' : 'Submit'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col">
        <Table className="border shadow-md">
          <TableHeader className="shadow-md bg-slate-200">
            <TableRow>
              {[
                'Name',

                'Company',

                'Email',

                'Phone',

                'Type',

                'Is Company',

                'Active',
              ].map((header) => (
                <TableHead
                  key={header}
                  onClick={() =>
                    handleSort(
                      header.toLowerCase() === 'is company'
                        ? 'isCompany'
                        : (header.toLowerCase() as keyof ResPartner)
                    )
                  }
                  className="cursor-pointer"
                >
                  {header} <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                </TableHead>
              ))}

              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {Array.isArray(paginatedPartners) &&
              paginatedPartners.map((partner) => (
                <TableRow key={partner.id}>
                  <TableCell>{partner.name}</TableCell>

                  <TableCell>{partner.companyName || ''}</TableCell>

                  <TableCell>{partner.email}</TableCell>

                  <TableCell>{partner.phone}</TableCell>

                  <TableCell>{partner.type}</TableCell>

                  <TableCell>{partner.isCompany ? 'Yes' : 'No'}</TableCell>

                  <TableCell>{partner.active ? 'Yes' : 'No'}</TableCell>

                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(partner)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
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
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  className={
                    currentPage === 1 ? 'pointer-events-none opacity-50' : ''
                  }
                />
              </PaginationItem>

              {[...Array(totalPages)].map((_, index) => {
                if (
                  index === 0 ||
                  index === totalPages - 1 ||
                  (index >= currentPage - 2 && index <= currentPage + 2)
                ) {
                  return (
                    <PaginationItem key={`page-${index}`}>
                      <PaginationLink
                        onClick={() => setCurrentPage(index + 1)}
                        isActive={currentPage === index + 1}
                      >
                        {index + 1}
                      </PaginationLink>
                    </PaginationItem>
                  )
                } else if (
                  index === currentPage - 3 ||
                  index === currentPage + 3
                ) {
                  return (
                    <PaginationItem key={`ellipsis-${index}`}>
                      <PaginationLink>...</PaginationLink>
                    </PaginationItem>
                  )
                }

                return null
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
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
    </div>
  )
}

