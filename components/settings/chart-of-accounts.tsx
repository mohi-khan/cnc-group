
"use client"

import * as React from "react"
import { Search, ChevronLeft, ChevronRight, X, Filter, Group, Star, ChevronDown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

interface Account {
    code: string
    name: string
    type: string
    allowReconciliation: boolean
}

const accounts: Account[] = [
    { code: "210100", name: "Sundry Creditors", type: "Current Liabilities", allowReconciliation: false },
    { code: "210200", name: "Other Creditors", type: "Current Liabilities", allowReconciliation: false },
    { code: "210900", name: "Accruals", type: "Current Liabilities", allowReconciliation: false },
    { code: "215000", name: "Bad debt provision", type: "Current Liabilities", allowReconciliation: false },
    { code: "220000", name: "Sales Tax Control Account", type: "Current Liabilities", allowReconciliation: false },
    { code: "220100", name: "Purchase Tax Control Account", type: "Current Assets", allowReconciliation: false },
    { code: "220200", name: "HMRC - VAT Account", type: "Payable", allowReconciliation: true },
    { code: "220400", name: "Manual Adjustments 3 VAT", type: "Current Liabilities", allowReconciliation: false },
    { code: "221000", name: "P.A.Y.E. & NI", type: "Payable", allowReconciliation: true },
    { code: "222000", name: "Net Wages", type: "Payable", allowReconciliation: true },
    { code: "223000", name: "Pension Fund", type: "Payable", allowReconciliation: true },
    { code: "230000", name: "Loans", type: "Current Liabilities", allowReconciliation: false },
    { code: "231000", name: "Hire Purchase", type: "Current Liabilities", allowReconciliation: false },
    { code: "232000", name: "Corporation Tax", type: "Payable", allowReconciliation: true },
    { code: "233000", name: "Mortgages", type: "Current Liabilities", allowReconciliation: false },
]

const accountTypes = [
    "Receivable",
    "Payable",
    "Equity",
    "Assets",
    "Liability",
    "Income",
    "Expenses",
]

export default function Component() {
    const [searchTerm, setSearchTerm] = React.useState("")
    const [selectedTypes, setSelectedTypes] = React.useState<string[]>([])
    const [showFilters, setShowFilters] = React.useState(false)
    const [activeAccountOnly, setActiveAccountOnly] = React.useState(false)
    const [filteredAccounts, setFilteredAccounts] = React.useState(accounts)

    React.useEffect(() => {
        let filtered = accounts.filter(account =>
            (account.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                account.type.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (selectedTypes.length === 0 || selectedTypes.includes(account.type))
        )

        if (activeAccountOnly) {
            filtered = filtered.filter(account => account.allowReconciliation)
        }

        setFilteredAccounts(filtered)
    }, [searchTerm, selectedTypes, activeAccountOnly])

    const removeFilter = (filter: string) => {
        setSelectedTypes(selectedTypes.filter(type => type !== filter))
    }

    return (
        <div className="w-full p-4">
            <div className="flex items-center mb-4 gap-72">
                <h2 className="text-xl font-semibold ml-20">Chart of Accounts</h2>
                <div className="flex  justify-center gap-2">

                    <div className=" flex items-center justify-start gap-2">
                        <div className="relative flex items-center border rounded-md pr-2">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search..."
                                className="pl-8 border-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <div className="flex gap-1">
                                {selectedTypes.map((type) => (
                                    <Badge key={type} variant="secondary" className="gap-1 px-2 py-1 ring-1">
                                        {type}
                                        <X
                                            className="h-3 w-3 cursor-pointer"
                                            onClick={() => removeFilter(type)}
                                        />
                                    </Badge>
                                ))}
                            </div>
                        </div>

                    </div>

                    <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
                        <Filter className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {showFilters && (
                <div className="absolute grid grid-cols-3 gap-4 mb-4 p-4 border rounded-lg bg-white shadow-2xl z-10">
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
                                        onCheckedChange={(checked) => {
                                            setSelectedTypes(checked
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
                                    onCheckedChange={(checked) => setActiveAccountOnly(checked as boolean)}
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
                                <Button variant="outline" className="w-full justify-between">
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
                                <Button variant="outline" className="w-full justify-between">
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



            <Table>
                <TableHeader>
                    <TableRow className="sticky top-0 bg-white">
                        <TableHead className="w-[100px]">Code</TableHead>
                        <TableHead>Account Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-center">Allow Reconciliation</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredAccounts.map((account) => (
                        <TableRow key={account.code}>
                            <TableCell>{account.code}</TableCell>
                            <TableCell>{account.name}</TableCell>
                            <TableCell>{account.type}</TableCell>
                            <TableCell className="text-center">
                                <Switch checked={account.allowReconciliation} />
                            </TableCell>
                            <TableCell>
                                <Button variant="ghost" size="sm" className="text-blue-600">
                                    View
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                    1-16 / 16
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
    )
}