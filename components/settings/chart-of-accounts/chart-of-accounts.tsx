// "use client"

// import * as React from "react"
// import { Search, ChevronLeft, ChevronRight, X, Filter, Group, Star, ChevronDown, Plus, Edit, Power } from 'lucide-react'
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Switch } from "@/components/ui/switch"
// import {
//     Table,
//     TableBody,
//     TableCell,
//     TableHead,
//     TableHeader,
//     TableRow,
// } from "@/components/ui/table"
// import {
//     DropdownMenu,
//     DropdownMenuContent,
//     DropdownMenuItem,
//     DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
// import { Checkbox } from "@/components/ui/checkbox"
// import { Badge } from "@/components/ui/badge"
// import { cn } from "@/lib/utils"
// import {
//     Dialog,
//     DialogContent,
//     DialogHeader,
//     DialogTitle,
//     DialogTrigger,
// } from "@/components/ui/dialog"
// import { Label } from "@/components/ui/label"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// interface Account {
//     code: string
//     name: string
//     type: string
//     allowReconciliation: boolean
//     isActive: boolean

// }

// interface CodeGroup {
//     id: string
//     code: string
//     isExpanded?: boolean
//     subgroups?: CodeGroup[]

// }

// const initialAccounts: Account[] = [
//     { code: "210100", name: "Sundry Creditors", type: "Current Liabilities", allowReconciliation: false, isActive: true },
//     { code: "210200", name: "Other Creditors", type: "Current Liabilities", allowReconciliation: false, isActive: true },
//     { code: "210900", name: "Accruals", type: "Current Liabilities", allowReconciliation: false, isActive: true },
//     { code: "215000", name: "Bad debt provision", type: "Current Liabilities", allowReconciliation: false, isActive: true },
//     { code: "220000", name: "Sales Tax Control Account", type: "Current Liabilities", allowReconciliation: false, isActive: true },
//     { code: "220100", name: "Purchase Tax Control Account", type: "Current Assets", allowReconciliation: false, isActive: true },
//     { code: "220200", name: "HMRC - VAT Account", type: "Payable", allowReconciliation: true, isActive: true },
//     { code: "220400", name: "Manual Adjustments 3 VAT", type: "Current Liabilities", allowReconciliation: false, isActive: true },
//     { code: "221000", name: "P.A.Y.E. & NI", type: "Payable", allowReconciliation: true, isActive: true },
//     { code: "222000", name: "Net Wages", type: "Payable", allowReconciliation: true, isActive: true },
//     { code: "223000", name: "Pension Fund", type: "Payable", allowReconciliation: true, isActive: true },
//     { code: "230000", name: "Loans", type: "Current Liabilities", allowReconciliation: false, isActive: true },
//     { code: "231000", name: "Hire Purchase", type: "Current Liabilities", allowReconciliation: false, isActive: true },
//     { code: "232000", name: "Corporation Tax", type: "Payable", allowReconciliation: true, isActive: true },
//     { code: "233000", name: "Mortgages", type: "Current Liabilities", allowReconciliation: false, isActive: true },
//     { code: "300000", name: "Share Capital", type: "Equity", allowReconciliation: false, isActive: true },
//     { code: "310000", name: "Retained Earnings", type: "Equity", allowReconciliation: false, isActive: true },
//     { code: "400000", name: "Sales Revenue", type: "Income", allowReconciliation: true, isActive: true },
//     { code: "410000", name: "Other Income", type: "Income", allowReconciliation: true, isActive: true },
//     { code: "500000", name: "Cost of Goods Sold", type: "Expenses", allowReconciliation: true, isActive: true },
//     { code: "510000", name: "Salaries and Wages", type: "Expenses", allowReconciliation: true, isActive: true },
//     { code: "520000", name: "Rent Expense", type: "Expenses", allowReconciliation: true, isActive: true },
//     { code: "530000", name: "Utilities Expense", type: "Expenses", allowReconciliation: true, isActive: true },
//     { code: "540000", name: "Depreciation Expense", type: "Expenses", allowReconciliation: false, isActive: true },
//     { code: "550000", name: "Office Supplies", type: "Expenses", allowReconciliation: true, isActive: true },
//     { code: "560000", name: "Insurance Expense", type: "Expenses", allowReconciliation: true, isActive: true },
//     { code: "570000", name: "Advertising Expense", type: "Expenses", allowReconciliation: true, isActive: true },
//     { code: "580000", name: "Travel Expense", type: "Expenses", allowReconciliation: true, isActive: true },
//     { code: "590000", name: "Maintenance Expense", type: "Expenses", allowReconciliation: true, isActive: true },
//     { code: "600000", name: "Interest Expense", type: "Expenses", allowReconciliation: true, isActive: true },
// ]

