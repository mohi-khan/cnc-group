'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAtom } from 'jotai'
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
import { useInitializeUser, tokenAtom } from '@/utils/user'
import { getFdrReport } from '@/api/fdr-report-api'
import { getAllCompanies } from '@/api/common-shared-api'
import type { CompanyType } from '@/api/company-api'
import Loader from '@/utils/loader'
import { FileText, Download, File } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'
import { formatIndianNumber } from '@/utils/Formatindiannumber'

// ----- Types to support both snake_case and camelCase FDR payloads -----
type Snake = {
  fdr_no: string
  fdr_date: string
  account_no: string
  bank: string
  branch: string
  face_value: number
  interest_rate: number
  term?: number // assumed to be months if present
  matured_date: string
  company: number | null
  company_other: string | null
  created_by?: number
  created_at: string
  updated_at?: string
  last_updated_value?: number | null
}
type Camel = {
  fdrNo: string
  fdrDate: string
  accountNo: string
  bank: string
  branch: string
  faceValue: number
  interestRate: number
  term?: number // assumed to be months if present
  maturedDate: string
  company: number | null
  companyOther: string | null
  createdBy?: number
  createdAt: string
  updatedAt?: string
  lastUpdatedValue?: number | null
}
type AnyFdr = Partial<Snake> & Partial<Camel>

// ----- Helpers -----
function toNumber(n: unknown): number {
  if (typeof n === 'number') return Number.isFinite(n) ? n : 0
  if (typeof n === 'string') {
    const cleaned = n.replaceAll(',', '').trim()
    const parsed = Number.parseFloat(cleaned)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}
function formatCurrency(amount: unknown) {
  return toNumber(amount).toLocaleString()
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso as string

  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()

  return `${day}/${month}/${year}` // e.g. 09/08/2025
}

// Numeric months between dates for calculations
function monthsBetween(fromISO?: string | null, toISO?: string | null): number {
  if (!fromISO || !toISO) return 0
  const start = new Date(fromISO)
  const end = new Date(toISO)
  const si = start.getTime()
  const ei = end.getTime()
  if (Number.isNaN(si) || Number.isNaN(ei)) return 0
  let months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth())
  if (end.getDate() < start.getDate()) months -= 1
  return Math.max(0, months)
}

// New: period in months label between fdrDate and maturedDate
function periodMonthsLabel(
  fromISO?: string | null,
  toISO?: string | null
): string {
  const months = monthsBetween(fromISO, toISO)
  if (months <= 0) return ''
  return `${months} ${months === 1 ? 'month' : 'months'}`
}

// Field getters to support both shapes
const g = {
  fdrNo: (r: AnyFdr) => r.fdr_no ?? r.fdrNo ?? '',
  fdrDate: (r: AnyFdr) => r.fdr_date ?? r.fdrDate ?? '',
  accountNo: (r: AnyFdr) => r.account_no ?? r.accountNo ?? '',
  bank: (r: AnyFdr) => r.bank ?? '',
  branch: (r: AnyFdr) => r.branch ?? '',
  faceValue: (r: AnyFdr) => (r.face_value ?? r.faceValue ?? 0) as number,
  interestRate: (r: AnyFdr) =>
    (r.interest_rate ?? r.interestRate ?? 0) as number,
  maturedDate: (r: AnyFdr) => r.matured_date ?? r.maturedDate ?? '',
  createdAt: (r: AnyFdr) => r.created_at ?? r.createdAt ?? '',
  companyId: (r: AnyFdr) => (r.company ?? null) as number | null,
  companyOther: (r: AnyFdr) =>
    (r.company_other ?? r.companyOther ?? null) as string | null,
  term: (r: AnyFdr) => (r.term ?? undefined) as number | undefined,
  // Present Face Value Amount (now computed via simple interest)
  // FV = PV * (1 + r * t), where:
  //   PV = face value (principal),
  //   r = annual rate as decimal,
  //   t = time in years (months/12 from FDR date to matured date; fallback to term months)
  presentValue: (r: AnyFdr) => computeMaturityAmount(r),
}

function resolveCompanyName(row: CompanyType): string {
  return row.companyName || `Company ${row.companyId}`
}

function companyLabel(r: AnyFdr, companyMap: Map<number, string>): string {
  const other = g.companyOther(r)
  if (other && other.trim().length > 0) return other.trim()
  const id = g.companyId(r)
  if (id !== null && id !== undefined) {
    const name = companyMap.get(id)
    if (name && name.trim().length > 0) return name
    return `Company ${id}`
  }
  return 'Unknown Company'
}

type Group = {
  name: string
  rows: AnyFdr[]
  totalActual: number
  totalPresent: number
}

function sortRows(rows: AnyFdr[]): AnyFdr[] {
  return [...rows].sort((a, b) => {
    const ad = new Date(g.fdrDate(a) || g.createdAt(a)).getTime()
    const bd = new Date(g.fdrDate(b) || g.createdAt(b)).getTime()
    if (Number.isNaN(ad) && Number.isNaN(bd)) return 0
    if (Number.isNaN(ad)) return 1
    if (Number.isNaN(bd)) return -1
    return ad - bd
  })
}

