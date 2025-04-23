'use client'
import {  getAllTradeDebtors } from '@/api/trade-debtors-api'
import { GetTradeDebtorsType } from '@/utils/type'
import React, { useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { CompanyType } from '@/api/company-api'
import { CustomCombobox } from '@/utils/custom-combobox'
import { usePDF } from 'react-to-pdf'
import { FileText } from 'lucide-react'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { getAllCompanies } from '@/api/common-shared-api'

const TradeDebtors = () => {
  const [tradeDebtors, setTradeDebtors] = React.useState<GetTradeDebtorsType[]>(
    []
  )
  const { toPDF, targetRef } = usePDF({ filename: 'trade_debtors.pdf' })
  const [companies, setCompanies] = React.useState<CompanyType[]>([])
  const [selectedCompanyName, setSelectedCompanyName] =
    React.useState<string>('')

  const generatePdf = () => {
    toPDF()
  }

  // fetch trade debtors data from API
  const fetchTradeDebtors = async () => {
    const response = await getAllTradeDebtors()
    console.log('This is from trade debtors:', response.data)
    setTradeDebtors(response.data || [])
  }

  // fetch ALl companys data from API
  const fetchCompanies = async () => {
    const response = await getAllCompanies()
    console.log('This is from companies:', response.data)
    setCompanies(response.data || [])
  }

  useEffect(() => {
    fetchTradeDebtors()
    fetchCompanies()
  }, [])

  const filteredTradeDebtors = selectedCompanyName
    ? tradeDebtors.filter(
        (debtor) => debtor.companyName === selectedCompanyName
      )
    : tradeDebtors
  
  
  const exportToExcel = (data: GetTradeDebtorsType[], fileName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(flattenData(data))
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Trial Balance')
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    })
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    })
    saveAs(blob, `${fileName}.xlsx`)
  }

    const flattenData = (data: GetTradeDebtorsType[]): any[] => {
      return data.map((item) => ({
        partnerName: item.partnerName,
        crebalanceCurrentYeardit: item.balanceCurrentYear,
        balanceLastYear: item.balanceLastYear,
      }))
  }
  
   const generateExcel = () => {
     exportToExcel(tradeDebtors, 'trade-debtors')
   }


  return (
    <div className="mt-10 mx-20 ">
      <div className="mb-4 flex justify-center w-full">
        <div className="w-96">
          <CustomCombobox
            items={companies.map((company) => {
              console.log('Company structure in map:', company)
              return {
                id: company.companyId?.toString() || '',
                name: company.companyName || 'Unnamed Company',
              }
            })}
            value={
              selectedCompanyName
                ? {
                    id:
                      companies
                        .find((c) => c.companyName === selectedCompanyName)
                        ?.companyId?.toString() || '',
                    name: selectedCompanyName,
                  }
                : null
            }
            onChange={(value) =>
              setSelectedCompanyName(value ? value.name : '')
            }
            placeholder="Select company"
          />
        </div>
      </div>
      <div className="flex gap-2 mb-4">
          <Button
            onClick={generatePdf}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-900 hover:bg-purple-200"
          >
            <FileText className="h-4 w-4" />
            <span className="font-medium">PDF</span>
          </Button>
          <Button
            onClick={generateExcel}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-900 hover:bg-green-200"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14.5 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V7.5L14.5 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 2V8H20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 13H16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 17H16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 9H8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="font-medium">Excel</span>
          </Button>
        </div>
      <div ref={targetRef} className="overflow-x-auto mx-4">
        <h1 className="text-3xl font-bold mb-4 flex justify-center">
          {selectedCompanyName || 'All Companies'}
        </h1>
        <h2 className="text-2xl font-bold mb-4">Trade Debtors</h2>
        <Table className="border shadow-md ">
          <TableHeader className="bg-slate-200 sticky top- shadow-md">
            <TableRow className="mb-4">
              <TableHead>Partner Name</TableHead>
              <TableHead>Balance Current Year</TableHead>
              <TableHead>Balance Last Year</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTradeDebtors.map((debtor) => (
              <TableRow key={debtor.partnerId}>
                <TableCell>{debtor.partnerName}</TableCell>
                <TableCell>{debtor.balanceCurrentYear}</TableCell>
                <TableCell>{debtor.balanceLastYear}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )}

export default TradeDebtors