// const accountTypes = [
//     "Receivable",
//     "Payable",
//     "Equity",
//     "Assets",
//     "Liability",
//     "Income",
//     "Expenses",
// ]

// const codeGroups: CodeGroup[] = [
//     {
//         id: "1",
//         code: "1",
//         isExpanded: false,
//         subgroups: [
//             { id: "11", code: "11" },
//             { id: "12", code: "12" },
//             { id: "13", code: "13" },
//         ],
//     },
//     {
//         id: "2",
//         code: "2",
//         isExpanded: false,
//         subgroups: [
//             { id: "21", code: "21" },
//             { id: "22", code: "22" },
//             { id: "23", code: "23" },
//         ],
//     },
//     {
//         id: "3",
//         code: "3",
//         isExpanded: false,
//         subgroups: [
//             { id: "30", code: "30" },
//             { id: "31", code: "31" },
//         ],
//     },
//     {
//         id: "4",
//         code: "4",
//         isExpanded: false,
//         subgroups: [
//             { id: "40", code: "40" },
//             { id: "41", code: "41" },
//         ],
//     },
//     {
//         id: "5",
//         code: "5",
//         isExpanded: false,
//         subgroups: [
//             { id: "50", code: "50" },
//             { id: "51", code: "51" },
//             { id: "52", code: "52" },
//             { id: "53", code: "53" },
//             { id: "54", code: "54" },
//             { id: "55", code: "55" },
//         ],
//     },
//     {
//         id: "6",
//         code: "6",
//         isExpanded: false,
//         subgroups: [
//             { id: "60", code: "60" },
//         ],
//     },
// ]

// export default function ChartOfAccountsTable() {
//     const [searchTerm, setSearchTerm] = React.useState("")
//     const [selectedTypes, setSelectedTypes] = React.useState<string[]>([])
//     const [showFilters, setShowFilters] = React.useState(false)
//     const [activeAccountOnly, setActiveAccountOnly] = React.useState(false)
//     const [accounts, setAccounts] = React.useState<Account[]>(initialAccounts)
//     const [filteredAccounts, setFilteredAccounts] = React.useState(accounts)
//     const [selectedCode, setSelectedCode] = React.useState<string | null>(null)
//     const [groups, setGroups] = React.useState(codeGroups)
//     const [isAddAccountOpen, setIsAddAccountOpen] = React.useState(false)
//     const [isEditAccountOpen, setIsEditAccountOpen] = React.useState(false)
//     const [editingAccount, setEditingAccount] = React.useState<Account | null>(null)

//     React.useEffect(() => {
//         let filtered = accounts.filter(account =>
//             (account.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                 account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                 account.type.toLowerCase().includes(searchTerm.toLowerCase())) &&
//             (selectedTypes.length === 0 || selectedTypes.includes(account.type)) &&
//             (selectedCode ? account.code.startsWith(selectedCode) : true)
//         )

//         if (activeAccountOnly) {
//             filtered = filtered.filter(account => account.allowReconciliation)
//         }

//         setFilteredAccounts(filtered)
//     }, [searchTerm, selectedTypes, activeAccountOnly, selectedCode, accounts])

//     const removeFilter = (filter: string) => {
//         setSelectedTypes(selectedTypes.filter(type => type !== filter))
//     }

//     const handleSwitchChange = (code: string, checked: boolean) => {
//         setAccounts(prevAccounts =>
//             prevAccounts.map(account =>
//                 account.code === code ? { ...account, allowReconciliation: checked } : account
//             )
//         )
//         setFilteredAccounts(prevFilteredAccounts =>
//             prevFilteredAccounts.map(account =>
//                 account.code === code ? { ...account, allowReconciliation: checked } : account
//             )
//         )
//     }

//     const toggleGroup = (groupId: string) => {
//         setGroups(prevGroups => {
//             const updateGroup = (group: CodeGroup): CodeGroup => {
//                 if (group.id === groupId) {
//                     return { ...group, isExpanded: !group.isExpanded }
//                 }
//                 if (group.subgroups) {
//                     return { ...group, subgroups: group.subgroups.map(updateGroup) }
//                 }
//                 return group
//             }
//             return prevGroups.map(updateGroup)
//         })
//     }

