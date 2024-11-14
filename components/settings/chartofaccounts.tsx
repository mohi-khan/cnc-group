'use client'

import { useState } from 'react'
import { Search, ChevronDown, Star, X, ChevronsUpDown } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

type FilterType = {
    type: string
    value: string
}

export default function ChartOfAccounts() {
    const [filters, setFilters] = useState<FilterType[]>([{ type: 'account', value: 'Active Account' }])
    const [searchInput, setSearchInput] = useState('')
    const [groupBy, setGroupBy] = useState('account-type')
    const [isFilterPageVisible, setIsFilterPageVisible] = useState(false)

    const addFilter = (type: string, value: string) => {
        if (!filters.some(f => f.value === value)) {
            setFilters(prev => [...prev, { type, value }])
        }
    }

    const removeFilter = (index: number) => {
        setFilters(prev => prev.filter((_, i) => i !== index))
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchInput) {
            addFilter('custom', searchInput)
            setSearchInput('')
        }
    }

    const toggleFilterPage = () => {
        setIsFilterPageVisible(prev => !prev)
    }

    const filterOptions = [
        'Receivable', 'Payable', 'Equity', 'Assets', 'Liability', 'Income', 'Expenses', 'Account with Entries', 'Active Account'
    ]

    const groupByOptions = ['Account Type', 'Balance', 'Status']

    return (
        <div className="p-6 max-w-3xl mx-auto bg-background">
            <div className="flex items-center space-x-2 mb-6">
                <div className="relative flex-grow">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search..."
                        className="pl-8 pr-4 py-2 w-full"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </div>
                <Button
                    variant="outline"
                    className="p-2"
                    onClick={toggleFilterPage}
                    aria-expanded={isFilterPageVisible}
                    aria-controls="filter-page"
                >
                    <ChevronsUpDown className="h-4 w-4" />
                    <span className="sr-only">Toggle filter options</span>
                </Button>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
                {filters.map((filter, index) => (
                    <Badge key={index} variant="secondary" className="text-sm py-1 px-2">
                        {filter.value}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="ml-1 h-4 w-4 p-0"
                            onClick={() => removeFilter(index)}
                        >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove {filter.value} filter</span>
                        </Button>
                    </Badge>
                ))}
            </div>

            {isFilterPageVisible && (
                <div id="filter-page" className="grid grid-cols-3 gap-6">
                    <div>
                        <h2 className="font-semibold mb-4 flex items-center text-primary text-lg">
                            Filters
                        </h2>
                        <div className="space-y-2">
                            {filterOptions.map((item) => (
                                <div key={item} className="flex items-center">
                                    <Checkbox
                                        id={item.toLowerCase().replace(/\s+/g, '-')}
                                        checked={filters.some(f => f.value === item)}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                addFilter('filter', item)
                                            } else {
                                                setFilters(prev => prev.filter(f => f.value !== item))
                                            }
                                        }}
                                    />
                                    <label htmlFor={item.toLowerCase().replace(/\s+/g, '-')} className="ml-2 text-sm">{item}</label>
                                </div>
                            ))}
                        </div>
                        <Button variant="ghost" className="w-full justify-start mt-4 text-sm">
                            Add Custom Filter
                        </Button>
                    </div>

                    <div>
                        <h2 className="font-semibold mb-4 text-primary text-lg">Group By</h2>
                        <Select value={groupBy} onValueChange={setGroupBy}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select grouping" />
                            </SelectTrigger>
                            <SelectContent>
                                {groupByOptions.map((option) => (
                                    <SelectItem key={option.toLowerCase().replace(/\s+/g, '-')} value={option.toLowerCase().replace(/\s+/g, '-')}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button variant="ghost" className="w-full justify-start mt-4 text-sm">
                            Add Custom Group
                            <ChevronDown className="h-4 w-4 ml-2" />
                        </Button>
                    </div>

                    <div>
                        <h2 className="font-semibold mb-4 flex items-center text-primary text-lg">
                            <Star className="h-5 w-5 mr-2 fill-primary" />
                            Favorites
                        </h2>
                        <Button variant="ghost" className="w-full justify-start text-sm mb-2">
                            Chart of Accounts
                        </Button>
                        <Button variant="ghost" className="w-full justify-start text-sm">
                            Save current search
                            <ChevronDown className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}