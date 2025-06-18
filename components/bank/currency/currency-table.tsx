'use client'

import { getAllCurrency } from '@/api/common-shared-api'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CurrencyType } from '@/utils/type'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'

const CurrencyTable = () => {
  //getting userData from jotai atom component
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)
  const router = useRouter()
  const [getCurrency, setGetCurrency] = useState<CurrencyType[]>([])

  const fetchAllCurrency = useCallback(async () => {
    if (!token) return
    const respons = await getAllCurrency(token)
    setGetCurrency(respons.data || [])
    console.log('This is all department   data: ', respons.data || [])
  }, [token])

  useEffect(() => {
    const checkUserData = () => {
      const storedUserData = localStorage.getItem('currentUser')
      const storedToken = localStorage.getItem('authToken')

      if (!storedUserData || !storedToken) {
        console.log('No user data or token found in localStorage')
        router.push('/')
        return
      }
    }

    checkUserData()
    fetchAllCurrency()
  }, [fetchAllCurrency, router])

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