//     const renderCodeGroups = (groups: CodeGroup[]) => {
//         return groups.map((group) => (
//             <div key={group.id} className="space-y-1">
//                 <Button
//                     variant="ghost"
//                     className={cn(
//                         "w-full justify-start gap-2 font-bold border-2 shadow-md border-hidden",
//                         selectedCode === group.code && "bg-muted"
//                     )}
//                     onClick={() => {
//                         if (group.subgroups) {
//                             toggleGroup(group.id)
//                         } else {
//                             setSelectedCode(group.code)
//                         }
//                     }}
//                 >
//                     {group.subgroups && (
//                         <ChevronRight className={cn(
//                             "h-4 w-4 shrink-0 transition-transform ",
//                             group.isExpanded && "rotate-90"
//                         )} />
//                     )}
//                     <span>{group.code}</span>
//                 </Button>
//                 {group.isExpanded && group.subgroups && (
//                     <div className="pl-4 ml-6">
//                         {renderCodeGroups(group.subgroups)}
//                     </div>
//                 )}
//             </div>
//         ))
//     }

//     const handleEditAccount = (account: Account) => {
//         setEditingAccount(account)
//         setIsEditAccountOpen(true)
//     }

//     const handleDisableAccount = (code: string) => {
//         setAccounts(prevAccounts =>
//             prevAccounts.map(account =>
//                 account.code === code ? { ...account, isActive: !account.isActive } : account
//             )
//         )
//         setFilteredAccounts(prevFilteredAccounts =>
//             prevFilteredAccounts.map(account =>
//                 account.code === code ? { ...account, isActive: !account.isActive } : account
//             )
//         )
//     }

//     const handleSaveEdit = (editedAccount: Account) => {
//         setAccounts(prevAccounts =>
//             prevAccounts.map(account =>
//                 account.code === editedAccount.code ? editedAccount : account
//             )
//         )
//         setFilteredAccounts(prevFilteredAccounts =>
//             prevFilteredAccounts.map(account =>
//                 account.code === editedAccount.code ? editedAccount : account
//             )
//         )
//         setIsEditAccountOpen(false)
//         setEditingAccount(null)
//     }

//     return (
//         <div className="flex flex-col min-h-screen">
//             {/* Main Content */}
//             <div className="p-2">
//                 <div className="sticky top-16 bg-white flex items-center justify-between gap-4 border-b-2 mt-1 shadow-md p-2 z-20">
//                     <h2 className="text-xl font-semibold">Chart of Accounts</h2>
//                     <div className="flex items-center gap-2 flex-grow justify-center max-w-2xl">
//                         <div className="relative flex items-center border rounded-md pr-2 flex-grow">
//                             <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
//                             <Input
//                                 placeholder="Search..."
//                                 className="pl-8 border-none"
//                                 value={searchTerm}
//                                 onChange={(e) => setSearchTerm(e.target.value)}
//                             />
//                             <div className="mx-2 flex gap-1 ">
//                                 {selectedTypes.map((type) => (
//                                     <Badge key={type} variant="secondary" className="gap-1 px-2 py-1 ring-1 whitespace-nowrap">
//                                         {type}
//                                         <X
//                                             className="h-3 w-3 cursor-pointer"
//                                             onClick={() => removeFilter(type)}
//                                         />
//                                     </Badge>
//                                 ))}
//                             </div>
//                         </div>
//                         <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
//                             <Filter className="h-4 w-4" />
//                         </Button>
//                     </div>
//                     <Dialog open={isAddAccountOpen} onOpenChange={setIsAddAccountOpen}>
//                         <DialogTrigger asChild>
//                             <Button variant="default" size="sm" className="whitespace-nowrap">
//                                 <Plus className="h-4 w-4 mr-2" />
//                                 Add Account
//                             </Button>
//                         </DialogTrigger>
//                         <DialogContent>
//                             <DialogHeader>
//                                 <DialogTitle>Add New Account</DialogTitle>
//                             </DialogHeader>
//                             <form className="space-y-4">
//                                 <div className="space-y-2">
//                                     <Label htmlFor="code">Account Code</Label>
//                                     <Input id="code" placeholder="Enter account code" />
//                                 </div>
//                                 <div className="space-y-2">
//                                     <Label htmlFor="name">Account Name</Label>
//                                     <Input id="name" placeholder="Enter account name" />
//                                 </div>
//                                 <div className="space-y-2">
//                                     <Label htmlFor="type">Account Type</Label>
//                                     <Select>
//                                         <SelectTrigger>
//                                             <SelectValue placeholder="Select account type" />
//                                         </SelectTrigger>
//                                         <SelectContent>
//                                             {accountTypes.map((type) => (
//                                                 <SelectItem key={type} value={type.toLowerCase()}>{type}</SelectItem>
//                                             ))}
//                                         </SelectContent>
//                                     </Select>
//                                 </div>
//                                 <div className="flex items-center space-x-2">
//                                     <Checkbox id="allowReconciliation" />
//                                     <Label htmlFor="allowReconciliation">Allow Reconciliation</Label>
//                                 </div>
//                                 <Button type="submit" className="w-full">Add Account</Button>
//                             </form>
//                         </DialogContent>
//                     </Dialog>
//                 </div>

