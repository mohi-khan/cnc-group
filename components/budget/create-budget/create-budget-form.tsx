// 'use client'

// import React, { useState, useEffect } from 'react'
// import { Button } from '@/components/ui/button'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select'
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table'
// import { getAllCoa } from '@/api/budget-api'
// import { toast } from '@/hooks/use-toast'
// import { AccountsHead } from '@/utils/type'

// interface BudgetLine {
//   id: string
//   accounthead: string
//   budgeted: string
// }

// const CreateBudgetForm = () => {
//   const [budgetLines, setBudgetLines] = useState<BudgetLine[]>([])
//   const [accounts, setAccounts] = useState<AccountsHead[]>([])
//   const [budgetType, setBudgetType] = useState<string>('both') // Default is 'both'

//   useEffect(() => {
//     async function fetchCoaAccounts() {
//       const fetchedAccounts = await getAllCoa()
//       console.log('Fetched chart of accounts:', fetchedAccounts)

//       if (fetchedAccounts.error || !fetchedAccounts.data) {
//         console.error(
//           'Error fetching chart of accounts:',
//           fetchedAccounts.error
//         )
//         toast({
//           variant: 'destructive',
//           title: 'Error',
//           description:
//             fetchedAccounts.error?.message ||
//             'Failed to fetch chart of accounts',
//         })
//       } else {
//         setAccounts(fetchedAccounts.data)
//       }
//     }

//     fetchCoaAccounts()
//   }, [])

//   const addBudgetLine = () => {
//     setBudgetLines([
//       ...budgetLines,
//       {
//         id: Math.random().toString(36).substr(2, 9),
//         accounthead: '',
//         budgeted: '',
//       },
//     ])
//   }

//   const updateBudgetLine = (
//     id: string,
//     field: 'accounthead' | 'budgeted',
//     value: string
//   ) => {
//     setBudgetLines(
//       budgetLines.map((line) =>
//         line.id === id ? { ...line, [field]: value } : line
//       )
//     )
//   }

//   const total = budgetLines.reduce((sum, line) => {
//     const amount = Number.parseFloat(line.budgeted.replace(/,/g, '')) || 0
//     return sum + amount
//   }, 0)

//   return (
//     <Card className="shadow-lg border-2 max-w-7xl mx-auto">
//       <CardHeader>
//         <CardTitle>
//           <div className="space-y-4">
//             <div>
//               <Label htmlFor="budgetName">Budget Name</Label>
//               <Input
//                 id="budgetName"
//                 placeholder="e.g. Budget 2023"
//                 className="mt-1.5"
//               />
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <Label>Budget Type</Label>
//                 <Select value={budgetType} onValueChange={setBudgetType}>
//                   <SelectTrigger className="mt-1.5">
//                     <SelectValue placeholder="Select budget type" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="expense">Expense</SelectItem>
//                     <SelectItem value="income">Income</SelectItem>
//                     <SelectItem value="both">Both</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div>
//                 <Label>Period</Label>
//                 <div className="flex items-center gap-2 mt-1.5">
//                   <Input type="date" defaultValue="2025-02-01" />
//                   <span>→</span>
//                   <Input type="date" defaultValue="2025-06-30" />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </CardTitle>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-4">
//           <h3 className="font-medium">Budget Lines</h3>

//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Account Head</TableHead>
//                 <TableHead className="text-right">Budgeted</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {budgetLines.map((line) => (
//                 <TableRow className="shadow-md border rounded-lg" key={line.id}>
//                   <TableCell>
//                     <Select
//                       value={line.accounthead}
//                       onValueChange={(value) =>
//                         updateBudgetLine(line.id, 'accounthead', value)
//                       }
//                     >
//                       <SelectTrigger className="w-full">
//                         <SelectValue placeholder="Select account head" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {accounts
//                           .filter((account) => {
//                             return (
//                               account.accountId.toString() ===
//                                 line.accounthead ||
//                               budgetType.toLowerCase() === 'both' ||
//                               account.accountType.toLowerCase() ===
//                                 budgetType.toLowerCase()
//                             )
//                           })
//                           .map((account) => (
//                             <SelectItem
//                               key={account.accountId}
//                               value={account.accountId.toString()}
//                             >
//                               {account.name}
//                             </SelectItem>
//                           ))}
//                       </SelectContent>
//                     </Select>
//                   </TableCell>
//                   <TableCell className="text-right">
//                     <Input
//                       type="number"
//                       value={line.budgeted}
//                       onChange={(e) =>
//                         updateBudgetLine(line.id, 'budgeted', e.target.value)
//                       }
//                       className="w-full text-right"
//                     />
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>

//           <Button
//             variant="outline"
//             className="text-primary"
//             onClick={addBudgetLine}
//           >
//             Add a line
//           </Button>

