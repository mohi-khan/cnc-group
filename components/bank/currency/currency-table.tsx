'use client'
import { getAllCurrency } from '@/api/currency-api'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CurrencyType } from '@/utils/type'
import { useEffect, useState } from 'react'

const CurrencyTable = () => {
  const [getCurrency, setGetCurrency] = useState<CurrencyType[]>([])

  async function fetchAllCurrency() {
    const respons = await getAllCurrency()
    setGetCurrency(respons.data || [])
    console.log('This is all department   data: ', respons.data || [])
  }

  useEffect(() => {
    fetchAllCurrency()
  }, [])

  return (
    <div>
      <Table className="shadow-md border">
        {/* <TableCaption>List of Currencies</TableCaption> */}
        <TableHeader className="bg-gray-200 shadow-md">
          <TableRow>
            <TableHead> Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Base Currency</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {getCurrency.map((currency) => (
            <TableRow key={currency.currencyId}>
              <TableCell>{currency.currencyCode}</TableCell>
              <TableCell>{currency.currencyName}</TableCell>
              <TableCell className="text-right">
                {currency.baseCurrency ? 'Ture' : 'False'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default CurrencyTable