//                 <div className="flex">
//                     {/* Sidebar */}
//                     <div className="fixed w-64 border-r bg-muted/50 ml-4 space-y-2 overflow-y-auto h-[calc(100vh-100px)]">
//                         <Button
//                             variant="ghost"
//                             className={cn(
//                                 "w-full justify-start font-bold",
//                                 !selectedCode && "bg-muted"
//                             )}
//                             onClick={() => setSelectedCode(null)}
//                         >
//                             All
//                         </Button>
//                         {renderCodeGroups(groups)}
//                     </div>

//                     {/* Table Content */}
//                     <div className="ml-64 flex-1 pl-4">
//                         {showFilters && (
//                             <div className="sticky top-36 grid grid-cols-3 gap-4 mb-4 p-4 border rounded-lg bg-white shadow-2xl lg:mx-52 z-20">
//                                 <div>
//                                     <h3 className="font-medium mb-2 flex items-center gap-2">
//                                         <Filter className="h-4 w-4" />
//                                         Filters
//                                     </h3>
//                                     <div className="space-y-2">
//                                         {accountTypes.map((type) => <div key={type} className="flex items-center space-x-2">
//                                             <Checkbox
//                                                 checked={selectedTypes.includes(type)}
//                                                 onCheckedChange={(checked: boolean) => {
//                                                     setSelectedTypes(checked
//                                                         ? [...selectedTypes, type]
//                                                         : selectedTypes.filter((t) => t !== type)
//                                                     )
//                                                 }}
//                                             />
//                                             <label>{type}</label>
//                                         </div>
//                                         )}
//                                         <div className="flex items-center space-x-2 mt-4">
//                                             <Checkbox
//                                                 checked={activeAccountOnly}
//                                                 onCheckedChange={(checked) => setActiveAccountOnly(checked as boolean)}
//                                             />
//                                             <label>Active Account</label>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 <div>
//                                     <h3 className="font-medium mb-2 flex items-center gap-2">
//                                         <Group className="h-4 w-4" />
//                                         Group By
//                                     </h3>
//                                     <DropdownMenu>
//                                         <DropdownMenuTrigger asChild>
//                                             <Button variant="outline" className="w-full justify-between">
//                                                 Account Type
//                                                 <ChevronDown className="h-4 w-4 opacity-50" />
//                                             </Button>
//                                         </DropdownMenuTrigger>
//                                         <DropdownMenuContent align="start">
//                                             <DropdownMenuItem>Account Type</DropdownMenuItem>
//                                             <DropdownMenuItem>Add Custom Group</DropdownMenuItem>
//                                         </DropdownMenuContent>
//                                     </DropdownMenu>
//                                 </div>

//                                 <div>
//                                     <h3 className="font-medium mb-2 flex items-center gap-2">
//                                         <Star className="h-4 w-4" />
//                                         Favorites
//                                     </h3>
//                                     <DropdownMenu>
//                                         <DropdownMenuTrigger asChild>
//                                             <Button variant="outline" className="w-full justify-between">
//                                                 Save current search
//                                                 <ChevronDown className="h-4 w-4 opacity-50" />
//                                             </Button>
//                                         </DropdownMenuTrigger>
//                                         <DropdownMenuContent align="start">
//                                             <DropdownMenuItem>Chart of Accounts</DropdownMenuItem>
//                                             <DropdownMenuItem>Save current search</DropdownMenuItem>
//                                         </DropdownMenuContent>
//                                     </DropdownMenu>
//                                 </div>
//                             </div>
//                         )}

