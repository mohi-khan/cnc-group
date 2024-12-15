'use client'

import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Plus, Edit } from 'lucide-react'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import {
  resPartnerSchema,
  createResPartner,
  editResPartner,
  getAllResPartners,
  getAllCompanies,
  ResPartner,
} from '../../../api/res-partner-api'
import { useToast } from '@/hooks/use-toast'

export default function ResPartners() {
  const [partners, setPartners] = React.useState<ResPartner[]>([])
  const [companies, setCompanies] = React.useState<
    { companyId: number; companyName: string }[]
  >([])
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingPartner, setEditingPartner] = React.useState<ResPartner | null>(
    null
  )
  const [userId, setUserId] = React.useState<number | undefined>()
  const { toast } = useToast()

  const form = useForm<ResPartner>({
    resolver: zodResolver(resPartnerSchema),
    defaultValues: {
      name: '',
      companyId: undefined,
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
    },
  })

  React.useEffect(() => {
    const userStr = localStorage.getItem('currentUser')
    if (userStr) {
      const userData = JSON.parse(userStr)
      setUserId(userData?.userId)
      console.log('Current userId from localStorage:', userData.userId)
    } else {
      console.log('No user data found in localStorage')
    }
  }, [])

  React.useEffect(() => {
    console.log('Fetching res partners and companies')
    fetchResPartners()
    fetchCompanies()
  }, [])

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
        companyId: undefined,
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

  const fetchResPartners = async () => {
    // setIsLoading(true)
    const data = await getAllResPartners()
    console.log('🚀 ~ fetchrespartners ~ data:', data)
    if (data.error || !data.data || !data.data.data) {
      console.error('Error getting res partners:', data.error)
    } else {
      console.log('partner', data)
      setPartners(data.data.data)
    }
    console.log('companies here', companies)
    // setIsLoading(false)
  }

  const fetchCompanies = async () => {
    // setIsLoading(true)
    const data = await getAllCompanies()
    console.log('🚀 ~ fetchCompanies ~ data:', data)
    if (data.error || !data.data) {
      console.error('Error getting companies:', data.error)
    } else {
      console.log('company', data.data)
      setCompanies(data.data)
    }
    console.log('companies here', companies)
    // setIsLoading(false)
  }

  // React.useEffect(() => {
  //   fetchCompanies();
  // }, [companies])

  async function onSubmit(values: ResPartner) {
    console.log('Form submitted:', values)
    if (editingPartner) {
      console.log('Editing partner:', editingPartner.id)
      const response = await editResPartner(editingPartner.id!, {
        ...values,
        updatedBy: userId,
      })
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
      const response = await createResPartner({
        ...values,
        createdBy: userId,
      })
      if (response.error || !response.data) {
        console.error('Error creating res partner:', response.error)
        toast({
          title: 'Error',
          description: response.error?.message || 'Failed to create res partner',
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
  // console.log('Form state errors:', form.formState.errors)
  // console.log('Form values:', form.getValues())

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Res Partners</h1>
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
                      name="companyId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company</FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(Number(value))
                            }
                            value={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select company" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {companies.map((company) => (
                                <SelectItem
                                  key={company.companyId}
                                  value={company.companyId.toString()}
                                >
                                  {company.companyName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="contact">Contact</SelectItem>
                              <SelectItem value="invoice">Invoice</SelectItem>
                              <SelectItem value="delivery">Delivery</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
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
                              placeholder="Enter mobile number"
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
                            <Input placeholder="Enter website" {...field} />
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
                            <Input placeholder="Enter VAT number" {...field} />
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
                                field.onChange(parseFloat(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="customerRank"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer Rank</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="supplierRank"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Supplier Rank</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value))
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
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 w-full">
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
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 w-full">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Active</FormLabel>
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
                <div className="sticky bottom-0 bg-background pt-2 pb-4">
                  <Button type="submit" className="w-full">
                    {editingPartner ? 'Update' : 'Submit'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex flex-col">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Is Company</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.isArray(partners) &&
              partners.map((partner) => (
                <TableRow key={partner.id}>
                  <TableCell>{partner.name}</TableCell>
                  <TableCell>
                    {partner.companyId
                      ? companies.find((c) => c.companyId === partner.companyId)
                          ?.companyName || 'Unknown Company'
                      : ''}
                  </TableCell>
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
      </div>
    </div>
  )
}
