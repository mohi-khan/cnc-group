'use client'
import * as React from 'react'
import {
  Search,
  ChevronRight,
  X,
  Filter,
  Group,
  Star,
  ChevronDown,
  Plus,
  Edit,
  Power,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  type CodeGroup,
  type ChartOfAccount,
  chartOfAccountSchema,
  type CurrencyType,
  type AccountsHead,

} from '@/utils/type'
import {
  createChartOfAccounts,
  getParentCodes,
  updateChartOfAccounts,
} from '@/api/chart-of-accounts-api'
import { toast } from '@/hooks/use-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { CustomCombobox } from '@/utils/custom-combobox'
import { getAllChartOfAccounts, getAllCurrency, getAllCompanies } from '@/api/common-shared-api'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'

const accountTypes = ['Equity', 'Asset', 'Liabilities', 'Income', 'Expense']
const financialTags = [
  'Gross Profit',
  'Operating Profit',
  'Net Profit',
  'Asset',
  'Liablities',
  'Quick Asset',
  'Quick Liabilities',
]
const cashTags = [
  'Advance Payments received from customers',
  'Cash received from operating activities',
  'Advance payments made to suppliers',
  'Cash paid for operating activities',
  'Cash flows from investing & extraordinary activities',
  'Cash flows from financing activities',
]

// Type definition for Company (fallback if not in @/utils/type)
type CompanyTypeLocal = {
  companyId: number
  companyName: string
}