//                         <div className="border rounded-md overflow-hidden">
//                             <div className="overflow-auto max-h-[calc(100vh-200px)]">
//                                 <Table>
//                                     <TableHeader className="sticky top-0 bg-[#e0e0e0] z-10">
//                                         <TableRow className="">
//                                             <TableHead className="w-[100px]">Code</TableHead>
//                                             <TableHead>Account Name</TableHead>
//                                             <TableHead>Type</TableHead>
//                                             <TableHead className="text-center">Allow Reconciliation</TableHead>
//                                             <TableHead className="w-[200px]">Actions</TableHead>
//                                         </TableRow>
//                                     </TableHeader>
//                                     <TableBody>
//                                         {filteredAccounts.map((account) => (
//                                             <TableRow key={account.code}>
//                                                 <TableCell>{account.code}</TableCell>
//                                                 <TableCell>{account.name}</TableCell>
//                                                 <TableCell>{account.type}</TableCell>
//                                                 <TableCell className="text-center">
//                                                     <Switch
//                                                         checked={account.allowReconciliation}
//                                                         onCheckedChange={(checked: boolean) => handleSwitchChange(account.code, checked)}
//                                                         id={`switch-${account.code}`}
//                                                     />
//                                                 </TableCell>
//                                                 <TableCell>
//                                                     <div className="flex space-x-2">
//                                                         <Button variant="outline" size="sm" onClick={() => handleEditAccount(account)}>
//                                                             <Edit className="h-4 w-4 mr-2" />
//                                                             Edit
//                                                         </Button>
//                                                         <Button
//                                                             variant={account.isActive ? "destructive" : "outline"}
//                                                             size="sm"
//                                                             onClick={() => handleDisableAccount(account.code)}
//                                                         >
//                                                             <Power className="h-4 w-4 mr-2" />
//                                                             {account.isActive ? 'Disable' : 'Enable'}
//                                                         </Button>
//                                                     </div>
//                                                 </TableCell>
//                                             </TableRow>
//                                         ))}
//                                     </TableBody>
//                                 </Table>
//                             </div>
//                         </div>

//                         <div className="flex items-center justify-between mt-4">
//                             <div className="text-sm text-muted-foreground">
//                                 1-{filteredAccounts.length} / {accounts.length}
//                             </div>
//                             <div className="flex items-center gap-2">
//                                 <Button variant="outline" size="icon" disabled>
//                                     <ChevronLeft className="h-4 w-4" />
//                                 </Button>
//                                 <Button variant="outline" size="icon" disabled>
//                                     <ChevronRight className="h-4 w-4" />
//                                 </Button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Edit Account Dialog */}
//             <Dialog open={isEditAccountOpen} onOpenChange={setIsEditAccountOpen}>
//                 <DialogContent>
//                     <DialogHeader>
//                         <DialogTitle>Edit Account</DialogTitle>
//                     </DialogHeader>
//                     {editingAccount && (
//                         <form className="space-y-4" onSubmit={(e) => {
//                             e.preventDefault()
//                             handleSaveEdit(editingAccount)
//                         }}>
//                             <div className="space-y-2">
//                                 <Label htmlFor="edit-code">Account Code</Label>
//                                 <Input
//                                     id="edit-code"
//                                     value={editingAccount.code}
//                                     onChange={(e) => setEditingAccount({ ...editingAccount, code: e.target.value })}
//                                 />
//                             </div>
//                             <div className="space-y-2">
//                                 <Label htmlFor="edit-name">Account Name</Label>
//                                 <Input
//                                     id="edit-name"
//                                     value={editingAccount.name}
//                                     onChange={(e) => setEditingAccount({ ...editingAccount, name: e.target.value })}
//                                 />
//                             </div>
//                             <div className="space-y-2">
//                                 <Label htmlFor="edit-type">Account Type</Label>
//                                 <Select
//                                     value={editingAccount.type}
//                                     onValueChange={(value) => setEditingAccount({ ...editingAccount, type: value })}
//                                 >
//                                     <SelectTrigger>
//                                         <SelectValue>{editingAccount.type}</SelectValue>
//                                     </SelectTrigger>
//                                     <SelectContent>
//                                         {accountTypes.map((type) => (
//                                             <SelectItem key={type} value={type}>{type}</SelectItem>
//                                         ))}
//                                     </SelectContent>
//                                 </Select>
//                             </div>
//                             <div className="flex items-center space-x-2">
//                                 <Checkbox
//                                     id="edit-allowReconciliation"
//                                     checked={editingAccount.allowReconciliation}
//                                     onCheckedChange={(checked) => setEditingAccount({ ...editingAccount, allowReconciliation: checked as boolean })}
//                                 />
//                                 <Label htmlFor="edit-allowReconciliation">Allow Reconciliation</Label>
//                             </div>
//                             <Button type="submit" className="w-full">Save Changes</Button>
//                         </form>
//                     )}
//                 </DialogContent>
//             </Dialog>
//         </div>
//     )
// }