//           <div className="flex justify-end border-t pt-4">
//             <div className="text-right">
//               <div className="text-sm text-muted-foreground">Total</div>
//               <div className="text-lg font-medium">
//                 {total.toLocaleString('en-US', {
//                   minimumFractionDigits: 2,
//                   maximumFractionDigits: 2,
//                 })}
//               </div>
//             </div>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }

// export default CreateBudgetForm

'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { getAllCoa } from '@/api/budget-api'
import { toast } from '@/hooks/use-toast'
import type { AccountsHead } from '@/utils/type'

interface BudgetLine {
  id: string
  accounthead: string
  budgeted: string
}

interface CreateBudgetFormProps {
  onDataChange: (data: any) => void
}

const CreateBudgetForm: React.FC<CreateBudgetFormProps> = ({
  onDataChange,
}) => {
  const [budgetLines, setBudgetLines] = useState<BudgetLine[]>([])
  const [accounts, setAccounts] = useState<AccountsHead[]>([])
  const [budgetType, setBudgetType] = useState<string>('both')
  const [budgetName, setBudgetName] = useState<string>('')
  const [startDate, setStartDate] = useState<string>('2025-02-01')
  const [endDate, setEndDate] = useState<string>('2025-06-30')

  useEffect(() => {
    async function fetchCoaAccounts() {
      const fetchedAccounts = await getAllCoa()
      console.log('Fetched chart of accounts:', fetchedAccounts)

      if (fetchedAccounts.error || !fetchedAccounts.data) {
        console.error(
          'Error fetching chart of accounts:',
          fetchedAccounts.error
        )
        toast({
          variant: 'destructive',
          title: 'Error',
          description:
            fetchedAccounts.error?.message ||
            'Failed to fetch chart of accounts',
        })
      } else {
        setAccounts(fetchedAccounts.data)
      }
    }

    fetchCoaAccounts()
  }, [])

  useEffect(() => {
    const budgetData = {
      budgetName,
      budgetType,
      startDate,
      endDate,
      budgetLines,
    }
    onDataChange(budgetData)
  }, [budgetName, budgetType, startDate, endDate, budgetLines, onDataChange])

  const addBudgetLine = () => {
    setBudgetLines([
      ...budgetLines,
      {
        id: Math.random().toString(36).substr(2, 9),
        accounthead: '',
        budgeted: '',
      },
    ])
  }

  const updateBudgetLine = (
    id: string,
    field: 'accounthead' | 'budgeted',
    value: string
  ) => {
    setBudgetLines(
      budgetLines.map((line) =>
        line.id === id ? { ...line, [field]: value } : line
      )
    )
  }

  const total = budgetLines.reduce((sum, line) => {
    const amount = Number.parseFloat(line.budgeted.replace(/,/g, '')) || 0
    return sum + amount
  }, 0)

  return (
    <Card className="shadow-lg border-2 max-w-7xl mx-auto">
      <CardHeader>
        <CardTitle>
          <div className="space-y-4">
            <div>
              <Label htmlFor="budgetName">Budget Name</Label>
              <Input
                id="budgetName"
                placeholder="e.g. Budget 2023"
                className="mt-1.5"
                value={budgetName}
                onChange={(e) => setBudgetName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Budget Type</Label>
                <Select value={budgetType} onValueChange={setBudgetType}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select budget type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Period</Label>
                <div className="flex items-center gap-2 mt-1.5">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <span>→</span>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <h3 className="font-medium">Budget Lines</h3>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account Head</TableHead>
                <TableHead className="text-right">Budgeted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgetLines.map((line) => (
                <TableRow className="shadow-md border rounded-lg" key={line.id}>
                  <TableCell>
                    <Select
                      value={line.accounthead}
                      onValueChange={(value) =>
                        updateBudgetLine(line.id, 'accounthead', value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select account head" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts
                          .filter((account) => {
                            return (
                              account.accountId.toString() ===
                                line.accounthead ||
                              budgetType.toLowerCase() === 'both' ||
                              account.accountType.toLowerCase() ===
                                budgetType.toLowerCase()
                            )
                          })
                          .map((account) => (
                            <SelectItem
                              key={account.accountId}
                              value={account.accountId.toString()}
                            >
                              {account.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      value={line.budgeted}
                      onChange={(e) =>
                        updateBudgetLine(line.id, 'budgeted', e.target.value)
                      }
                      className="w-full text-right"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Button
            variant="outline"
            className="text-primary"
            onClick={addBudgetLine}
          >
            Add a line
          </Button>

          <div className="flex justify-end border-t pt-4">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Total</div>
              <div className="text-lg font-medium">
                {total.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default CreateBudgetForm