function groupByCompany(
  records: AnyFdr[],
  companyMap: Map<number, string>
): Group[] {
  const map = new Map<string, AnyFdr[]>()
  for (const r of records) {
    const key = companyLabel(r, companyMap)
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(r)
  }
  const groups: Group[] = []
  for (const [name, rows] of map.entries()) {
    const sorted = sortRows(rows)
    const totalActual = sorted.reduce((s, r) => s + toNumber(g.faceValue(r)), 0)
    const totalPresent = sorted.reduce(
      (s, r) => s + toNumber(g.presentValue(r)),
      0
    )
    groups.push({ name, rows: sorted, totalActual, totalPresent })
  }
  groups.sort((a, b) => a.name.localeCompare(b.name))
  return groups
}

function calcGrandTotals(groups: Group[]) {
  return groups.reduce(
    (acc, g) => {
      acc.actual += g.totalActual
      acc.present += g.totalPresent
      return acc
    },
    { actual: 0, present: 0 }
  )
}

// Compute maturity amount (present face value amount column) using Simple Interest.
// FV = PV * (1 + r * t)
// t is computed (in years) from FDR date to matured date; if missing, falls back to term months; else 0.
function computeMaturityAmount(row: AnyFdr): number {
  const pv = toNumber(g.faceValue(row))
  const r = toNumber(g.interestRate(row)) / 100
  // Prefer date-based months; fallback to explicit term months if provided
  let months = monthsBetween(g.fdrDate(row), g.maturedDate(row))
  if (months <= 0 && typeof g.term(row) === 'number') {
    months = Math.max(0, toNumber(g.term(row)))
  }
  const tYears = months / 12
  if (pv <= 0 || r <= 0 || tYears <= 0) return pv
  return pv * (1 + r * tYears)
}

