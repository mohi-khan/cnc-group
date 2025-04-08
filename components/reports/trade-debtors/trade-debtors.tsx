'use client'
import { getAllCompany, getAllTradeDebtors } from '@/api/trade-debtors-api'
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
import { set } from 'date-fns'
import { CompanyType } from '@/api/company-api'
import { CustomCombobox } from '@/utils/custom-combobox'

const TradeDebtors = () => {
  const [tradeDebtors, setTradeDebtors] = React.useState<GetTradeDebtorsType[]>(
    []
  )
  const [companies, setCompanies] = React.useState<CompanyType[]>([])
  const [selectedCompanyName, setSelectedCompanyName] =
    React.useState<string>('')

  // fetch trade debtors data from API
  const fetchTradeDebtors = async () => {
    const response = await getAllTradeDebtors()
    console.log('This is from trade debtors:', response.data)
    setTradeDebtors(response.data || [])
  }

  // fetch ALl companys data from API
  const fetchCompanies = async () => {
    const response = await getAllCompany()
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
            value={selectedCompanyName ? {
              id: companies.find((c) => c.companyName === selectedCompanyName)?.companyId?.toString() || '',
              name: selectedCompanyName,
            } : null}
            onChange={(value) => setSelectedCompanyName(value ? value.name : '')}
            placeholder="Select company"
          />
        </div>
      </div>      <h1 className="text-3xl font-bold mb-4 flex justify-center">
        {selectedCompanyName}
      </h1>
      <h2 className="text-2xl font-bold mb-4">Trade Debtors</h2>
      <Table className="border shadow-md ">
        <TableHeader className="bg-slate-200 sticky top-28 shadow-md">
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
  )
}

export default TradeDebtors
