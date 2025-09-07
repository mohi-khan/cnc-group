'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { useAtom } from 'jotai'
import { tokenAtom, useInitializeUser } from '@/utils/user'
import { getCashFlowDFP } from '@/api/cash-flow-DFP-api'
import { toast } from '@/hooks/use-toast'
import type { GetCashFlowDFPType } from '@/utils/type'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FileText, File } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'
import Loader from '@/utils/loader'

function formatCurrency(amount: number): string {
  return amount.toLocaleString()
}

const CashFlowDFP = () => {
  useInitializeUser()
  const [token] = useAtom(tokenAtom)
  const router = useRouter()
  const [cashFlowDFP, setCashFlowDFP] = useState<GetCashFlowDFPType[]>([])
  const [loading, setLoading] = useState(false)

  const fetchCashFlowDFP = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const response = await getCashFlowDFP(token)

      if (response?.error?.status === 401) {
        // only push inside useEffect after mount
        setTimeout(() => {
          router.push('/unauthorized-access')
        }, 0)
        return
      } else if (response.error || !response.data) {
        toast({
          title: 'Error',
          description:
            response.error?.message || 'Failed to fetch Cash Flow DFP',
          variant: 'destructive',
        })
      } else {
        setCashFlowDFP(response.data)
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to fetch Cash Flow DFP',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [token, router])

  useEffect(() => {
    fetchCashFlowDFP()
  }, [fetchCashFlowDFP])

  const generatePdf = async () => {
    const element = document.getElementById('cash-flow-dfp-content')
    if (!element) return

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      })

      const imgData = canvas.toDataURL('image/jpeg')
      const pdf = new jsPDF('p', 'mm', 'a4')

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height

      // Calculate scaling to fit width while maintaining aspect ratio
      const scale = pdfWidth / (imgWidth * 0.264583) // Convert pixels to mm
      const scaledHeight = imgHeight * 0.264583 * scale

      const headerHeight = 20
      const pageContentHeight = pdfHeight - headerHeight - 10

      let yPosition = 0
      let pageNumber = 1

      while (yPosition < scaledHeight) {
        if (pageNumber > 1) {
          pdf.addPage()
        }

        // Add company name header on each page
        pdf.setFontSize(16)
        pdf.setFont('helvetica', 'bold')
        pdf.text('CNC GROUP', pdfWidth / 2, 15, { align: 'center' })

        // Add report title
        pdf.setFontSize(14)
        pdf.text('Cash Flow DFP Report', pdfWidth / 2, 25, { align: 'center' })

        // Calculate the portion of image to show on this page
        const remainingHeight = scaledHeight - yPosition
        const currentPageHeight = Math.min(pageContentHeight, remainingHeight)

        // Add the image portion to PDF
        pdf.addImage(
          imgData,
          'JPEG',
          0,
          headerHeight,
          pdfWidth,
          currentPageHeight
        )

        yPosition += pageContentHeight
        pageNumber++
      }

      pdf.save('cash-flow-dfp-report.pdf')
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate PDF',
        variant: 'destructive',
      })
    }
  }

  const exportToExcel = () => {
    try {
      const worksheetData: any[][] = []

      // Add headers
      worksheetData.push([
        'Company',
        'LC Under Process',
        'Doc Negotiate With Bank',
        'Accepted Value',
        'Matured Value',
      ])

      // Add data rows
      cashFlowDFP.forEach((item) => {
        worksheetData.push([
          item.company_name,
          item.LCUnderProcess,
          item.DocNegotiateWithBank,
          item.AcceptedValue,
          item.MaturedValue,
        ])
      })

      // Calculate totals
      const totals = cashFlowDFP.reduce(
        (acc, item) => ({
          LCUnderProcess: acc.LCUnderProcess + item.LCUnderProcess,
          DocNegotiateWithBank:
            acc.DocNegotiateWithBank + item.DocNegotiateWithBank,
          AcceptedValue: acc.AcceptedValue + item.AcceptedValue,
          MaturedValue: acc.MaturedValue + item.MaturedValue,
        }),
        {
          LCUnderProcess: 0,
          DocNegotiateWithBank: 0,
          AcceptedValue: 0,
          MaturedValue: 0,
        }
      )

      // Add total row
      worksheetData.push([
        'Total',
        totals.LCUnderProcess,
        totals.DocNegotiateWithBank,
        totals.AcceptedValue,
        totals.MaturedValue,
      ])

      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Cash Flow DFP')

      XLSX.writeFile(workbook, 'cash-flow-dfp-report.xlsx')
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      toast({
        title: 'Error',
        description: 'Failed to export to Excel',
        variant: 'destructive',
      })
    }
  }

  const totals = cashFlowDFP.reduce(
    (acc, item) => ({
      LCUnderProcess: acc.LCUnderProcess + item.LCUnderProcess,
      DocNegotiateWithBank:
        acc.DocNegotiateWithBank + item.DocNegotiateWithBank,
      AcceptedValue: acc.AcceptedValue + item.AcceptedValue,
      MaturedValue: acc.MaturedValue + item.MaturedValue,
    }),
    {
      LCUnderProcess: 0,
      DocNegotiateWithBank: 0,
      AcceptedValue: 0,
      MaturedValue: 0,
    }
  )

  return (
    <main className="w-full p-6 space-y-6">
      <div className="flex gap-2 justify-end pr-5">
        <Button
          onClick={generatePdf}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-900 hover:bg-purple-200"
          disabled={loading || cashFlowDFP.length === 0}
        >
          <FileText className="h-4 w-4" />
          PDF
        </Button>
        <Button
          onClick={exportToExcel}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-900 hover:bg-green-200"
          disabled={loading || cashFlowDFP.length === 0}
        >
          <File className="h-4 w-4" />
          Excel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-center flex-1">
              CNC GROUP - Cash Flow DFP Report
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div id="cash-flow-dfp-content">
            {loading ? (
              <div className="text-sm text-muted-foreground">
                <Loader />
              </div>
            ) : cashFlowDFP.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No Cash Flow DFP records found.
              </div>
            ) : (
              <div className="space-y-8">
                <div className="overflow-x-auto">
                  <Table className="border shadow-md">
                    <TableHeader className="bg-slate-200 shadow-md">
                      <TableRow>
                        <TableHead className="w-12">Sl #</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead className="text-right">
                          LC Under Process
                        </TableHead>
                        <TableHead className="text-right">
                          Doc Negotiate With Bank
                        </TableHead>
                        <TableHead className="text-right">
                          Accepted Value
                        </TableHead>
                        <TableHead className="text-right">
                          Matured Value
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cashFlowDFP.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">
                            {idx + 1}
                          </TableCell>
                          <TableCell>{item.company_name}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.LCUnderProcess)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.DocNegotiateWithBank)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.AcceptedValue)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.MaturedValue)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-8">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableBody>
                        <TableRow className="bg-yellow-200 hover:bg-yellow-200 font-bold">
                          <TableCell className="font-bold">
                            Grand Total
                          </TableCell>
                          <TableCell></TableCell>
                          <TableCell className="text-right font-bold">
                            {formatCurrency(totals.LCUnderProcess)}
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {formatCurrency(totals.DocNegotiateWithBank)}
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {formatCurrency(totals.AcceptedValue)}
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {formatCurrency(totals.MaturedValue)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

export default CashFlowDFP
