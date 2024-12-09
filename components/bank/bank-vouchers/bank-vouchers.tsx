'use client'

import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import * as z from 'zod'
import { Plus, Trash, Printer, RotateCcw, Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { useRouter } from 'next/navigation'

const voucherItemSchema = z.object({
  accountName: z.string().min(1, 'Account Name is required'),
  costCenter: z.string().min(1, 'Cost Center is required'),
  department: z.string().min(1, 'Department is required'),
  partnerName: z.string().min(1, 'Partner Name is required'),
  remarks: z.string(),
  amount: z.number().min(0, 'Amount must be positive'),
})

const voucherSchema = z.object({
  companyName: z.string().min(1, 'Company Name is required'),
  location: z.string().min(1, 'Location is required'),
  currency: z.string().min(1, 'Currency is required'),
  type: z.enum(['Credit', 'Debit']),
  bankName: z.string().min(1, 'Bank Name is required'),
  date: z.string().min(1, 'Date is required'),
  amount: z.number().min(0, 'Amount must be positive'),
  items: z.array(voucherItemSchema),
})

type Voucher = z.infer<typeof voucherSchema> & {
  id: string
  status: 'Draft' | 'Posted'
}

interface User {
  userId: number
  username: string
  roleId: number
  roleName: string
  // Add other user properties as needed
}

export default function BankVoucher() {
  const [vouchers, setVouchers] = React.useState<Voucher[]>([])
  const [checkUserVouchers, setCheckUserVouchers] = React.useState<Voucher[]>([])
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [amountMismatch, setAmountMismatch] = React.useState(false)
  const [user, setUser] = React.useState<User | null>(null)
  const router = useRouter()

  React.useEffect(() => {
    const userStr = localStorage.getItem('currentUser')
    if (userStr) {
      const userData = JSON.parse(userStr)
      setUser(userData)
      console.log('Current user from localStorage:', userData.voucherTypes)
      
      // Check if 'Bank Voucher' is in the voucherTypes array
      if (!userData.voucherTypes.includes('Bank Voucher')) {
        console.log('User does not have access to Bank Voucher')
        router.push('/unauthorized-access')
      }
    } else {
      console.log('No user data found in localStorage')
      router.push('/unauthorized-access')
    }
  }, [router])

  const form = useForm<z.infer<typeof voucherSchema>>({
    resolver: zodResolver(voucherSchema),
    defaultValues: {
      companyName: '',
      location: '',
      currency: '',
      type: 'Credit',
      bankName: '',
      date: '',
      amount: 0,
      items: [
        {
          accountName: '',
          costCenter: '',
          department: '',
          partnerName: '',
          remarks: '',
          amount: 0,
        },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  React.useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name?.startsWith('items') || name === 'amount') {
        const totalItemsAmount =
          value.items?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0
        setAmountMismatch(totalItemsAmount !== value.amount)
      }
    })
    return () => subscription.unsubscribe()
  }, [form.watch])

  function onSubmit(
    values: z.infer<typeof voucherSchema>,
    status: 'Draft' | 'Posted'
  ) {
    const totalItemsAmount = values.items.reduce(
      (sum, item) => sum + item.amount,
      0
    )
    if (totalItemsAmount !== values.amount) {
      alert(
        'The sum of journal voucher amounts does not match the journal entry amount. Please correct the amounts before submitting.'
      )
      return
    }
    setVouchers([...vouchers, { ...values, id: Date.now().toString(), status }])
    setIsDialogOpen(false)
    form.reset()
  }

  function handleDelete(id: string) {
    setVouchers(vouchers.filter((v) => v.id !== id))
  }

  function handleReverse(id: string) {
    setVouchers(
      vouchers.map((v) => (v.id === id ? { ...v, status: 'Draft' } : v))
    )
  }

  function handlePost(id: string) {
    setVouchers(
      vouchers.map((v) => (v.id === id ? { ...v, status: 'Posted' } : v))
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Bank Vouchers</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                form.reset()
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Voucher
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[1200px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Voucher</DialogTitle>
              <DialogDescription>
                Enter the details for the bank voucher here. Click save when
                you're done.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((values) =>
                  onSubmit(values, 'Draft')
                )}
                className="space-y-8"
              >
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select company" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="company1">Company 1</SelectItem>
                            <SelectItem value="company2">Company 2</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="location1">
                              Location 1
                            </SelectItem>
                            <SelectItem value="location2">
                              Location 2
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
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
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Credit">Credit</SelectItem>
                            <SelectItem value="Debit">Debit</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bankName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Name</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select bank" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="bank1">Bank 1</SelectItem>
                            <SelectItem value="bank2">Bank 2</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            placeholder="mm/dd/yyyy"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* this is journal entry amount  */}
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter amount"
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
                </div>
                <div>
                  <Table className="border">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Account Name</TableHead>
                        <TableHead>Cost Center</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Partner Name</TableHead>
                        <TableHead>Remarks</TableHead>
                        <TableHead>Amount</TableHead>{' '}
                        {/*this is journal voucher amount*/}
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((field, index) => (
                        <TableRow key={field.id}>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`items.${index}.accountName`}
                              render={({ field }) => (
                                <FormItem>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select account" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="account1">
                                        Account 1
                                      </SelectItem>
                                      <SelectItem value="account2">
                                        Account 2
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`items.${index}.costCenter`}
                              render={({ field }) => (
                                <FormItem>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select cost center" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="cc1">
                                        Cost Center 1
                                      </SelectItem>
                                      <SelectItem value="cc2">
                                        Cost Center 2
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`items.${index}.department`}
                              render={({ field }) => (
                                <FormItem>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select department" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="dept1">
                                        Department 1
                                      </SelectItem>
                                      <SelectItem value="dept2">
                                        Department 2
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`items.${index}.partnerName`}
                              render={({ field }) => (
                                <FormItem>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select partner" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="partner1">
                                        Partner 1
                                      </SelectItem>
                                      <SelectItem value="partner2">
                                        Partner 2
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`items.${index}.remarks`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="Enter remarks"
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`items.${index}.amount`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="Enter amount"
                                      {...field}
                                      onChange={(e) =>
                                        field.onChange(
                                          parseFloat(e.target.value)
                                        )
                                      }
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => remove(index)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() =>
                      append({
                        accountName: '',
                        costCenter: '',
                        department: '',
                        partnerName: '',
                        remarks: '',
                        amount: 0,
                      })
                    }
                  >
                    Add Another
                  </Button>
                </div>
                {amountMismatch && (
                  <p className="text-red-500">
                    The sum of journal voucher amounts does not match the
                    journal entry amount.
                  </p>
                )}
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={form.handleSubmit((values) =>
                      onSubmit(values, 'Draft')
                    )}
                  >
                    Save as Draft
                  </Button>
                  <Button
                    onClick={form.handleSubmit((values) =>
                      onSubmit(values, 'Posted')
                    )}
                  >
                    Save as Post
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <Table className="border">
        <TableHeader>
          <TableRow className="border-b">
            <TableHead>Voucher No.</TableHead>
            <TableHead>Company Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Currency</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Bank Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vouchers.map((voucher) => (
            <TableRow key={voucher.id} className="border-b">
              <TableCell className="">{voucher.id}</TableCell>
              <TableCell className="">{voucher.companyName}</TableCell>
              <TableCell className="">{voucher.location}</TableCell>
              <TableCell className="">{voucher.currency}</TableCell>
              <TableCell className="">{voucher.type}</TableCell>
              <TableCell className="">{voucher.bankName}</TableCell>
              <TableCell className="">{voucher.date || 'N/A'}</TableCell>
              <TableCell className="">{voucher.amount}</TableCell>
              <TableCell className="">{voucher.status}</TableCell>
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
                          This action cannot be undone. This will permanently
                          delete the voucher.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(voucher.id)}
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
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will reverse the voucher status to Draft.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleReverse(voucher.id)}
                        >
                          Reverse
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePost(voucher.id)}
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
  )
}