'use client'

import * as React from 'react'
import {
  Search,
  ChevronLeft,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Account {
  code: string
  name: string
  type: string
  allowReconciliation: boolean
  isActive: boolean
}

interface CodeGroup {
  id: string
  code: string
  isExpanded?: boolean
  subgroups?: CodeGroup[]
}

const initialAccounts: Account[] = [
  {
    code: '210100',
    name: 'Sundry Creditors',
    type: 'Current Liabilities',
    allowReconciliation: false,
    isActive: true,
  },
  {
    code: '210200',
    name: 'Other Creditors',
    type: 'Current Liabilities',
    allowReconciliation: false,
    isActive: true,
  },
  {
    code: '210900',
    name: 'Accruals',
    type: 'Current Liabilities',
    allowReconciliation: false,
    isActive: true,
  },
  {
    code: '215000',
    name: 'Bad debt provision',
    type: 'Current Liabilities',
    allowReconciliation: false,
    isActive: true,
  },
  {
    code: '220000',
    name: 'Sales Tax Control Account',
    type: 'Current Liabilities',
    allowReconciliation: false,
    isActive: true,
  },
  {
    code: '220100',
    name: 'Purchase Tax Control Account',
    type: 'Current Assets',
    allowReconciliation: false,
    isActive: true,
  },
  {
    code: '220200',
    name: 'HMRC - VAT Account',
    type: 'Payable',
    allowReconciliation: true,
    isActive: true,
  },
  {
    code: '220400',
    name: 'Manual Adjustments 3 VAT',
    type: 'Current Liabilities',
    allowReconciliation: false,
    isActive: true,
  },
  {
    code: '221000',
    name: 'P.A.Y.E. & NI',
    type: 'Payable',
    allowReconciliation: true,
    isActive: true,
  },
  {
    code: '222000',
    name: 'Net Wages',
    type: 'Payable',
    allowReconciliation: true,
    isActive: true,
  },
  {
    code: '223000',
    name: 'Pension Fund',
    type: 'Payable',
    allowReconciliation: true,
    isActive: true,
  },
  {
    code: '230000',
    name: 'Loans',
    type: 'Current Liabilities',
    allowReconciliation: false,
    isActive: true,
  },
  {
    code: '231000',
    name: 'Hire Purchase',
    type: 'Current Liabilities',
    allowReconciliation: false,
    isActive: true,
  },
  {
    code: '232000',
    name: 'Corporation Tax',
    type: 'Payable',
    allowReconciliation: true,
    isActive: true,
  },
  {
    code: '233000',
    name: 'Mortgages',
    type: 'Current Liabilities',
    allowReconciliation: false,
    isActive: true,
  },
  {
    code: '300000',
    name: 'Share Capital',
    type: 'Equity',
    allowReconciliation: false,
    isActive: true,
  },
  {
    code: '310000',
    name: 'Retained Earnings',
    type: 'Equity',
    allowReconciliation: false,
    isActive: true,
  },
  {
    code: '400000',
    name: 'Sales Revenue',
    type: 'Income',
    allowReconciliation: true,
    isActive: true,
  },
  {
    code: '410000',
    name: 'Other Income',
    type: 'Income',
    allowReconciliation: true,
    isActive: true,
  },
  {
    code: '500000',
    name: 'Cost of Goods Sold',
    type: 'Expenses',
    allowReconciliation: true,
    isActive: true,
  },
  {
    code: '510000',
    name: 'Salaries and Wages',
    type: 'Expenses',
    allowReconciliation: true,
    isActive: true,
  },
  {
    code: '520000',
    name: 'Rent Expense',
    type: 'Expenses',
    allowReconciliation: true,
    isActive: true,
  },
  {
    code: '530000',
    name: 'Utilities Expense',
    type: 'Expenses',
    allowReconciliation: true,
    isActive: true,
  },
  {
    code: '540000',
    name: 'Depreciation Expense',
    type: 'Expenses',
    allowReconciliation: false,
    isActive: true,
  },
  {
    code: '550000',
    name: 'Office Supplies',
    type: 'Expenses',
    allowReconciliation: true,
    isActive: true,
  },
  {
    code: '560000',
    name: 'Insurance Expense',
    type: 'Expenses',
    allowReconciliation: true,
    isActive: true,
  },
  {
    code: '570000',
    name: 'Advertising Expense',
    type: 'Expenses',
    allowReconciliation: true,
    isActive: true,
  },
  {
    code: '580000',
    name: 'Travel Expense',
    type: 'Expenses',
    allowReconciliation: true,
    isActive: true,
  },
  {
    code: '590000',
    name: 'Maintenance Expense',
    type: 'Expenses',
    allowReconciliation: true,
    isActive: true,
  },
]

const accountTypes = [
  'Receivable',
  'Payable',
  'Equity',
  'Assets',
  'Liability',
  'Income',
  'Expenses',
]

const codeGroups: CodeGroup[] = [
  {
    id: '1',
    code: '1',
    isExpanded: false,
    subgroups: [
      { id: '11', code: '11' },
      { id: '12', code: '12' },
      { id: '13', code: '13' },
    ],
  },
  {
    id: '2',
    code: '2',
    isExpanded: false,
    subgroups: [
      { id: '21', code: '21' },
      { id: '22', code: '22' },
      { id: '23', code: '23' },
    ],
  },
  {
    id: '3',
    code: '3',
    isExpanded: false,
    subgroups: [
      { id: '30', code: '30' },
      { id: '31', code: '31' },
    ],
  },
  {
    id: '4',
    code: '4',
    isExpanded: false,
    subgroups: [
      { id: '40', code: '40' },
      { id: '41', code: '41' },
    ],
  },
  {
    id: '5',
    code: '5',
    isExpanded: false,
    subgroups: [
      { id: '50', code: '50' },
      { id: '51', code: '51' },
      { id: '52', code: '52' },
      { id: '53', code: '53' },
      { id: '54', code: '54' },
      { id: '55', code: '55' },
    ],
  },
  {
    id: '6',
    code: '6',
    isExpanded: false,
    subgroups: [{ id: '60', code: '60' }],
  },
]

export default function ChartOfAccountsTable() {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [selectedTypes, setSelectedTypes] = React.useState<string[]>([])
  const [showFilters, setShowFilters] = React.useState(false)
  const [activeAccountOnly, setActiveAccountOnly] = React.useState(false)
  const [accounts, setAccounts] = React.useState<Account[]>(initialAccounts)
  const [filteredAccounts, setFilteredAccounts] = React.useState(accounts)
  const [selectedCode, setSelectedCode] = React.useState<string | null>(null)
  const [groups, setGroups] = React.useState(codeGroups)
  const [isAddAccountOpen, setIsAddAccountOpen] = React.useState(false)
  const [isEditAccountOpen, setIsEditAccountOpen] = React.useState(false)
  const [editingAccount, setEditingAccount] = React.useState<Account | null>(
    null
  )

  React.useEffect(() => {
    let filtered = accounts.filter(
      (account) =>
        (account.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          account.type.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (selectedTypes.length === 0 || selectedTypes.includes(account.type)) &&
        (selectedCode ? account.code.startsWith(selectedCode) : true)
    )

    if (activeAccountOnly) {
      filtered = filtered.filter((account) => account.allowReconciliation)
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
          ? { ...account, allowReconciliation: checked }
          : account
      )
    )
    setFilteredAccounts((prevFilteredAccounts) =>
      prevFilteredAccounts.map((account) =>
        account.code === code
          ? { ...account, allowReconciliation: checked }
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
            if (group.subgroups) {
              toggleGroup(group.id)
            } else {
              setSelectedCode(group.code)
            }
          }}
        >
          {group.subgroups && (
            <ChevronRight
              className={cn(
                'h-4 w-4 shrink-0 transition-transform ',
                group.isExpanded && 'rotate-90'
              )}
            />
          )}
          <span>{group.code}</span>
        </Button>
        {group.isExpanded && group.subgroups && (
          <div className="pl-4 ml-6">{renderCodeGroups(group.subgroups)}</div>
        )}
      </div>
    ))
  }

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account)
    setIsEditAccountOpen(true)
  }

  const handleDisableAccount = (code: string) => {
    setAccounts((prevAccounts) =>
      prevAccounts.map((account) =>
        account.code === code
          ? { ...account, isActive: !account.isActive }
          : account
      )
    )
  }

  const handleSaveEdit = (editedAccount: Account) => {
    setAccounts((prevAccounts) =>
      prevAccounts.map((account) =>
        account.code === editedAccount.code ? editedAccount : account
      )
    )
    setIsEditAccountOpen(false)
    setEditingAccount(null)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="p-2">
        <div className="sticky top-16 bg-white flex items-center justify-between gap-4 border-b-2 mt-1 shadow-md p-2 z-20">
          <h2 className="text-xl font-semibold">Chart of Accounts</h2>
          <div className="flex items-center gap-2 flex-grow justify-center max-w-2xl">
            <div className="relative flex items-center border rounded-md pr-2 flex-grow">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-8 border-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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
          <Dialog open={isAddAccountOpen} onOpenChange={setIsAddAccountOpen}>
            <DialogTrigger asChild>
              <Button variant="default" size="sm" className="whitespace-nowrap">
                <Plus className="h-4 w-4 mr-2" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Account</DialogTitle>
              </DialogHeader>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Account Code</Label>
                  <Input id="code" placeholder="Enter account code" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Account Name</Label>
                  <Input id="name" placeholder="Enter account name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Account Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      {accountTypes.map((type) => (
                        <SelectItem key={type} value={type.toLowerCase()}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="allowReconciliation" />
                  <Label htmlFor="allowReconciliation">
                    Allow Reconciliation
                  </Label>
                </div>
                <Button type="submit" className="w-full">
                  Add Account
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex">
          <div className="fixed w-64 border-r bg-muted/50 ml-4 space-y-2 overflow-y-auto h-[calc(100vh-100px)]">
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

          <div className="ml-64 flex-1 pl-4">
            {showFilters && (
              <div className="sticky top-36 grid grid-cols-3 gap-4 mb-4 p-4 border rounded-lg bg-white shadow-2xl lg:mx-52 z-20">
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
                        className="w-full justify-between"
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
                        className="w-full justify-between"
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

            <div className="border rounded-md overflow-hidden">
              <div className="overflow-auto max-h-[calc(100vh-200px)]">
                <Table>
                  <TableHeader className="sticky top-0 bg-[#e0e0e0] z-10">
                    <TableRow className="">
                      <TableHead className="w-[100px]">Code</TableHead>
                      <TableHead>Account Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-center">
                        Allow Reconciliation
                      </TableHead>
                      <TableHead className="w-[200px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAccounts.map((account) => (
                      <TableRow key={account.code}>
                        <TableCell>{account.code}</TableCell>
                        <TableCell>{account.name}</TableCell>
                        <TableCell>{account.type}</TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={account.allowReconciliation}
                            onCheckedChange={(checked) =>
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
                              onClick={() => handleDisableAccount(account.code)}
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
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                1-{filteredAccounts.length} / {accounts.length}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" disabled>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" disabled>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

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
              <div className="space-y-2">
                <Label htmlFor="edit-code">Account Code</Label>
                <Input
                  id="edit-code"
                  value={editingAccount.code}
                  onChange={(e) =>
                    setEditingAccount({
                      ...editingAccount,
                      code: e.target.value,
                    })
                  }
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
              <div className="space-y-2">
                <Label htmlFor="edit-type">Account Type</Label>
                <Select
                  value={editingAccount.type}
                  onValueChange={(value) =>
                    setEditingAccount({ ...editingAccount, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue>{editingAccount.type}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {accountTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-allowReconciliation"
                  checked={editingAccount.allowReconciliation}
                  onCheckedChange={(checked) =>
                    setEditingAccount({
                      ...editingAccount,
                      allowReconciliation: checked as boolean,
                    })
                  }
                />
                <Label htmlFor="edit-allowReconciliation">
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
