'use client'

import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { CalendarIcon, Plus, Edit } from 'lucide-react'
import { format } from 'date-fns'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
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
  bankAccountSchema,
  createBankAccount,
  editBankAccount,
  getAllBankAccounts,
  BankAccount,
  getAllGlAccounts,
} from '../../../api/bank-accounts-api'
import { useToast } from '@/hooks/use-toast'
import { BANGLADESH_BANKS } from '@/utils/constants'

export default function BankAccounts() {
  // const { user } = useAuthContext()
  // console.log('auth', user)
  const [accounts, setAccounts] = React.useState<BankAccount[]>([])
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingAccount, setEditingAccount] =
    React.useState<BankAccount | null>(null)
  const [userId, setUserId] = React.useState<number | undefined>()
  const { toast } = useToast()
  const [glAccounts, setGlAccounts] = React.useState<
    Array<{
      accountId: string
      name: string
      code: string
      accountType: string
    }>
  >([])

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

  const form = useForm<BankAccount>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: {
      accountName: '',
      accountNumber: '',
      bankName: '',
      currencyId: '',
      accountType: 'Savings',
      openingBalance: 0,
      isActive: true,
      isReconcilable: true,
      createdBy: userId,
      glAccountId: '',
    },
  })

  React.useEffect(() => {
    // console.log('Fetching bank accounts')
    fetchBankAccounts()
  }, [])

  React.useEffect(() => {
    // console.log('Fetching gl accounts')
    fetchGlAccounts()
  }, [])

  React.useEffect(() => {
    console.log('Resetting form', { editingAccount })
    if (editingAccount) {
      form.reset({
        ...editingAccount,
        openingBalance: Number(editingAccount.openingBalance),
        updatedBy: userId,
        glAccountId: editingAccount.glAccountId || '',
      })
    } else {
      form.reset({
        accountName: '',
        accountNumber: '',
        bankName: '',
        currencyId: '',
        accountType: 'Savings',
        openingBalance: 0,
        isActive: true,
        isReconcilable: true,
        createdBy: userId,
        glAccountId: '',
      })
    }
  }, [editingAccount, form, userId])

  async function fetchBankAccounts() {
    const fetchedAccounts = await getAllBankAccounts()
    console.log('Fetched accounts:', fetchedAccounts)
    setAccounts(fetchedAccounts.data)
    if (fetchedAccounts.error || !fetchedAccounts.data) {
      console.error('Error getting bank account:', fetchedAccounts.error)
      toast({
        title: 'Error',
        description:
          fetchedAccounts.error?.message || 'Failed to get bank accounts',
      })
    } else {
      toast({
        title: 'Success',
        description: 'Banks are getting successfully',
      })
    }
  }

  async function fetchGlAccounts() {
    const fetchedGlAccounts = await getAllGlAccounts()
    console.log('Fetched gl accounts:', fetchedGlAccounts)
    
    if (fetchedGlAccounts.error || !fetchedGlAccounts.data) {
      console.error('Error getting gl bank account:', fetchedGlAccounts.error)
      toast({
        title: 'Error',
        description:
          fetchedGlAccounts.error?.message || 'Failed to get gl bank accounts',
      })
    } else {
      setGlAccounts(fetchedGlAccounts.data)
      toast({
        title: 'Success',
        description: 'Banks are getting gl successfully',
      })
    }
  }

  async function onSubmit(values: BankAccount) {
    console.log('Form submitted:', values)
    if (editingAccount) {
      console.log('Editing account:', editingAccount.id)
      const response = await editBankAccount(editingAccount.id!, {
        ...values,
        updatedBy: userId,
      })
      if (response.error || !response.data) {
        console.error('Error editing bank account:', response.error)
        toast({
          title: 'Error',
          description: response.error?.message || 'Failed to edit bank account',
        })
      } else {
        console.log('Account edited successfully')
        toast({
          title: 'Success',
          description: 'Bank account updated successfully',
        })
      }
    } else {
      console.log('Creating new account')
      const response = await createBankAccount(values)
      if (response.error || !response.data) {
        console.error('Error creating bank account:', response.error)
      } else {
        console.log('Account created successfully')
        toast({
          title: 'Success',
          description: 'Bank account created successfully',
        })
      }
    }
    setIsDialogOpen(false)
    setEditingAccount(null)
    form.reset()
    fetchBankAccounts()
  }

  function handleEdit(account: BankAccount) {
    setEditingAccount(account)
    setIsDialogOpen(true)
    console.log(account, 'account')
  }

  console.log('Form state errors:', form.formState.errors)
  // console.log('Form values:', form.getValues())

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Bank Accounts</h1>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) setEditingAccount(null)
          }}
        >
          <DialogTrigger asChild>
            <Button variant="default" className="bg-black hover:bg-black/90">
              <Plus className="mr-2 h-4 w-4" /> Add Bank Account
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAccount ? 'Edit Bank Account' : 'Add New Bank Account'}
              </DialogTitle>
              <DialogDescription>
                {editingAccount
                  ? 'Edit the details for the bank account here.'
                  : 'Enter the details for the new bank account here.'}
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
                      name="accountName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter account name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="accountNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter account number"
                              {...field}
                            />
                          </FormControl>
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
                              {BANGLADESH_BANKS.map((bank) => (
                                <SelectItem key={bank.id} value={bank.name}>
                                  {bank.name}
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
                      name="branchName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Branch Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter branch name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="currencyId"
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
                              <SelectItem value="BDT">BDT</SelectItem>
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="EUR">EUR</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="accountType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select account type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Savings">Savings</SelectItem>
                              <SelectItem value="Current">Current</SelectItem>
                              <SelectItem value="Overdraft">
                                Overdraft
                              </SelectItem>
                              <SelectItem value="Fixed">Fixed</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="openingBalance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Opening Balance</FormLabel>
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
                      name="validityDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Validity Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={'outline'}
                                  className={cn(
                                    'w-full pl-3 text-left font-normal',
                                    !field.value && 'text-muted-foreground'
                                  )}
                                >
                                  {field.value ? (
                                    format(new Date(field.value), 'PPP')
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={
                                  field.value
                                    ? new Date(field.value)
                                    : undefined
                                }
                                onSelect={(date) =>
                                  field.onChange(date?.toISOString())
                                }
                                disabled={(date) =>
                                  date < new Date('1900-01-01')
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex space-x-4 pt-5">
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 w-full">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Active</FormLabel>
                            <FormDescription>
                              Is this bank account active?
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
                      name="isReconcilable"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 w-full">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Reconcilable
                            </FormLabel>
                            <FormDescription>
                              Can this account be reconciled?
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
                      name="glAccountId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GL Account</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select GL Account" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {glAccounts?.map((glaccount) => (
                                <SelectItem
                                  key={glaccount.accountId}
                                  value={glaccount.accountId.toString()}
                                >
                                  {glaccount.name} ({glaccount.code})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter any additional notes"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="sticky bottom-0 bg-background pt-2 pb-4">
                  <Button type="submit" className="w-full">
                    {editingAccount ? 'Update' : 'Submit'}
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
              <TableHead>Account Name</TableHead>
              <TableHead>Account Number</TableHead>
              <TableHead>Bank Name</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Account Type</TableHead>
              <TableHead>Opening Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell>{account.accountName}</TableCell>
                <TableCell>{account.accountNumber}</TableCell>
                <TableCell>{account.bankName}</TableCell>
                <TableCell>{account.currencyId}</TableCell>
                <TableCell>{account.accountType}</TableCell>
                <TableCell>{account.openingBalance}</TableCell>
                <TableCell>
                  {account.isActive ? 'Active' : 'Inactive'}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(account)}
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
