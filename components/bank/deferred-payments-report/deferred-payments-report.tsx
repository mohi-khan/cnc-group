'use client'
import { getDeferredPayments } from '@/api/deferred-payments-report-api'
import { toast } from '@/hooks/use-toast'
import type { DeferredPayment } from '@/utils/type'
import { tokenAtom, useInitializeUser } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Loader2 } from 'lucide-react'

const DeferredPaymentsReport = () => {
  const [deferredPayments, setDeferredPayments] = useState<DeferredPayment[]>(
    []
  )
  const [loading, setLoading] = useState(false)
  useInitializeUser()
  const [token, setToken] = useAtom(tokenAtom)
  const router = useRouter()

  useEffect(() => {
    if (!token) {
      setToken('mock-auth-token-12345')
    }
  }, [token, setToken])

  useEffect(() => {
    const fetchDeferredPayments = async () => {
      if (!token) return

      try {
        setLoading(true)
        const response = await getDeferredPayments({ token })

        if (response?.error?.status === 401) {
          router.push('/unauthorized-access')
          return
        } else if (response.data) {
          setDeferredPayments(response.data)
          console.log('Deferred Payments:', response.data)
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch deferred payments',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDeferredPayments()
  }, [router, token])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(amount))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: '2-digit',
    })
  }

  const calculateDeferredDays = (lcIssueDate: string, maturityDate: string) => {
    if (!lcIssueDate || !maturityDate) return 0

    const issueDate = new Date(lcIssueDate)
    const maturity = new Date(maturityDate)

    // Reset time to start of day for accurate day calculation
    issueDate.setHours(0, 0, 0, 0)
    maturity.setHours(0, 0, 0, 0)

    const diffTime = maturity.getTime() - issueDate.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    // Return the difference in days (can be negative if maturity is before issue date)
    return diffDays
  }

  const getCompanyAbbreviation = (companyName: string) => {
    const name = companyName.toLowerCase()
    if (name.includes('national accessories')) return 'NAL'
    if (name.includes('multiplast accessories')) return 'MAL'
    if (name.includes('silver soap')) return 'SSL'
    return 'OTHER'
  }

  const getBalanceForColumn = (
    payment: DeferredPayment,
    columnType: string
  ) => {
    const companyAbbr = getCompanyAbbreviation(payment.company_name)
    if (companyAbbr === columnType) {
      return formatCurrency(payment.opening_balance)
    }
    return ''
  }

  const nalTotal = deferredPayments
    .filter((p) => getCompanyAbbreviation(p.company_name) === 'NAL')
    .reduce((acc, payment) => acc + Math.abs(payment.opening_balance), 0)

  const malTotal = deferredPayments
    .filter((p) => getCompanyAbbreviation(p.company_name) === 'MAL')
    .reduce((acc, payment) => acc + Math.abs(payment.opening_balance), 0)

  const sslTotal = deferredPayments
    .filter((p) => getCompanyAbbreviation(p.company_name) === 'SSL')
    .reduce((acc, payment) => acc + Math.abs(payment.opening_balance), 0)

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white">
        <h1 className="text-xl font-bold text-center mb-4 py-2 bg-gray-100 border border-gray-400">
          List of Deferred Payments for Raw Materials
        </h1>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading deferred payments...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="border-collapse border border-gray-400">
              <TableHeader>
                <TableRow className="bg-gray-200">
                  <TableHead className="text-center font-bold border border-gray-400 px-2 py-1 text-black text-xs">
                    S #
                  </TableHead>
                  <TableHead className="text-center font-bold border border-gray-400 px-2 py-1 text-black text-xs">
                    LC No.
                  </TableHead>
                  <TableHead className="text-center font-bold border border-gray-400 px-2 py-1 text-black text-xs">
                    LC Issue Date
                  </TableHead>
                  <TableHead className="text-center font-bold border border-gray-400 px-2 py-1 text-black text-xs">
                    Goods in Store
                  </TableHead>
                  <TableHead className="text-center font-bold border border-gray-400 px-2 py-1 text-black text-xs">
                    Deferred Time (Days)
                  </TableHead>
                  <TableHead className="text-center font-bold border border-gray-400 px-2 py-1 text-black text-xs">
                    Loan Type
                  </TableHead>
                  <TableHead className="text-center font-bold border border-gray-400 px-2 py-1 text-black text-xs">
                    Maturity date
                  </TableHead>
                  <TableHead className="text-center font-bold border border-gray-400 px-2 py-1 text-black text-xs">
                    NAL (BDT)
                  </TableHead>
                  <TableHead className="text-center font-bold border border-gray-400 px-2 py-1 text-black text-xs">
                    SSL (BDT)
                  </TableHead>
                  <TableHead className="text-center font-bold border border-gray-400 px-2 py-1 text-black text-xs">
                    MPAL (BDT)
                  </TableHead>
                  <TableHead className="text-center font-bold border border-gray-400 px-2 py-1 text-black text-xs">
                    Vendor Name
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deferredPayments.map((payment, index) => (
                  <TableRow
                    key={`${payment.lcReqNo}-${index}`}
                    className="hover:bg-gray-50"
                  >
                    <TableCell className="text-center border border-gray-400 px-2 py-1 text-xs">
                      {index + 1}
                    </TableCell>
                    <TableCell className="text-center border border-gray-400 px-2 py-1 text-xs">
                      {payment.lcReqNo}
                    </TableCell>
                    <TableCell className="text-center border border-gray-400 px-2 py-1 text-xs">
                      {payment.LC_ISSUE ? formatDate(payment.LC_ISSUE) : '-'}
                    </TableCell>
                    <TableCell className="text-center border border-gray-400 px-2 py-1 text-xs">
                      {payment.goods_in ? formatDate(payment.goods_in) : '-'}
                    </TableCell>
                    <TableCell className="text-center border border-gray-400 px-2 py-1 text-xs">
                      {calculateDeferredDays(
                        payment.LC_ISSUE,
                        payment.maturity
                      )}
                    </TableCell>
                    <TableCell className="text-center border border-gray-400 px-2 py-1 text-xs">
                      {payment.loanType}
                    </TableCell>
                    <TableCell className="text-center border border-gray-400 px-2 py-1 text-xs">
                      {payment.maturity ? formatDate(payment.maturity) : '-'}
                    </TableCell>
                    <TableCell className="text-right border border-gray-400 px-2 py-1 text-xs">
                      {getBalanceForColumn(payment, 'NAL')}
                    </TableCell>
                    <TableCell className="text-right border border-gray-400 px-2 py-1 text-xs">
                      {getBalanceForColumn(payment, 'SSL')}
                    </TableCell>
                    <TableCell className="text-right border border-gray-400 px-2 py-1 text-xs">
                      {getBalanceForColumn(payment, 'MPAL')}
                    </TableCell>
                    <TableCell className="border border-gray-400 px-2 py-1 text-xs">
                      {payment.name}
                    </TableCell>
                  </TableRow>
                ))}

                <TableRow className="bg-gray-200">
                  <TableCell
                    colSpan={6}
                    className="text-center border border-gray-400 px-2 py-1 font-bold text-xs"
                  >
                    TOTAL
                  </TableCell>
                  <TableCell className="text-right border border-gray-400 px-2 py-1 font-bold text-xs">
                    {nalTotal > 0 ? formatCurrency(nalTotal) : ''}
                  </TableCell>
                  <TableCell className="text-right border border-gray-400 px-2 py-1 font-bold text-xs">
                    {sslTotal > 0 ? formatCurrency(sslTotal) : ''}
                  </TableCell>
                  <TableCell className="text-right border border-gray-400 px-2 py-1 font-bold text-xs">
                    {malTotal > 0 ? formatCurrency(malTotal) : ''}
                  </TableCell>
                  <TableCell className="border border-gray-400 px-2 py-1 text-xs"></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}

export default DeferredPaymentsReport;

