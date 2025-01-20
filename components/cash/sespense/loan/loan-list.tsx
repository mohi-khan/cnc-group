'use client'
import React from 'react'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from '@/components/ui/table'

import { Button } from '@/components/ui/button'
import { IouRecordGetType } from '@/utils/type'

interface LoanstProps {
  loanDatas: IouRecordGetType[] // Asset data type
  //   onAddCategory: () => void
}

const LoanList: React.FC<LoanstProps> = ({ loanDatas }) => {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Loan List</h1>
        <Button>Add Loan List</Button>
      </div>

      {/* Table Section */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ammount</TableHead>
            <TableHead>Employee Name</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead>Due Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loanDatas.map((loanData) => (
            <TableRow key={loanData.iouId}>
              <TableCell>{loanData.amount}</TableCell>
              <TableCell>{loanData.employeeId}</TableCell>
              <TableCell>{loanData.notes}</TableCell>
              <TableCell>{loanData.dueDate}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default LoanList
