import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
export default function TrialBalanceTable() {
  return (
    <div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center" colSpan={2}>
                Initial Balance
              </TableHead>
              <TableHead className="text-center" colSpan={2}>
                2024
              </TableHead>
              <TableHead className="text-center" colSpan={2}>
                2025
              </TableHead>
              <TableHead className="text-center" colSpan={2}>
                End Balance
              </TableHead>
            </TableRow>
            <TableRow>
              <TableHead className="text-center">Debit</TableHead>
              <TableHead className="text-center">Credit</TableHead>
              <TableHead className="text-center">Debit</TableHead>
              <TableHead className="text-center">Credit</TableHead>
              <TableHead className="text-center">Debit</TableHead>
              <TableHead className="text-center">Credit</TableHead>
              <TableHead className="text-center">Debit</TableHead>
              <TableHead className="text-center">Credit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Total</TableCell>
              <TableCell className="text-center text-muted-foreground">
                0.00
              </TableCell>
              <TableCell className="text-center text-muted-foreground">
                0.00
              </TableCell>
              <TableCell className="text-center text-muted-foreground">
                0.00
              </TableCell>
              <TableCell className="text-center text-muted-foreground">
                0.00
              </TableCell>
              <TableCell className="text-center text-muted-foreground">
                0.00
              </TableCell>
              <TableCell className="text-center text-muted-foreground">
                0.00
              </TableCell>
              <TableCell className="text-center text-muted-foreground">
                0.00
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
