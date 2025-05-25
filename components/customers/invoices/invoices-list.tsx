'use client'

import React, { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getInvoiceData, getInvoiceById } from '@/api/invoices-api'
import { SalesInvoiceType } from '@/utils/type'
import { tokenAtom, useInitializeUser } from '@/utils/user'
import { useAtom } from 'jotai'
import Loader from '@/utils/loader'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const InvoicesList = () => {
  useInitializeUser()

  const [token] = useAtom(tokenAtom)
  const [invoices, setInvoices] = useState<SalesInvoiceType[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<SalesInvoiceType | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const fetchInvoices = React.useCallback(async () => {
    try {
      const response = await getInvoiceData(token)
      console.log('Invoice response:', response)
        const invoiceList = response?.data || []
        console.log('Invoice List:', invoiceList)
      setInvoices(invoiceList)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }, [token])

  const handleInvoiceClick = React.useCallback(async (id: number) => {
    const response = await getInvoiceById(token, id)
      setSelectedInvoice(response.data)
    setIsDialogOpen(true)
  }, [token])
    
  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600">Error: {error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Sales Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full mx-auto mr-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>LCPI No</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Shipper</TableHead>
                  <TableHead>Consignee</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Consign Address</TableHead>
                  <TableHead>Approved By</TableHead>
                  <TableHead>Approval Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Partner ID</TableHead>
                  <TableHead>Partner Name</TableHead>
                  <TableHead>Company ID</TableHead>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Currency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!Array.isArray(invoices) || invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={15} className="text-center py-8">
                      <Loader />
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((invoice, id) => (
                    <TableRow key={id}>
                      <TableCell className="font-medium">
                        <Badge 
                          variant="outline" 
                          className="cursor-pointer hover:bg-slate-100"
                          onClick={() => handleInvoiceClick(invoice.id)}
                        >
                          {invoice.LCPINo}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(invoice.date)}</TableCell>
                      <TableCell>{invoice.shipper}</TableCell>
                      <TableCell>{invoice.consignee}</TableCell>
                      <TableCell>{invoice.client}</TableCell>
                      <TableCell
                        className="max-w-xs truncate"
                        title={invoice.address}
                      >
                        {invoice.address}
                      </TableCell>
                      <TableCell
                        className="max-w-xs truncate"
                        title={invoice.consignAddress}
                      >
                        {invoice.consignAddress}
                      </TableCell>
                      <TableCell>{invoice.apporvedBy}</TableCell>
                      <TableCell>{formatDate(invoice.approvalDate)}</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(
                          invoice.invoiceAmount,
                          invoice.currencyName
                        )}
                      </TableCell>
                      <TableCell>{invoice.res_partnerId}</TableCell>
                      <TableCell>{invoice.res_partnerName}</TableCell>
                      <TableCell>{invoice.companyId}</TableCell>
                      <TableCell>{invoice.companyName}</TableCell>
                      <TableCell>{invoice.currencyName}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="font-semibold">LCPI No:</div>
                <div>{selectedInvoice.LCPINo}</div>
                <div className="font-semibold">Date:</div>
                <div>{formatDate(selectedInvoice.date)}</div>
                <div className="font-semibold">Amount:</div>
                <div>{formatCurrency(selectedInvoice.invoiceAmount, selectedInvoice.currencyName)}</div>
                <div className="font-semibold">Shipper:</div>
                <div>{selectedInvoice.shipper}</div>
                <div className="font-semibold">Consignee:</div>
                <div>{selectedInvoice.consignee}</div>
                <div className="font-semibold">Client:</div>
                <div>{selectedInvoice.client}</div>
                <div className="font-semibold">Address:</div>
                <div>{selectedInvoice.address}</div>
                <div className="font-semibold">Consign Address:</div>
                <div>{selectedInvoice.consignAddress}</div>
                <div className="font-semibold">Approved By:</div>
                <div>{selectedInvoice.apporvedBy}</div>
                <div className="font-semibold">Approval Date:</div>
                <div>{formatDate(selectedInvoice.approvalDate)}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default InvoicesList