// ----- Component -----
export default function Page() {
  // Uses hooks and interactivity; this is a Client Component
  useInitializeUser()
  const [token] = useAtom(tokenAtom)

  // FDR
  const [loadingFdr, setLoadingFdr] = useState(true)
  const [records, setRecords] = useState<AnyFdr[]>([])

  const fetchFdr = useCallback(async () => {
    if (!token) return
    try {
      setLoadingFdr(true)
      const resp = await getFdrReport(token)
      const rows: AnyFdr[] = (resp?.data as AnyFdr[]) ?? []
      setRecords(rows)
    } catch (err) {
      console.error('Error fetching FDR data:', err)
      setRecords([])
    } finally {
      setLoadingFdr(false)
    }
  }, [token])

  useEffect(() => {
    fetchFdr()
  }, [fetchFdr])

  // Companies
  const [companyLoading, setCompanyLoading] = useState(true)
  const [companyData, setCompanyData] = useState<CompanyType[]>([])

  const fetchCompanyData = useCallback(async () => {
    if (!token) return
    try {
      setCompanyLoading(true)
      const companies = await getAllCompanies(token)
      setCompanyData(companies.data ? (companies.data as CompanyType[]) : [])
    } catch (error) {
      console.error('Error fetching company data:', error)
      setCompanyData([])
    } finally {
      setCompanyLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchCompanyData()
  }, [fetchCompanyData])

  // Build id -> name map
  const companyMap = useMemo(() => {
    const map = new Map<number, string>()
    for (const c of companyData) {
      if (typeof c.companyId === 'number') {
        map.set(c.companyId, resolveCompanyName(c))
      }
    }
    return map
  }, [companyData])

  // Groups and totals
  const groups = useMemo(
    () => groupByCompany(records, companyMap),
    [records, companyMap]
  )
  const grand = useMemo(() => calcGrandTotals(groups), [groups])
  const isLoading = loadingFdr || companyLoading

  const generatePdf = async () => {
    const element = document.getElementById('fdr-report-content')
    if (!element) return

    try {
      // Get company name for header
      const companyName =
        companyData.length > 0
          ? companyData[0]?.companyName || 'CNC GROUP'
          : 'CNC GROUP'

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
        pdf.text(companyName, pdfWidth / 2, 15, { align: 'center' })

        // Add report title
        pdf.setFontSize(14)
        pdf.text('FDR Statement', pdfWidth / 2, 25, { align: 'center' })

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

      pdf.save('fdr-report.pdf')
    } catch (error) {
      console.error('Error generating PDF:', error)
    }
  }

  const exportToExcel = () => {
    try {
      const worksheetData: any[][] = []

      // Add headers
      worksheetData.push([
        'Company',
        'Sl #',
        'FDR Date',
        'FDR No.',
        'Account No.',
        'Bank & Branch',
        'Actual Face Value',
        'Present Face Value Amount',
        'Matured Date',
        'Period Date',
        'Interest Rate',
      ])

      // Add data rows
      groups.forEach((group) => {
        group.rows.forEach((row, idx) => {
          const bankBranch = [g.bank(row), g.branch(row)]
            .filter(Boolean)
            .join(', ')
          worksheetData.push([
            group.name,
            idx + 1,
            formatDate(g.fdrDate(row)),
            g.fdrNo(row),
            g.accountNo(row),
            bankBranch,
            toNumber(g.faceValue(row)),
            toNumber(g.presentValue(row)),
            formatDate(g.maturedDate(row)),
            periodMonthsLabel(g.fdrDate(row), g.maturedDate(row)),
            `${toNumber(g.interestRate(row)).toFixed(2)}%`,
          ])
        })

        // Add company total row
        worksheetData.push([
          `${group.name} Total:`,
          '',
          '',
          '',
          '',
          '',
          group.totalActual,
          group.totalPresent,
          '',
          '',
          '',
        ])
      })

      // Add grand total row
      worksheetData.push([
        'Grand Total',
        '',
        '',
        '',
        '',
        '',
        grand.actual,
        grand.present,
        '',
        '',
        '',
      ])

      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'FDR Report')

      XLSX.writeFile(workbook, 'fdr-report.xlsx')
    } catch (error) {
      console.error('Error exporting to Excel:', error)
    }
  }

  return (
    <main className="w-full my-2">
      <div className="flex  justify-end pr-5">
        <Button
          onClick={generatePdf}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-900 hover:bg-purple-200"
          disabled={isLoading || groups.length === 0}
        >
          <FileText className="h-4 w-4" />
          PDF
        </Button>
        <Button
          onClick={exportToExcel}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-900 hover:bg-green-200"
          disabled={isLoading || groups.length === 0}
        >
          <File className="h-4 w-4" />
          Excel
        </Button>
      </div>
      <div>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-center flex-1">
              {'CNC GROUP - FDR Statement'}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div id="fdr-report-content">
            {isLoading ? (
              <div className="text-sm text-muted-foreground">
                <Loader />
              </div>
            ) : groups.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                {'No FDR records found.'}
              </div>
            ) : (
              <div className="space-y-8">
                <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                  <Table className="border shadow-md ">
                    <TableHeader className="bg-slate-200 shadow-md pdf-table-header sticky top-[0] z-10">
                      <TableRow>
                        <TableHead className="w-12">{'Sl #'}</TableHead>
                        <TableHead>{'FDR Date'}</TableHead>
                        <TableHead>{'FDR No.'}</TableHead>
                        <TableHead>{'Account No.'}</TableHead>
                        <TableHead>{'Bank & Branch'}</TableHead>
                        <TableHead className="text-right">
                          {'Actual Face Value'}
                        </TableHead>
                        <TableHead className="text-right">
                          {'Present Face Value Amount'}
                        </TableHead>
                        <TableHead>{'maturedDate'}</TableHead>
                        <TableHead>{'Period Date'}</TableHead>
                        <TableHead>{'Interest @'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groups.map((gGroup) => (
                        <FragmentGroup key={gGroup.name} group={gGroup} />
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
                            {'Grand Total'}
                          </TableCell>
                          <TableCell></TableCell>
                          <TableCell></TableCell>
                          <TableCell></TableCell>
                          <TableCell></TableCell>
                          <TableCell className="text-right font-bold">
                            {formatIndianNumber(grand.actual)}
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {formatIndianNumber(grand.present)}
                          </TableCell>
                          <TableCell></TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </div>
    </main>
  )
}

function FragmentGroup({ group }: { group: Group }) {
  return (
    <>
      {/* Per-company total row (kept in TableBody) */}
      <TableRow className=" border-2 font-bold">
        <TableCell colSpan={5} className="font-semibold ">
          {group.name + ' Total:'}
        </TableCell>
        <TableCell className="text-right font-semibold">
          {formatIndianNumber(group.totalActual)}
        </TableCell>
        <TableCell className="text-right font-semibold">
          {formatIndianNumber(group.totalPresent)}
        </TableCell>
        <TableCell colSpan={2}></TableCell>
      </TableRow>
      {/* Company rows */}
      {group.rows.map((r, idx) => {
        const bankBranch = [g.bank(r), g.branch(r)].filter(Boolean).join(', ')
        return (
          <TableRow key={`${group.name}-${g.fdrNo(r)}-${idx}`}>
            <TableCell className="font-medium">{idx + 1}</TableCell>
            <TableCell>{formatDate(g.fdrDate(r))}</TableCell>
            <TableCell>{g.fdrNo(r)}</TableCell>
            <TableCell>{g.accountNo(r)}</TableCell>
            <TableCell>{bankBranch}</TableCell>
            <TableCell className="text-right">
              {formatIndianNumber(g.faceValue(r))}
            </TableCell>
            <TableCell className="text-right">
              {formatIndianNumber(g.presentValue(r))}
            </TableCell>
            <TableCell>{formatDate(g.maturedDate(r))}</TableCell>
            <TableCell>
              {periodMonthsLabel(g.fdrDate(r), g.maturedDate(r))}
            </TableCell>
            <TableCell>{`${toNumber(g.interestRate(r)).toFixed(2)}%`}</TableCell>
          </TableRow>
        )
      })}
    </>
  )
}