export default function ChartOfAccountsTable() {
  //getting userData from jotai atom component
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)
  const router = useRouter()

  // State variables
  const [searchTerm, setSearchTerm] = React.useState('')
  const [selectedTypes, setSelectedTypes] = React.useState<string[]>([])
  const [showFilters, setShowFilters] = React.useState(false)
  const [activeAccountOnly, setActiveAccountOnly] = React.useState(false)
  const [accounts, setAccounts] = React.useState<AccountsHead[]>([])
  const [filteredAccounts, setFilteredAccounts] = React.useState<
    AccountsHead[]
  >([])
  const [selectedCode, setSelectedCode] = React.useState<string | null>(null)
  const [groups, setGroups] = React.useState<CodeGroup[]>([])
  const [isAddAccountOpen, setIsAddAccountOpen] = React.useState(false)
  const [isEditAccountOpen, setIsEditAccountOpen] = React.useState(false)
  const [editingAccount, setEditingAccount] =
    React.useState<AccountsHead | null>(null)
  const [parentCodes, setParentCodes] = React.useState<ChartOfAccount[]>([])
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 10
  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage)
  const [userId, setUserId] = React.useState<number | null>(null)
  const [currency, setCurrency] = React.useState<CurrencyType[]>([])
  const [companies, setCompanies] = React.useState<any[]>([])
  const [selectedCompanies, setSelectedCompanies] = React.useState<number[]>([])

  // Reset to page 1 when search term, filters, or selected code changes
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedTypes, activeAccountOnly, selectedCode])

  // Function to build dynamic code groups from accounts data
  const buildCodeGroups = React.useCallback(
    (accountsData: AccountsHead[]): CodeGroup[] => {
      const codeMap = new Map<string, CodeGroup>()

      // Sort accounts by code to ensure proper hierarchy
      const sortedAccounts = [...accountsData].sort((a, b) =>
        a.code.localeCompare(b.code)
      )

      sortedAccounts.forEach((account) => {
        const code = account.code

        // Determine if this is a parent code (single digit) or child code
        if (code.length === 1) {
          // This is a main group (parent)
          if (!codeMap.has(code)) {
            codeMap.set(code, {
              id: code,
              code: code,
              isExpanded: false,
              subgroups: [],
            })
          }
        } else if (code.length === 2) {
          // This is a subgroup
          const parentCode = code.charAt(0)

          // Ensure parent exists
          if (!codeMap.has(parentCode)) {
            codeMap.set(parentCode, {
              id: parentCode,
              code: parentCode,
              isExpanded: false,
              subgroups: [],
            })
          }

          const parentGroup = codeMap.get(parentCode)!

          // Add subgroup if it doesn't exist
          const existingSubgroup = parentGroup.subgroups?.find(
            (sub) => sub.code === code
          )
          if (!existingSubgroup) {
            parentGroup.subgroups?.push({
              id: code,
              code: code,
            })
          }
        } else if (code.length > 2) {
          // Handle deeper nesting if needed
          const parentCode = code.substring(0, 2)
          const grandParentCode = code.charAt(0)

          // Ensure grandparent exists
          if (!codeMap.has(grandParentCode)) {
            codeMap.set(grandParentCode, {
              id: grandParentCode,
              code: grandParentCode,
              isExpanded: false,
              subgroups: [],
            })
          }

          const grandParentGroup = codeMap.get(grandParentCode)!

          // Ensure parent exists in subgroups
          let parentGroup = grandParentGroup.subgroups?.find(
            (sub) => sub.code === parentCode
          )
          if (!parentGroup) {
            parentGroup = {
              id: parentCode,
              code: parentCode,
              isExpanded: false,
              subgroups: [],
            }
            grandParentGroup.subgroups?.push(parentGroup)
          }

          // Add the current account as a subgroup
          const existingSubgroup = parentGroup.subgroups?.find(
            (sub) => sub.code === code
          )
          if (!existingSubgroup) {
            if (!parentGroup.subgroups) {
              parentGroup.subgroups = []
            }
            parentGroup.subgroups.push({
              id: code,
              code: code,
            })
          }
        }
      })

      // Convert map to array and sort by code
      return Array.from(codeMap.values()).sort((a, b) =>
        a.code.localeCompare(b.code)
      )
    },
    []
  )

  React.useEffect(() => {
    const checkUserData = () => {
      const storedUserData = localStorage.getItem('currentUser')
      const storedToken = localStorage.getItem('authToken')
      if (!storedUserData || !storedToken) {
        router.push('/')
        return
      }
    }
    checkUserData()
    if (userData) {
      setUserId(userData.userId)
    }
  }, [userData, router])

  // Dynamically update defaultValues based on userId
  const form = useForm<ChartOfAccount>({
    resolver: zodResolver(chartOfAccountSchema),
    defaultValues: {
      name: '',
      accountType: '',
      parentAccountId: undefined,
      currencyId: 1,
      isReconcilable: false,
      withholdingTax: false,
      budgetTracking: false,
      isActive: true,
      isGroup: false,
      isCash: false,
      isBank: false,
      isPartner: false,
      isCostCenter: false,
      createdBy: userData ? userData.userId : 0,
      notes: null,
      cashTag: null,
      code: '',
      companyIds: [],
    },
  })

  // Optionally, useEffect to update form when `userId` changes
  React.useEffect(() => {
    if (userId !== null) {
      form.setValue('createdBy', userId)
    }
  }, [userId, form])

  // code generate
  const generateAccountCode = React.useCallback(
    async (parentAccountId: number): Promise<string> => {
      // Convert parentAccountId to string for code comparison
      const parentCode = parentAccountId.toString()
      const childCount = filteredAccounts.filter(
        (account) =>
          account.code.startsWith(parentCode) && account.code !== parentCode
      ).length
      const newCode = `${parentCode}${(childCount + 1).toString().padStart(2, '0')}`
      return newCode
    },
    [filteredAccounts]
  )

  //Add accounts
  const handleAddAccount = async (data: ChartOfAccount) => {
    if (data.parentAccountId) {
      // Ensure parentAccountId is a number
      const parentAccountId =
        typeof data.parentAccountId === 'string'
          ? Number.parseInt(data.parentAccountId, 10)
          : data.parentAccountId
      data.code = await generateAccountCode(parentAccountId)
    }
    const response = await createChartOfAccounts(data, token)

    if (response.error || !response.data) {
      console.error('Error creating chart of accounts:', response.error)
    } else {
      toast({
        title: 'Success',
        description: 'Chart Of account created successfully',
      })
      form.reset()
      fetchCoaAccounts()
      setIsAddAccountOpen(false)
      setCurrentPage(1) // Reset to first page after create
    }
  }

  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'parentAccountId' && value.parentAccountId) {
        generateAccountCode(value.parentAccountId).then((newCode) => {
          form.setValue('code', newCode)
        })
      }
    })
    return () => subscription.unsubscribe()
  }, [form, generateAccountCode])

  const fetchParentCodes = React.useCallback(async () => {
    if (!token) return
    const fetchedParentCodes = await getParentCodes(token)

    if (fetchedParentCodes.error || !fetchedParentCodes.data) {
      console.error('Error fetching parent codes:', fetchedParentCodes.error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          fetchedParentCodes.error?.message || 'Failed to fetch parent codes',
      })
    } else {
      setParentCodes(fetchedParentCodes.data)
      console.log(fetchedParentCodes.data)
    }
  }, [token])

  // get all currency api
  const fetchCurrency = React.useCallback(async () => {
    if (!token) return
    const fetchedCurrency = await getAllCurrency(token)

    if (fetchedCurrency.error || !fetchedCurrency.data) {
      console.error('Error getting currency:', fetchedCurrency.error)
      toast({
        title: 'Error',
        description: fetchedCurrency.error?.message || 'Failed to get currency',
      })
    } else {
      setCurrency(fetchedCurrency.data)
    }
  }, [token])

  // get all companies api
  const fetchCompanies = React.useCallback(async () => {
    if (!token) return
    const fetchedCompanies = await getAllCompanies(token)

    if (fetchedCompanies.error || !fetchedCompanies.data) {
      console.error('Error getting companies:', fetchedCompanies.error)
      toast({
        title: 'Error',
        description: fetchedCompanies.error?.message || 'Failed to get companies',
      })
    } else {
      setCompanies(fetchedCompanies.data)
    }
  }, [token])

  const fetchCoaAccounts = React.useCallback(async () => {
    if (!token) return
    const fetchedAccounts = await getAllChartOfAccounts(token)

    if (fetchedAccounts?.error?.status === 401) {
      router.push('/unauthorized-access')
      return
    } else if (fetchedAccounts.error || !fetchedAccounts.data) {
      console.error('Error fetching chart of accounts:', fetchedAccounts.error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          fetchedAccounts.error?.message || 'Failed to fetch chart of accounts',
      })
    } else {
      setAccounts(fetchedAccounts.data)
      console.log('all chart of account data: ', fetchedAccounts.data)
      // Build dynamic code groups when accounts are fetched
      const dynamicGroups = buildCodeGroups(fetchedAccounts.data)
      setGroups(dynamicGroups)
    }
  }, [token, router, buildCodeGroups])

  React.useEffect(() => {
    fetchCoaAccounts()
    fetchParentCodes()
    fetchCurrency()
    fetchCompanies()
  }, [fetchCoaAccounts, fetchParentCodes, fetchCurrency, fetchCompanies, router])

  // Update code groups when accounts change
  React.useEffect(() => {
    if (accounts.length > 0) {
      const dynamicGroups = buildCodeGroups(accounts)
      setGroups(dynamicGroups)
    }
  }, [accounts, buildCodeGroups])

  // Filter accounts based on search term, selected types, and active accounts
  React.useEffect(() => {
    let filtered = accounts.filter(
      (account) =>
        (account.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          account.accountType
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) &&
        (selectedTypes.length === 0 ||
          selectedTypes.includes(account.accountType)) &&
        (selectedCode ? account.code.startsWith(selectedCode) : true)
    )
    if (activeAccountOnly) {
      filtered = filtered.filter((account) => account.isReconcilable)
      filtered = filtered.filter((account) => account.isCash)
    }
    setFilteredAccounts(filtered)
  }, [searchTerm, selectedTypes, activeAccountOnly, selectedCode, accounts])

  const removeFilter = (filter: string) => {
    setSelectedTypes(selectedTypes.filter((type) => type !== filter))
  }

  const handleSwitchChange = (code: string, checked: boolean) => {
    setAccounts((prevAccounts) =>
      prevAccounts.map((account) =>
        account.code === code
          ? { ...account, isReconcilable: checked }
          : account
      )
    )
  }

  const toggleGroup = (groupId: string) => {
    setGroups((prevGroups) => {
      const updateGroup = (group: CodeGroup): CodeGroup => {
        if (group.id === groupId) {
          return { ...group, isExpanded: !group.isExpanded }
        }
        if (group.subgroups) {
          return { ...group, subgroups: group.subgroups.map(updateGroup) }
        }
        return group
      }

      return prevGroups.map(updateGroup)
    })
  }

  // this is side bar search by code
  const renderCodeGroups = (groups: CodeGroup[]) => {
    return groups.map((group) => (
      <div key={group.id} className="space-y-1">
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start gap-2 font-bold border-2 shadow-md border-hidden',
            selectedCode === group.code && 'bg-muted'
          )}
          onClick={() => {
            if (group.subgroups && group.subgroups.length > 0) {
              toggleGroup(group.id)
            } else {
              setSelectedCode(group.code)
            }
          }}
          title={`Code ${group.code}`}
        >
          {group.subgroups && group.subgroups.length > 0 && (
            <ChevronRight
              className={cn(
                'h-4 w-4 shrink-0 transition-transform ',
                group.isExpanded && 'rotate-90'
              )}
            />
          )}
          <span>{group.code}</span>
          {
            <span className="text-xs text-muted-foreground truncate ml-1"></span>
          }
        </Button>
        {group.isExpanded && group.subgroups && group.subgroups.length > 0 && (
          <div className="pl-4 ml-6">{renderCodeGroups(group.subgroups)}</div>
        )}
      </div>
    ))
  }

  // Edit accounts function open dialog box
  const handleEditAccount = (account: AccountsHead) => {
    setEditingAccount({
      ...account,
      name: account.name,
      notes: account.notes,
      isReconcilable: account.isReconcilable,
    })
    setIsEditAccountOpen(true)
  }

  // disable account and enable account function with api
  const handleDisableAccount = async (code: string) => {
    // Find the account to update
    const accountToUpdate = accounts.find((account) => account.code === code)
    if (accountToUpdate) {
      // Toggle the isActive status
      const updatedAccount = {
        ...accountToUpdate,
        isActive: !accountToUpdate.isActive,
      }
      // API request to update the account
      const response = await updateChartOfAccounts(updatedAccount, token)
      if (response.error || !response.data) {
        console.error('Error updating chart of accounts:', response.error)
        toast({
          variant: 'destructive',
          title: 'Error',
          description:
            response.error?.message || 'Failed to update chart of account',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Chart Of account updated successfully',
        })
        // Update the accounts state
        setAccounts((prevAccounts) =>
          prevAccounts.map((account) =>
            account.code === updatedAccount.code ? updatedAccount : account
          )
        )
      }
    }
  }

  // save edit account function
  const handleSaveEdit = async (data: Partial<ChartOfAccount>) => {
    if (editingAccount) {
      const updatedAccount = {
        ...editingAccount,
        name: data.name || editingAccount.name,
        notes: data.notes || editingAccount.notes,
        isReconcilable:
          data.isReconcilable !== undefined
            ? data.isReconcilable
            : editingAccount.isReconcilable,
      }
      const response = await updateChartOfAccounts(updatedAccount, token)
      if (response.error || !response.data) {
        console.error('Error updating chart of accounts:', response.error)
        toast({
          variant: 'destructive',
          title: 'Error',
          description:
            response.error?.message || 'Failed to update chart of account',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Chart Of account updated successfully',
        })
        setAccounts((prevAccounts) =>
          prevAccounts.map((account) =>
            account.code === updatedAccount.code ? updatedAccount : account
          )
        )
      }
      setIsEditAccountOpen(false)
      setEditingAccount(null)
    }
  }

  // return function for chart of accounts
  return (
    <div className="flex flex-col ">
      <div className="p-2">
        <div className="sticky top-28 bg-white flex items-center justify-between gap-4 border-b-2  shadow-md p-2 z-20">
          <h2 className="text-xl font-semibold">Chart of Accounts</h2>
          <div className="flex items-center gap-2 flex-grow justify-center max-w-2xl">
            <div className="relative flex items-center border rounded-md pr-2 flex-grow">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground gap-2" />
              <Input
                placeholder="Search..."
                className="pl-8 pr-8 border-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <X
                  className="absolute right-0 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground"
                  onClick={() => setSearchTerm('')}
                />
              )}
              <div className="mx-2 flex gap-1 ">
                {selectedTypes.map((type) => (
                  <Badge
                    key={type}
                    variant="secondary"
                    className="gap-1 px-2 py-1 ring-1 whitespace-nowrap"
                  >
                    {type}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeFilter(type)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          {/* Add account  */}
          <Dialog
            open={isAddAccountOpen}
            onOpenChange={(open) => {
              fetchCoaAccounts()
              if (!open) {
                form.reset()
                setSelectedCompanies([])
              }
              setIsAddAccountOpen(open)
              fetchParentCodes()
            }}
          >
            <DialogTrigger asChild>
              <Button variant="default" size="lg" className="whitespace-nowrap">
                <Plus className="h-4 w-4 mr-2" />
                ADD
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Account</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleAddAccount)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Name</FormLabel>
                        <span className="text-red-500">*</span>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter account name"
                            className="focus:ring-2 focus:ring-primary focus:border-primary"
                          />
                        </FormControl>
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
                        <span className="text-red-500">*</span>
                        <CustomCombobox
                          items={accountTypes.map((type) => ({
                            id: type.toLowerCase(),
                            name: type,
                          }))}
                          value={
                            field.value
                              ? {
                                  id: field.value,
                                  name:
                                    accountTypes.find(
                                      (type) =>
                                        type.toLowerCase() === field.value
                                    ) || 'Select account type',
                                }
                              : null
                          }
                          onChange={(
                            value: { id: string; name: string } | null
                          ) => field.onChange(value ? value.id : null)}
                          placeholder="Select account type"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cashTag"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Cash Tag</FormLabel>
                        <CustomCombobox
                          items={cashTags.map((tag) => ({
                            id: tag.toLowerCase(),
                            name: tag,
                          }))}
                          value={
                            field.value
                              ? {
                                  id: field.value.toLowerCase(),
                                  name:
                                    cashTags.find(
                                      (tag) => tag.toLowerCase() === field.value
                                    ) || 'Select Cash Tag',
                                }
                              : null
                          }
                          onChange={(
                            value: { id: string; name: string } | null
                          ) => {
                            field.onChange(value ? value.id : null)
                          }}
                          placeholder="Select Cash Tag"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="parentAccountId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Parent Account Name
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <CustomCombobox
                          items={parentCodes.map((account: ChartOfAccount) => ({
                            id: account.code.toString(),
                            name: account.name || 'Unnamed Account',
                          }))}
                          value={
                            field.value
                              ? {
                                  id: field.value.toString(),
                                  name:
                                    parentCodes.find(
                                      (acc) =>
                                        acc.code.toString() ===
                                        field.value.toString()
                                    )?.name || 'Select Parent Account',
                                }
                              : null
                          }
                          onChange={(value) =>
                            field.onChange(value ? Number(value.id) : undefined)
                          }
                          placeholder="Select Parent Account"
                        />
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
                        <CustomCombobox
                          items={currency.map((curr: CurrencyType) => ({
                            id: curr.currencyId.toString(),
                            name: curr.currencyCode || 'Unnamed Currency',
                          }))}
                          value={
                            field.value
                              ? {
                                  id: field.value.toString(),
                                  name:
                                    currency.find(
                                      (curr: CurrencyType) =>
                                        curr.currencyId === field.value
                                    )?.currencyCode || 'Unnamed Currency',
                                }
                              : null
                          }
                          onChange={(
                            value: { id: string; name: string } | null
                          ) =>
                            field.onChange(
                              value ? Number.parseInt(value.id, 10) : null
                            )
                          }
                          placeholder="Select currency"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="companyIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Companies (Optional)</FormLabel>
                        <FormDescription>
                          Select one or more companies. Leave empty to create for all companies.
                        </FormDescription>
                        <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
                          {companies.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No companies available</p>
                          ) : (
                            companies.map((company) => (
                              <div key={company.companyId} className="flex items-center space-x-2">
                                <Checkbox
                                  checked={field.value?.includes(company.companyId) || false}
                                  onCheckedChange={(checked) => {
                                    const currentValues = field.value || []
                                    if (checked) {
                                      field.onChange([...currentValues, company.companyId])
                                    } else {
                                      field.onChange(
                                        currentValues.filter((id) => id !== company.companyId)
                                      )
                                    }
                                  }}
                                />
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                  {company.companyName || `Company ${company.companyId}`}
                                </label>
                              </div>
                            ))
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Financial Tag</FormLabel>
                        <CustomCombobox
                          items={financialTags.map((tag) => ({
                            id: tag.toLowerCase(),
                            name: tag,
                          }))}
                          value={
                            field.value
                              ? {
                                  id: field.value.toLowerCase(),
                                  name: field.value,
                                }
                              : null
                          }
                          onChange={(
                            value: { id: string; name: string } | null
                          ) => {
                            field.onChange(value ? value.id : null)
                          }}
                          placeholder="Select financial tag"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isReconcilable"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 focus-within:ring-1 focus-within:ring-black focus-within:ring-offset-2 focus-within:rounded-md">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            onKeyDown={(e) => {
                              if (e.key === ' ' || e.key === 'Enter') {
                                e.preventDefault()
                                field.onChange(!field.value)
                              }
                            }}
                            tabIndex={0}
                            title="Press Space or Enter to toggle"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Is Reconcilable</FormLabel>
                          <FormDescription>
                            Check if this account can be reconciled
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="withholdingTax"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 focus-within:ring-1 focus-within:ring-black focus-within:ring-offset-2 focus-within:rounded-md">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            onKeyDown={(e) => {
                              if (e.key === ' ' || e.key === 'Enter') {
                                e.preventDefault()
                                field.onChange(!field.value)
                              }
                            }}
                            tabIndex={0}
                            title="Press Space or Enter to toggle"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Accounts Receivable/Payable</FormLabel>
                          <FormDescription>
                            Check if this account is subject to Accounts
                            Receivable/Payable
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="budgetTracking"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 focus-within:ring-1 focus-within:ring-black focus-within:ring-offset-2 focus-within:rounded-md">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            onKeyDown={(e) => {
                              if (e.key === ' ' || e.key === 'Enter') {
                                e.preventDefault()
                                field.onChange(!field.value)
                              }
                            }}
                            tabIndex={0}
                            title="Press Space or Enter to toggle"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Budget Tracking</FormLabel>
                          <FormDescription>
                            Check if this account should be included in budget
                            tracking
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 focus-within:ring-1 focus-within:ring-black focus-within:ring-offset-2 focus-within:rounded-md">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            onKeyDown={(e) => {
                              if (e.key === ' ' || e.key === 'Enter') {
                                e.preventDefault()
                                field.onChange(!field.value)
                              }
                            }}
                            tabIndex={0}
                            title="Press Space or Enter to toggle"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Is Active</FormLabel>
                          <FormDescription>
                            Uncheck to deactivate this account
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isGroup"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 focus-within:ring-1 focus-within:ring-black focus-within:ring-offset-2 focus-within:rounded-md">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            onKeyDown={(e) => {
                              if (e.key === ' ' || e.key === 'Enter') {
                                e.preventDefault()
                                field.onChange(!field.value)
                              }
                            }}
                            tabIndex={0}
                            title="Press Space or Enter to toggle"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Is Group</FormLabel>
                          <FormDescription>
                            Check if this is a group account
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isPartner"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 focus-within:ring-1 focus-within:ring-black focus-within:ring-offset-2 focus-within:rounded-md">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            onKeyDown={(e) => {
                              if (e.key === ' ' || e.key === 'Enter') {
                                e.preventDefault()
                                field.onChange(!field.value)
                              }
                            }}
                            tabIndex={0}
                            title="Press Space or Enter to toggle"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Is Partner</FormLabel>
                          <FormDescription>
                            Check if this is a partner account
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isCostCenter"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 focus-within:ring-1 focus-within:ring-black focus-within:ring-offset-2 focus-within:rounded-md">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            onKeyDown={(e) => {
                              if (e.key === ' ' || e.key === 'Enter') {
                                e.preventDefault()
                                field.onChange(!field.value)
                              }
                            }}
                            tabIndex={0}
                            title="Press Space or Enter to toggle"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Is Cost Center</FormLabel>
                          <FormDescription>
                            Check if this is a cost center account
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        e.currentTarget.click()
                      }
                    }}
                    tabIndex={0}
                  >
                    Create Account
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex mb">
          <div className="fixed w-64 border-r bg-muted/50 ml-4 space-y-2 overflow-y-scroll h-[calc(100vh-200px)] ">
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start font-bold',
                !selectedCode && 'bg-muted'
              )}
              onClick={() => setSelectedCode(null)}
            >
              All
            </Button>
            {renderCodeGroups(groups)}
          </div>
          <div className="ml-64 flex-1 pl-4 ">
            {showFilters && (
              <div className="sticky top-36 grid grid-cols-3 gap-4 mb-4 p-4 border rounded-lg bg-white shadow-2xl lg:mx-52 z-20 ">
                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                  </h3>
                  <div className="space-y-2">
                    {accountTypes.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          checked={selectedTypes.includes(type)}
                          onCheckedChange={(checked: boolean) => {
                            setSelectedTypes(
                              checked
                                ? [...selectedTypes, type]
                                : selectedTypes.filter((t) => t !== type)
                            )
                          }}
                        />
                        <label>{type}</label>
                      </div>
                    ))}
                    <div className="flex items-center space-x-2 mt-4">
                      <Checkbox
                        checked={activeAccountOnly}
                        onCheckedChange={(checked) =>
                          setActiveAccountOnly(checked as boolean)
                        }
                      />
                      <label>Active Account</label>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Group className="h-4 w-4" />
                    Group By
                  </h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between bg-transparent"
                      >
                        Account Type
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem>Account Type</DropdownMenuItem>
                      <DropdownMenuItem>Add Custom Group</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Favorites
                  </h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between bg-transparent"
                      >
                        Save current search
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem>Chart of Accounts</DropdownMenuItem>
                      <DropdownMenuItem>Save current search</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )}
            {/* Table header and data */}
            <div className=" border rounded-md overflow-hidden">
              <div className="overflow-auto max-h-[calc(100vh-200px)]">
                <Table>
                  <TableHeader className="sticky top-0 bg-[#e0e0e0] z-10">
                    <TableRow className="">
                      <TableHead className="w-[100px]">Code</TableHead>
                      <TableHead>Account Name</TableHead>
                      <TableHead>Parent Account Name</TableHead>
                      <TableHead className="capitalize">Type</TableHead>
                      <TableHead className="text-center">
                        Allow Reconciliation
                      </TableHead>
                      <TableHead className="w-[200px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAccounts
                      .slice(
                        (currentPage - 1) * itemsPerPage,
                        currentPage * itemsPerPage
                      )
                      .map((account) => (
                        <TableRow key={account.code}>
                          <TableCell>{account.code}</TableCell>
                          <TableCell>{account.name}</TableCell>
                          <TableCell>{account.parentName}</TableCell>
                          <TableCell>{account.accountType}</TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={account.isReconcilable}
                              onChange={(checked: any) =>
                                handleSwitchChange(account.code, checked)
                              }
                              id={`switch-${account.code}`}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditAccount(account)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                              <Button
                                variant={
                                  account.isActive ? 'destructive' : 'outline'
                                }
                                size="sm"
                                onClick={() =>
                                  handleDisableAccount(account.code)
                                }
                              >
                                <Power className="h-4 w-4 mr-2" />
                                {account.isActive ? 'Disable' : 'Enable'}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
                <div className="flex justify-center mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          className={
                            currentPage === 1
                              ? 'pointer-events-none opacity-50'
                              : ''
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
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            )
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
            {/* Edit Form */}
          </div>
        </div>
      </div>
      {/* Edit Chart Of Accounts */}
      <Dialog open={isEditAccountOpen} onOpenChange={setIsEditAccountOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
          </DialogHeader>
          {editingAccount && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                handleSaveEdit(editingAccount)
              }}
            >
              <div className="spacey-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <CustomCombobox
                  items={financialTags.map((tag) => ({
                    id: tag.toLowerCase(),
                    name: tag,
                  }))}
                  value={
                    editingAccount.notes
                      ? {
                          id: editingAccount.notes.toLowerCase(),
                          name: editingAccount.notes,
                        }
                      : null
                  }
                  onChange={(value: { id: string; name: string } | null) => {
                    setEditingAccount({
                      ...editingAccount,
                      notes: value ? value.name : '',
                    })
                  }}
                  placeholder="Select financial tag"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-name">Account Name</Label>
                <Input
                  id="edit-name"
                  value={editingAccount.name}
                  onChange={(e) =>
                    setEditingAccount({
                      ...editingAccount,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-isReconcilable"
                  checked={editingAccount.isReconcilable}
                  onCheckedChange={(checked) =>
                    setEditingAccount({
                      ...editingAccount,
                      isReconcilable: checked as boolean,
                    })
                  }
                />
                <Label htmlFor="edit-isReconcilable">
                  Allow Reconciliation
                </Label>
              </div>
              <Button type="submit" className="w-full">
                Save Changes
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}



// 'use client'
// import * as React from 'react'
// import {
//   Search,
//   ChevronRight,
//   X,
//   Filter,
//   Group,
//   Star,
//   ChevronDown,
//   Plus,
//   Edit,
//   Power,
// } from 'lucide-react'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Switch } from '@/components/ui/switch'
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table'
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu'
// import { Checkbox } from '@/components/ui/checkbox'
// import { Badge } from '@/components/ui/badge'
// import { cn } from '@/lib/utils'
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from '@/components/ui/dialog'
// import { Label } from '@/components/ui/label'
// import { useForm } from 'react-hook-form'
// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from '@/components/ui/form'
// import {
//   type CodeGroup,
//   type ChartOfAccount,
//   chartOfAccountSchema,
//   type CurrencyType,
//   type AccountsHead,
// } from '@/utils/type'
// import {
//   createChartOfAccounts,
//   getParentCodes,
//   updateChartOfAccounts,
// } from '@/api/chart-of-accounts-api'
// import { toast } from '@/hooks/use-toast'
// import { zodResolver } from '@hookform/resolvers/zod'
// import {
//   Pagination,
//   PaginationContent,
//   PaginationItem,
//   PaginationLink,
//   PaginationNext,
//   PaginationPrevious,
// } from '@/components/ui/pagination'
// import { CustomCombobox } from '@/utils/custom-combobox'
// import { getAllChartOfAccounts, getAllCurrency } from '@/api/common-shared-api'
// import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
// import { useAtom } from 'jotai'
// import { useRouter } from 'next/navigation'

// const accountTypes = ['Equity', 'Asset', 'Liabilities', 'Income', 'Expense']
// const financialTags = [
//   'Gross Profit',
//   'Operating Profit',
//   'Net Profit',
//   'Asset',
//   'Liablities',
// ]
// const cashTags = [
//   'Advance Payments received from customers',
//   'Cash received from operating activities',
//   'Advance payments made to suppliers',
//   'Cash paid for operating activities',
//   'Cash flows from investing & extraordinary activities',
//   'Cash flows from financing activities',
// ]

// export default function ChartOfAccountsTable() {
//   //getting userData from jotai atom component
//   useInitializeUser()
//   const [userData] = useAtom(userDataAtom)
//   const [token] = useAtom(tokenAtom)
//   const router = useRouter()

//   // State variables
//   const [searchTerm, setSearchTerm] = React.useState('')
//   const [selectedTypes, setSelectedTypes] = React.useState<string[]>([])
//   const [showFilters, setShowFilters] = React.useState(false)
//   const [activeAccountOnly, setActiveAccountOnly] = React.useState(false)
//   const [accounts, setAccounts] = React.useState<AccountsHead[]>([])
//   const [filteredAccounts, setFilteredAccounts] = React.useState<
//     AccountsHead[]
//   >([])
//   const [selectedCode, setSelectedCode] = React.useState<string | null>(null)
//   const [groups, setGroups] = React.useState<CodeGroup[]>([])
//   const [isAddAccountOpen, setIsAddAccountOpen] = React.useState(false)
//   const [isEditAccountOpen, setIsEditAccountOpen] = React.useState(false)
//   const [editingAccount, setEditingAccount] =
//     React.useState<AccountsHead | null>(null)
//   const [parentCodes, setParentCodes] = React.useState<ChartOfAccount[]>([])
//   const [currentPage, setCurrentPage] = React.useState(1)
//   const itemsPerPage = 10
//   const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage)
//   const [userId, setUserId] = React.useState<number | null>(null)
//   const [currency, setCurrency] = React.useState<CurrencyType[]>([])

//   // Reset to page 1 when search term, filters, or selected code changes
//   React.useEffect(() => {
//     setCurrentPage(1)
//   }, [searchTerm, selectedTypes, activeAccountOnly, selectedCode])

//   // Function to build dynamic code groups from accounts data
//   const buildCodeGroups = React.useCallback(
//     (accountsData: AccountsHead[]): CodeGroup[] => {
//       const codeMap = new Map<string, CodeGroup>()

//       // Sort accounts by code to ensure proper hierarchy
//       const sortedAccounts = [...accountsData].sort((a, b) =>
//         a.code.localeCompare(b.code)
//       )

//       sortedAccounts.forEach((account) => {
//         const code = account.code

//         // Determine if this is a parent code (single digit) or child code
//         if (code.length === 1) {
//           // This is a main group (parent)
//           if (!codeMap.has(code)) {
//             codeMap.set(code, {
//               id: code,
//               code: code,
//               isExpanded: false,
//               subgroups: [],
//             })
//           }
//         } else if (code.length === 2) {
//           // This is a subgroup
//           const parentCode = code.charAt(0)

//           // Ensure parent exists
//           if (!codeMap.has(parentCode)) {
//             codeMap.set(parentCode, {
//               id: parentCode,
//               code: parentCode,
//               isExpanded: false,
//               subgroups: [],
//             })
//           }

//           const parentGroup = codeMap.get(parentCode)!

//           // Add subgroup if it doesn't exist
//           const existingSubgroup = parentGroup.subgroups?.find(
//             (sub) => sub.code === code
//           )
//           if (!existingSubgroup) {
//             parentGroup.subgroups?.push({
//               id: code,
//               code: code,
//             })
//           }
//         } else if (code.length > 2) {
//           // Handle deeper nesting if needed
//           const parentCode = code.substring(0, 2)
//           const grandParentCode = code.charAt(0)

//           // Ensure grandparent exists
//           if (!codeMap.has(grandParentCode)) {
//             codeMap.set(grandParentCode, {
//               id: grandParentCode,
//               code: grandParentCode,
//               isExpanded: false,
//               subgroups: [],
//             })
//           }

//           const grandParentGroup = codeMap.get(grandParentCode)!

//           // Ensure parent exists in subgroups
//           let parentGroup = grandParentGroup.subgroups?.find(
//             (sub) => sub.code === parentCode
//           )
//           if (!parentGroup) {
//             parentGroup = {
//               id: parentCode,
//               code: parentCode,
//               isExpanded: false,
//               subgroups: [],
//             }
//             grandParentGroup.subgroups?.push(parentGroup)
//           }

//           // Add the current account as a subgroup
//           const existingSubgroup = parentGroup.subgroups?.find(
//             (sub) => sub.code === code
//           )
//           if (!existingSubgroup) {
//             if (!parentGroup.subgroups) {
//               parentGroup.subgroups = []
//             }
//             parentGroup.subgroups.push({
//               id: code,
//               code: code,
//             })
//           }
//         }
//       })

//       // Convert map to array and sort by code
//       return Array.from(codeMap.values()).sort((a, b) =>
//         a.code.localeCompare(b.code)
//       )
//     },
//     []
//   )

//   React.useEffect(() => {
//     const checkUserData = () => {
//       const storedUserData = localStorage.getItem('currentUser')
//       const storedToken = localStorage.getItem('authToken')
//       if (!storedUserData || !storedToken) {
//         router.push('/')
//         return
//       }
//     }
//     checkUserData()
//     if (userData) {
//       setUserId(userData.userId)
//     } else {
//     }
//   }, [userData, router])

//   // Dynamically update defaultValues based on userId
//   const form = useForm<ChartOfAccount>({
//     resolver: zodResolver(chartOfAccountSchema),
//     defaultValues: {
//       name: '',
//       accountType: '',
//       parentAccountId: undefined,
//       currencyId: 1,
//       isReconcilable: false,
//       withholdingTax: false,
//       budgetTracking: false,
//       isActive: true,
//       isGroup: false,
//       isCash: false,
//       isBank: false,
//       isPartner: false,
//       isCostCenter: false,
//       createdBy: userData ? userData.userId : 0,
//       notes: null,
//       cashTag: null,
//       code: '',
//     },
//   })

//   // Optionally, useEffect to update form when `userId` changes
//   React.useEffect(() => {
//     if (userId !== null) {
//       form.setValue('createdBy', userId)
//     }
//   }, [userId, form])

//   // code generate
//   const generateAccountCode = React.useCallback(
//     async (parentAccountId: number): Promise<string> => {
//       // Convert parentAccountId to string for code comparison
//       const parentCode = parentAccountId.toString()
//       const childCount = filteredAccounts.filter(
//         (account) =>
//           account.code.startsWith(parentCode) && account.code !== parentCode
//       ).length
//       const newCode = `${parentCode}${(childCount + 1).toString().padStart(2, '0')}`
//       return newCode
//     },
//     [filteredAccounts]
//   )

//   //Add accounts
//   const handleAddAccount = async (data: ChartOfAccount) => {
//     if (data.parentAccountId) {
//       // Ensure parentAccountId is a number
//       const parentAccountId =
//         typeof data.parentAccountId === 'string'
//           ? Number.parseInt(data.parentAccountId, 10)
//           : data.parentAccountId
//       data.code = await generateAccountCode(parentAccountId)
//     }
//     const response = await createChartOfAccounts(data, token)

//     if (response.error || !response.data) {
//       console.error('Error creating chart of accounts:', response.error)
//     } else {
//       toast({
//         title: 'Success',
//         description: 'Chart Of account created successfully',
//       })
//       form.reset()
//       fetchCoaAccounts()
//       setIsAddAccountOpen(false)
//       setCurrentPage(1) // Reset to first page after create
//     }
//   }

//   React.useEffect(() => {
//     const subscription = form.watch((value, { name }) => {
//       if (name === 'parentAccountId' && value.parentAccountId) {
//         generateAccountCode(value.parentAccountId).then((newCode) => {
//           form.setValue('code', newCode)
//         })
//       }
//     })
//     return () => subscription.unsubscribe()
//   }, [form, generateAccountCode])

//   const fetchParentCodes = React.useCallback(async () => {
//     if (!token) return
//     const fetchedParentCodes = await getParentCodes(token)

//     if (fetchedParentCodes.error || !fetchedParentCodes.data) {
//       console.error('Error fetching parent codes:', fetchedParentCodes.error)
//       toast({
//         variant: 'destructive',
//         title: 'Error',
//         description:
//           fetchedParentCodes.error?.message || 'Failed to fetch parent codes',
//       })
//     } else {
//       setParentCodes(fetchedParentCodes.data)
//       console.log(fetchedParentCodes.data)
//       if (fetchedParentCodes.data.length > 0) {
//       }
//     }
//   }, [token])

//   // get all currency api
//   const fetchCurrency = React.useCallback(async () => {
//     if (!token) return
//     const fetchedCurrency = await getAllCurrency(token)

//     if (fetchedCurrency.error || !fetchedCurrency.data) {
//       console.error('Error getting currency:', fetchedCurrency.error)
//       toast({
//         title: 'Error',
//         description: fetchedCurrency.error?.message || 'Failed to get currency',
//       })
//     } else {
//       setCurrency(fetchedCurrency.data)
//     }
//   }, [token])

//   const fetchCoaAccounts = React.useCallback(async () => {
//     if (!token) return
//     const fetchedAccounts = await getAllChartOfAccounts(token)

//     if (fetchedAccounts?.error?.status === 401) {
//       router.push('/unauthorized-access')

//       return
//     } else if (fetchedAccounts.error || !fetchedAccounts.data) {
//       console.error('Error fetching chart of accounts:', fetchedAccounts.error)
//       toast({
//         variant: 'destructive',
//         title: 'Error',
//         description:
//           fetchedAccounts.error?.message || 'Failed to fetch chart of accounts',
//       })
//     } else {
//       setAccounts(fetchedAccounts.data)
//       console.log('all chart of account data: ', fetchedAccounts.data)
//       // Build dynamic code groups when accounts are fetched
//       const dynamicGroups = buildCodeGroups(fetchedAccounts.data)
//       setGroups(dynamicGroups)
//     }
//   }, [token, router, buildCodeGroups])

//   React.useEffect(() => {
//     fetchCoaAccounts()
//     fetchParentCodes()
//     fetchCurrency()
//   }, [fetchCoaAccounts, fetchParentCodes, fetchCurrency, router])

//   // Update code groups when accounts change
//   React.useEffect(() => {
//     if (accounts.length > 0) {
//       const dynamicGroups = buildCodeGroups(accounts)
//       setGroups(dynamicGroups)
//     }
//   }, [accounts, buildCodeGroups])

//   // Filter accounts based on search term, selected types, and active accounts
//   React.useEffect(() => {
//     let filtered = accounts.filter(
//       (account) =>
//         (account.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           account.accountType
//             .toLowerCase()
//             .includes(searchTerm.toLowerCase())) &&
//         (selectedTypes.length === 0 ||
//           selectedTypes.includes(account.accountType)) &&
//         (selectedCode ? account.code.startsWith(selectedCode) : true)
//     )
//     if (activeAccountOnly) {
//       filtered = filtered.filter((account) => account.isReconcilable)
//       filtered = filtered.filter((account) => account.isCash)
//     }
//     setFilteredAccounts(filtered)
//   }, [searchTerm, selectedTypes, activeAccountOnly, selectedCode, accounts])

//   const removeFilter = (filter: string) => {
//     setSelectedTypes(selectedTypes.filter((type) => type !== filter))
//   }

//   const handleSwitchChange = (code: string, checked: boolean) => {
//     setAccounts((prevAccounts) =>
//       prevAccounts.map((account) =>
//         account.code === code
//           ? { ...account, isReconcilable: checked }
//           : account
//       )
//     )
//   }

//   const toggleGroup = (groupId: string) => {
//     setGroups((prevGroups) => {
//       const updateGroup = (group: CodeGroup): CodeGroup => {
//         if (group.id === groupId) {
//           return { ...group, isExpanded: !group.isExpanded }
//         }
//         if (group.subgroups) {
//           return { ...group, subgroups: group.subgroups.map(updateGroup) }
//         }
//         return group
//       }

//       return prevGroups.map(updateGroup)
//     })
//   }

//   // this is side bar search by code
//   const renderCodeGroups = (groups: CodeGroup[]) => {
//     return groups.map((group) => (
//       <div key={group.id} className="space-y-1">
//         <Button
//           variant="ghost"
//           className={cn(
//             'w-full justify-start gap-2 font-bold border-2 shadow-md border-hidden',
//             selectedCode === group.code && 'bg-muted'
//           )}
//           onClick={() => {
//             if (group.subgroups && group.subgroups.length > 0) {
//               toggleGroup(group.id)
//             } else {
//               setSelectedCode(group.code)
//             }
//           }}
//           title={`Code ${group.code}`}
//         >
//           {group.subgroups && group.subgroups.length > 0 && (
//             <ChevronRight
//               className={cn(
//                 'h-4 w-4 shrink-0 transition-transform ',
//                 group.isExpanded && 'rotate-90'
//               )}
//             />
//           )}
//           <span>{group.code}</span>
//           {
//             <span className="text-xs text-muted-foreground truncate ml-1"></span>
//           }
//         </Button>
//         {group.isExpanded && group.subgroups && group.subgroups.length > 0 && (
//           <div className="pl-4 ml-6">{renderCodeGroups(group.subgroups)}</div>
//         )}
//       </div>
//     ))
//   }

//   // Edit accounts function open dialog box
//   const handleEditAccount = (account: AccountsHead) => {
//     setEditingAccount({
//       ...account,
//       name: account.name,
//       notes: account.notes,
//       isReconcilable: account.isReconcilable,
//     })
//     setIsEditAccountOpen(true)
//   }

//   // disable account and enable account function with api
//   const handleDisableAccount = async (code: string) => {
//     // Find the account to update
//     const accountToUpdate = accounts.find((account) => account.code === code)
//     if (accountToUpdate) {
//       // Toggle the isActive status
//       const updatedAccount = {
//         ...accountToUpdate,
//         isActive: !accountToUpdate.isActive,
//       }
//       // API request to update the account
//       const response = await updateChartOfAccounts(updatedAccount, token)
//       if (response.error || !response.data) {
//         console.error('Error updating chart of accounts:', response.error)
//         toast({
//           variant: 'destructive',
//           title: 'Error',
//           description:
//             response.error?.message || 'Failed to update chart of account',
//         })
//       } else {
//         toast({
//           title: 'Success',
//           description: 'Chart Of account updated successfully',
//         })
//         // Update the accounts state
//         setAccounts((prevAccounts) =>
//           prevAccounts.map((account) =>
//             account.code === updatedAccount.code ? updatedAccount : account
//           )
//         )
//       }
//     }
//   }

//   // save edit account function
//   const handleSaveEdit = async (data: Partial<ChartOfAccount>) => {
//     if (editingAccount) {
//       const updatedAccount = {
//         ...editingAccount,
//         name: data.name || editingAccount.name,
//         notes: data.notes || editingAccount.notes,
//         isReconcilable:
//           data.isReconcilable !== undefined
//             ? data.isReconcilable
//             : editingAccount.isReconcilable,
//       }
//       const response = await updateChartOfAccounts(updatedAccount, token)
//       if (response.error || !response.data) {
//         console.error('Error updating chart of accounts:', response.error)
//         toast({
//           variant: 'destructive',
//           title: 'Error',
//           description:
//             response.error?.message || 'Failed to update chart of account',
//         })
//       } else {
//         toast({
//           title: 'Success',
//           description: 'Chart Of account updated successfully',
//         })
//         setAccounts((prevAccounts) =>
//           prevAccounts.map((account) =>
//             account.code === updatedAccount.code ? updatedAccount : account
//           )
//         )
//         // setCurrentPage(1) // Reset to first page after edit
//       }
//       setIsEditAccountOpen(false)
//       setEditingAccount(null)
//     }
//   }

//   // return function for chart of accounts
//   return (
//     <div className="flex flex-col ">
//       <div className="p-2">
//         <div className="sticky top-28 bg-white flex items-center justify-between gap-4 border-b-2  shadow-md p-2 z-20">
//           <h2 className="text-xl font-semibold">Chart of Accounts</h2>
//           <div className="flex items-center gap-2 flex-grow justify-center max-w-2xl">
//             {/* <div className="relative flex items-center border rounded-md pr-2 flex-grow">
//               <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
//               <Input
//                 placeholder="Search..."
//                 className="pl-8 border-none"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//               <div className="mx-2 flex gap-1 ">
//                 {selectedTypes.map((type) => (
//                   <Badge
//                     key={type}
//                     variant="secondary"
//                     className="gap-1 px-2 py-1 ring-1 whitespace-nowrap"
//                   >
//                     {type}
//                     <X
//                       className="h-3 w-3 cursor-pointer"
//                       onClick={() => removeFilter(type)}
//                     />
//                   </Badge>
//                 ))}
//               </div>
//             </div> */}
//             <div className="relative flex items-center border rounded-md pr-2 flex-grow">
//               <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground gap-2" />
//               <Input
//                 placeholder="Search..."
//                 className="pl-8 pr-8 border-none"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//               {searchTerm && (
//                 <X
//                   className="absolute right-0 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground"
//                   onClick={() => setSearchTerm('')}
//                 />
//               )}
//               <div className="mx-2 flex gap-1 ">
//                 {selectedTypes.map((type) => (
//                   <Badge
//                     key={type}
//                     variant="secondary"
//                     className="gap-1 px-2 py-1 ring-1 whitespace-nowrap"
//                   >
//                     {type}
//                     <X
//                       className="h-3 w-3 cursor-pointer"
//                       onClick={() => removeFilter(type)}
//                     />
//                   </Badge>
//                 ))}
//               </div>
//             </div>
//             <Button
//               variant="outline"
//               size="icon"
//               onClick={() => setShowFilters(!showFilters)}
//             >
//               <Filter className="h-4 w-4" />
//             </Button>
//           </div>
//           {/* Add account  */}
//           <Dialog
//             open={isAddAccountOpen}
//             onOpenChange={(open) => {
//               fetchCoaAccounts()
//               if (!open) {
//                 form.reset()
//               }
//               setIsAddAccountOpen(open)
//               fetchParentCodes()
//             }}
//           >
//             <DialogTrigger asChild>
//               <Button variant="default" size="lg" className="whitespace-nowrap">
//                 <Plus className="h-4 w-4 mr-2" />
//                 ADD
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
//               <DialogHeader>
//                 <DialogTitle>Add New Account</DialogTitle>
//               </DialogHeader>
//               <Form {...form}>
//                 <form
//                   onSubmit={form.handleSubmit(handleAddAccount)}
//                   className="space-y-4"
//                 >
//                   <FormField
//                     control={form.control}
//                     name="name"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Account Name</FormLabel>
//                         <span className="text-red-500">*</span>
//                         <FormControl>
//                           <Input
//                             {...field}
//                             placeholder="Enter account name"
//                             className="focus:ring-2 focus:ring-primary focus:border-primary"
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name="accountType"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Account Type</FormLabel>
//                         <span className="text-red-500">*</span>
//                         <CustomCombobox
//                           items={accountTypes.map((type) => ({
//                             id: type.toLowerCase(),
//                             name: type,
//                           }))}
//                           value={
//                             field.value
//                               ? {
//                                   id: field.value,
//                                   name:
//                                     accountTypes.find(
//                                       (type) =>
//                                         type.toLowerCase() === field.value
//                                     ) || 'Select account type',
//                                 }
//                               : null
//                           }
//                           onChange={(
//                             value: { id: string; name: string } | null
//                           ) => field.onChange(value ? value.id : null)}
//                           placeholder="Select account type"
//                         />
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name="cashTag"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Account Cash Tag</FormLabel>
//                         <CustomCombobox
//                           items={cashTags.map((tag) => ({
//                             id: tag.toLowerCase(),
//                             name: tag,
//                           }))}
//                           value={
//                             field.value
//                               ? {
//                                   id: field.value.toLowerCase(),
//                                   name:
//                                     cashTags.find(
//                                       (tag) => tag.toLowerCase() === field.value
//                                     ) || 'Select Cash Tag',
//                                 }
//                               : null
//                           }
//                           onChange={(
//                             value: { id: string; name: string } | null
//                           ) => {
//                             field.onChange(value ? value.id : null)
//                           }}
//                           placeholder="Select Cash Tag"
//                         />
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name="parentAccountId"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>
//                           Parent Account Name
//                           <span className="text-red-500">*</span>
//                         </FormLabel>
//                         <CustomCombobox
//                           items={parentCodes.map((account: ChartOfAccount) => ({
//                             id: account.code.toString(),
//                             name: account.name || 'Unnamed Account',
//                           }))}
//                           value={
//                             field.value
//                               ? {
//                                   id: field.value.toString(),
//                                   name:
//                                     parentCodes.find(
//                                       (acc) =>
//                                         acc.code.toString() ===
//                                         field.value.toString()
//                                     )?.name || 'Select Parent Account',
//                                 }
//                               : null
//                           }
//                           onChange={(value) =>
//                             field.onChange(value ? Number(value.id) : undefined)
//                           }
//                           placeholder="Select Parent Account"
//                         />
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name="currencyId"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Currency</FormLabel>
//                         <CustomCombobox
//                           items={currency.map((curr: CurrencyType) => ({
//                             id: curr.currencyId.toString(),
//                             name: curr.currencyCode || 'Unnamed Currency',
//                           }))}
//                           value={
//                             field.value
//                               ? {
//                                   id: field.value.toString(),
//                                   name:
//                                     currency.find(
//                                       (curr: CurrencyType) =>
//                                         curr.currencyId === field.value
//                                     )?.currencyCode || 'Unnamed Currency',
//                                 }
//                               : null
//                           }
//                           onChange={(
//                             value: { id: string; name: string } | null
//                           ) =>
//                             field.onChange(
//                               value ? Number.parseInt(value.id, 10) : null
//                             )
//                           }
//                           placeholder="Select currency"
//                         />
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name="notes"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Financial Tag</FormLabel>
//                         <CustomCombobox
//                           items={financialTags.map((tag) => ({
//                             id: tag.toLowerCase(),
//                             name: tag,
//                           }))}
//                           value={
//                             field.value
//                               ? {
//                                   id: field.value.toLowerCase(),
//                                   name: field.value,
//                                 }
//                               : null
//                           }
//                           onChange={(
//                             value: { id: string; name: string } | null
//                           ) => {
//                             field.onChange(value ? value.id : null)
//                           }}
//                           placeholder="Select financial tag"
//                         />
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name="isReconcilable"
//                     render={({ field }) => (
//                       <FormItem className="flex flex-row items-start space-x-3 space-y-0 focus-within:ring-1 focus-within:ring-black focus-within:ring-offset-2 focus-within:rounded-md">
//                         <FormControl>
//                           <Checkbox
//                             checked={field.value}
//                             onCheckedChange={field.onChange}
//                             onKeyDown={(e) => {
//                               if (e.key === ' ' || e.key === 'Enter') {
//                                 e.preventDefault()
//                                 field.onChange(!field.value)
//                               }
//                             }}
//                             tabIndex={0}
//                             title="Press Space or Enter to toggle"
//                           />
//                         </FormControl>
//                         <div className="space-y-1 leading-none">
//                           <FormLabel>Is Reconcilable</FormLabel>
//                           <FormDescription>
//                             Check if this account can be reconciled
//                           </FormDescription>
//                         </div>
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name="withholdingTax"
//                     render={({ field }) => (
//                       <FormItem className="flex flex-row items-start space-x-3 space-y-0 focus-within:ring-1 focus-within:ring-black focus-within:ring-offset-2 focus-within:rounded-md">
//                         <FormControl>
//                           <Checkbox
//                             checked={field.value}
//                             onCheckedChange={field.onChange}
//                             onKeyDown={(e) => {
//                               if (e.key === ' ' || e.key === 'Enter') {
//                                 e.preventDefault()
//                                 field.onChange(!field.value)
//                               }
//                             }}
//                             tabIndex={0}
//                             title="Press Space or Enter to toggle"
//                           />
//                         </FormControl>
//                         <div className="space-y-1 leading-none">
//                           <FormLabel>Accounts Receivable/Payable</FormLabel>
//                           <FormDescription>
//                             Check if this account is subject to Accounts
//                             Receivable/Payable
//                           </FormDescription>
//                         </div>
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name="budgetTracking"
//                     render={({ field }) => (
//                       <FormItem className="flex flex-row items-start space-x-3 space-y-0 focus-within:ring-1 focus-within:ring-black focus-within:ring-offset-2 focus-within:rounded-md">
//                         <FormControl>
//                           <Checkbox
//                             checked={field.value}
//                             onCheckedChange={field.onChange}
//                             onKeyDown={(e) => {
//                               if (e.key === ' ' || e.key === 'Enter') {
//                                 e.preventDefault()
//                                 field.onChange(!field.value)
//                               }
//                             }}
//                             tabIndex={0}
//                             title="Press Space or Enter to toggle"
//                           />
//                         </FormControl>
//                         <div className="space-y-1 leading-none">
//                           <FormLabel>Budget Tracking</FormLabel>
//                           <FormDescription>
//                             Check if this account should be included in budget
//                             tracking
//                           </FormDescription>
//                         </div>
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name="isActive"
//                     render={({ field }) => (
//                       <FormItem className="flex flex-row items-start space-x-3 space-y-0 focus-within:ring-1 focus-within:ring-black focus-within:ring-offset-2 focus-within:rounded-md">
//                         <FormControl>
//                           <Checkbox
//                             checked={field.value}
//                             onCheckedChange={field.onChange}
//                             onKeyDown={(e) => {
//                               if (e.key === ' ' || e.key === 'Enter') {
//                                 e.preventDefault()
//                                 field.onChange(!field.value)
//                               }
//                             }}
//                             tabIndex={0}
//                             title="Press Space or Enter to toggle"
//                           />
//                         </FormControl>
//                         <div className="space-y-1 leading-none">
//                           <FormLabel>Is Active</FormLabel>
//                           <FormDescription>
//                             Uncheck to deactivate this account
//                           </FormDescription>
//                         </div>
//                       </FormItem>
//                     )}
//                   />

//                   <FormField
//                     control={form.control}
//                     name="isGroup"
//                     render={({ field }) => (
//                       <FormItem className="flex flex-row items-start space-x-3 space-y-0 focus-within:ring-1 focus-within:ring-black focus-within:ring-offset-2 focus-within:rounded-md">
//                         <FormControl>
//                           <Checkbox
//                             checked={field.value}
//                             onCheckedChange={field.onChange}
//                             onKeyDown={(e) => {
//                               if (e.key === ' ' || e.key === 'Enter') {
//                                 e.preventDefault()
//                                 field.onChange(!field.value)
//                               }
//                             }}
//                             tabIndex={0}
//                             title="Press Space or Enter to toggle"
//                           />
//                         </FormControl>
//                         <div className="space-y-1 leading-none">
//                           <FormLabel>Is Group</FormLabel>
//                           <FormDescription>
//                             Check if this is a group account
//                           </FormDescription>
//                         </div>
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name="isPartner"
//                     render={({ field }) => (
//                       <FormItem className="flex flex-row items-start space-x-3 space-y-0 focus-within:ring-1 focus-within:ring-black focus-within:ring-offset-2 focus-within:rounded-md">
//                         <FormControl>
//                           <Checkbox
//                             checked={field.value}
//                             onCheckedChange={field.onChange}
//                             onKeyDown={(e) => {
//                               if (e.key === ' ' || e.key === 'Enter') {
//                                 e.preventDefault()
//                                 field.onChange(!field.value)
//                               }
//                             }}
//                             tabIndex={0}
//                             title="Press Space or Enter to toggle"
//                           />
//                         </FormControl>
//                         <div className="space-y-1 leading-none">
//                           <FormLabel>Is Partner</FormLabel>
//                           <FormDescription>
//                             Check if this is a partner account
//                           </FormDescription>
//                         </div>
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name="isCostCenter"
//                     render={({ field }) => (
//                       <FormItem className="flex flex-row items-start space-x-3 space-y-0 focus-within:ring-1 focus-within:ring-black focus-within:ring-offset-2 focus-within:rounded-md">
//                         <FormControl>
//                           <Checkbox
//                             checked={field.value}
//                             onCheckedChange={field.onChange}
//                             onKeyDown={(e) => {
//                               if (e.key === ' ' || e.key === 'Enter') {
//                                 e.preventDefault()
//                                 field.onChange(!field.value)
//                               }
//                             }}
//                             tabIndex={0}
//                             title="Press Space or Enter to toggle"
//                           />
//                         </FormControl>
//                         <div className="space-y-1 leading-none">
//                           <FormLabel>Is Cost Center</FormLabel>
//                           <FormDescription>
//                             Check if this is a cost center account
//                           </FormDescription>
//                         </div>
//                       </FormItem>
//                     )}
//                   />
//                   <Button
//                     type="submit"
//                     className="w-full"
//                     onKeyDown={(e) => {
//                       if (e.key === 'Enter') {
//                         e.preventDefault()
//                         e.currentTarget.click()
//                       }
//                     }}
//                     tabIndex={0}
//                   >
//                     Create Account
//                   </Button>
//                 </form>
//               </Form>
//             </DialogContent>
//           </Dialog>
//         </div>
//         <div className="flex mb">
//           <div className="fixed w-64 border-r bg-muted/50 ml-4 space-y-2 overflow-y-scroll h-[calc(100vh-200px)] ">
//             <Button
//               variant="ghost"
//               className={cn(
//                 'w-full justify-start font-bold',
//                 !selectedCode && 'bg-muted'
//               )}
//               onClick={() => setSelectedCode(null)}
//             >
//               All
//             </Button>
//             {renderCodeGroups(groups)}
//           </div>
//           <div className="ml-64 flex-1 pl-4 ">
//             {showFilters && (
//               <div className="sticky top-36 grid grid-cols-3 gap-4 mb-4 p-4 border rounded-lg bg-white shadow-2xl lg:mx-52 z-20 ">
//                 <div>
//                   <h3 className="font-medium mb-2 flex items-center gap-2">
//                     <Filter className="h-4 w-4" />
//                     Filters
//                   </h3>
//                   <div className="space-y-2">
//                     {accountTypes.map((type) => (
//                       <div key={type} className="flex items-center space-x-2">
//                         <Checkbox
//                           checked={selectedTypes.includes(type)}
//                           onCheckedChange={(checked: boolean) => {
//                             setSelectedTypes(
//                               checked
//                                 ? [...selectedTypes, type]
//                                 : selectedTypes.filter((t) => t !== type)
//                             )
//                           }}
//                         />
//                         <label>{type}</label>
//                       </div>
//                     ))}
//                     <div className="flex items-center space-x-2 mt-4">
//                       <Checkbox
//                         checked={activeAccountOnly}
//                         onCheckedChange={(checked) =>
//                           setActiveAccountOnly(checked as boolean)
//                         }
//                       />
//                       <label>Active Account</label>
//                     </div>
//                   </div>
//                 </div>
//                 <div>
//                   <h3 className="font-medium mb-2 flex items-center gap-2">
//                     <Group className="h-4 w-4" />
//                     Group By
//                   </h3>
//                   <DropdownMenu>
//                     <DropdownMenuTrigger asChild>
//                       <Button
//                         variant="outline"
//                         className="w-full justify-between bg-transparent"
//                       >
//                         Account Type
//                         <ChevronDown className="h-4 w-4 opacity-50" />
//                       </Button>
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent align="start">
//                       <DropdownMenuItem>Account Type</DropdownMenuItem>
//                       <DropdownMenuItem>Add Custom Group</DropdownMenuItem>
//                     </DropdownMenuContent>
//                   </DropdownMenu>
//                 </div>
//                 <div>
//                   <h3 className="font-medium mb-2 flex items-center gap-2">
//                     <Star className="h-4 w-4" />
//                     Favorites
//                   </h3>
//                   <DropdownMenu>
//                     <DropdownMenuTrigger asChild>
//                       <Button
//                         variant="outline"
//                         className="w-full justify-between bg-transparent"
//                       >
//                         Save current search
//                         <ChevronDown className="h-4 w-4 opacity-50" />
//                       </Button>
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent align="start">
//                       <DropdownMenuItem>Chart of Accounts</DropdownMenuItem>
//                       <DropdownMenuItem>Save current search</DropdownMenuItem>
//                     </DropdownMenuContent>
//                   </DropdownMenu>
//                 </div>
//               </div>
//             )}
//             {/* Table header and data */}
//             <div className=" border rounded-md overflow-hidden">
//               <div className="overflow-auto max-h-[calc(100vh-200px)]">
//                 <Table>
//                   <TableHeader className="sticky top-0 bg-[#e0e0e0] z-10">
//                     <TableRow className="">
//                       <TableHead className="w-[100px]">Code</TableHead>
//                       <TableHead>Account Name</TableHead>
//                       <TableHead>Parent Account Name</TableHead>
//                       <TableHead className="capitalize">Type</TableHead>
//                       <TableHead className="text-center">
//                         Allow Reconciliation
//                       </TableHead>
//                       <TableHead className="w-[200px]">Actions</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {filteredAccounts
//                       .slice(
//                         (currentPage - 1) * itemsPerPage,
//                         currentPage * itemsPerPage
//                       )
//                       .map((account) => (
//                         <TableRow key={account.code}>
//                           <TableCell>{account.code}</TableCell>
//                           <TableCell>{account.name}</TableCell>
//                           <TableCell>{account.parentName}</TableCell>
//                           <TableCell>{account.accountType}</TableCell>
//                           <TableCell className="text-center">
//                             <Switch
//                               checked={account.isReconcilable}
//                               onChange={(checked: any) =>
//                                 handleSwitchChange(account.code, checked)
//                               }
//                               id={`switch-${account.code}`}
//                             />
//                           </TableCell>
//                           <TableCell>
//                             <div className="flex space-x-2">
//                               <Button
//                                 variant="outline"
//                                 size="sm"
//                                 onClick={() => handleEditAccount(account)}
//                               >
//                                 <Edit className="h-4 w-4 mr-2" />
//                                 Edit
//                               </Button>
//                               <Button
//                                 variant={
//                                   account.isActive ? 'destructive' : 'outline'
//                                 }
//                                 size="sm"
//                                 onClick={() =>
//                                   handleDisableAccount(account.code)
//                                 }
//                               >
//                                 <Power className="h-4 w-4 mr-2" />
//                                 {account.isActive ? 'Disable' : 'Enable'}
//                               </Button>
//                             </div>
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                   </TableBody>
//                 </Table>
//                 <div className="flex justify-center mt-4">
//                   <Pagination>
//                     <PaginationContent>
//                       <PaginationItem>
//                         <PaginationPrevious
//                           onClick={() =>
//                             setCurrentPage((prev) => Math.max(prev - 1, 1))
//                           }
//                           className={
//                             currentPage === 1
//                               ? 'pointer-events-none opacity-50'
//                               : ''
//                           }
//                         />
//                       </PaginationItem>

//                       {[...Array(totalPages)].map((_, index) => {
//                         if (
//                           index === 0 ||
//                           index === totalPages - 1 ||
//                           (index >= currentPage - 2 && index <= currentPage + 2)
//                         ) {
//                           return (
//                             <PaginationItem key={`page-${index}`}>
//                               <PaginationLink
//                                 onClick={() => setCurrentPage(index + 1)}
//                                 isActive={currentPage === index + 1}
//                               >
//                                 {index + 1}
//                               </PaginationLink>
//                             </PaginationItem>
//                           )
//                         } else if (
//                           index === currentPage - 3 ||
//                           index === currentPage + 3
//                         ) {
//                           return (
//                             <PaginationItem key={`ellipsis-${index}`}>
//                               <PaginationLink>...</PaginationLink>
//                             </PaginationItem>
//                           )
//                         }

//                         return null
//                       })}

//                       <PaginationItem>
//                         <PaginationNext
//                           onClick={() =>
//                             setCurrentPage((prev) =>
//                               Math.min(prev + 1, totalPages)
//                             )
//                           }
//                           className={
//                             currentPage === totalPages
//                               ? 'pointer-events-none opacity-50'
//                               : ''
//                           }
//                         />
//                       </PaginationItem>
//                     </PaginationContent>
//                   </Pagination>
//                 </div>
//               </div>
//             </div>
//             {/* Edit Form */}
//           </div>
//         </div>
//       </div>
//       {/* Edit Chart Of Accounts */}
//       <Dialog open={isEditAccountOpen} onOpenChange={setIsEditAccountOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Edit Account</DialogTitle>
//           </DialogHeader>
//           {editingAccount && (
//             <form
//               className="space-y-4"
//               onSubmit={(e) => {
//                 e.preventDefault()
//                 handleSaveEdit(editingAccount)
//               }}
//             >
//               <div className="spacey-2">
//                 <Label htmlFor="edit-notes">Notes</Label>
//                 <CustomCombobox
//                   items={financialTags.map((tag) => ({
//                     id: tag.toLowerCase(),
//                     name: tag,
//                   }))}
//                   value={
//                     editingAccount.notes
//                       ? {
//                           id: editingAccount.notes.toLowerCase(),
//                           name: editingAccount.notes,
//                         }
//                       : null
//                   }
//                   onChange={(value: { id: string; name: string } | null) => {
//                     setEditingAccount({
//                       ...editingAccount,
//                       notes: value ? value.name : '',
//                     })
//                   }}
//                   placeholder="Select financial tag"
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="edit-name">Account Name</Label>
//                 <Input
//                   id="edit-name"
//                   value={editingAccount.name}
//                   onChange={(e) =>
//                     setEditingAccount({
//                       ...editingAccount,
//                       name: e.target.value,
//                     })
//                   }
//                 />
//               </div>
//               <div className="flex items-center space-x-2">
//                 <Checkbox
//                   id="edit-isReconcilable"
//                   checked={editingAccount.isReconcilable}
//                   onCheckedChange={(checked) =>
//                     setEditingAccount({
//                       ...editingAccount,
//                       isReconcilable: checked as boolean,
//                     })
//                   }
//                 />
//                 <Label htmlFor="edit-isReconcilable">
//                   Allow Reconciliation
//                 </Label>
//               </div>
//               <Button type="submit" className="w-full">
//                 Save Changes
//               </Button>
//             </form>
//           )}
//         </DialogContent>
//       </Dialog>
//     </div>
//   )
// } 