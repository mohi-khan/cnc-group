import React from 'react'
import { Employee, IouRecordGetType, LocationData } from '@/utils/type'
import { CompanyType } from '@/api/company-api'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CustomCombobox } from '@/utils/custom-combobox'
import { formatIndianNumber } from '@/utils/Formatindiannumber'

interface Props {
  data: IouRecordGetType[]
  employees: Employee[]
  companies: CompanyType[]
  locations: LocationData[]
  targetRef: React.RefObject<HTMLDivElement>
  employeeSearch?: string
}

const IouReportList: React.FC<Props> = ({
  data,
  employees,
  companies,
  locations,
  targetRef,
  employeeSearch = '',
}) => {
  const [selectedCompany, setSelectedCompany] = React.useState<number | null>(
    null
  )

  if (data.length === 0) {
    return <div>No loan records found for this date.</div>
  }

  const getEmployeeName = (employeeId: number) =>
    employees.find((emp) => emp.id === employeeId)?.employeeName ||
    'Unknown Employee'

  const getCompanyName = (id: number | string) =>
    companies.find((c) => c.companyId === id)?.companyName || `Unknown (${id})`

  const getLocationName = (id: number | string) =>
    locations.find((l) => l.locationId === id)?.address || `Unknown (${id})`

  const filteredData = data
    .filter((loan) =>
      selectedCompany ? loan.companyId === selectedCompany : true
    )
    .filter((loan) => {
      if (!employeeSearch.trim()) return true
      const name = getEmployeeName(loan.employeeId).toLowerCase()
      return name.includes(employeeSearch.trim().toLowerCase())
    })

  const totalAmount = filteredData.reduce(
    (sum, loan) => sum + (loan.amount ?? 0),
    0
  )
  const totalAdjustedAmount = filteredData.reduce(
    (sum, loan) => sum + (loan.adjustedAmount ?? 0),
    0
  )

  return (
    <div ref={targetRef} className="border shadow-lg p-3 mt-4 bg-white">
      <Table className="border shadow-md">
        <TableHeader className="sticky top-28 bg-slate-200 shadow-md">
          <TableRow>
            <TableHead>Employee Name</TableHead>
            <TableHead>
              <div className="flex items-center gap-2">
                <span>Company</span>
                <div className="hide-in-pdf">
                  <CustomCombobox
                    items={[
                      { id: 'all', name: 'All Companies' },
                      ...companies.map((company) => ({
                        id: company.companyId?.toString() ?? '',
                        name: company.companyName,
                      })),
                    ]}
                    value={
                      selectedCompany
                        ? {
                            id: selectedCompany.toString(),
                            name:
                              companies.find(
                                (c) => c.companyId === selectedCompany
                              )?.companyName || 'Select company',
                          }
                        : { id: 'all', name: 'All Companies' }
                    }
                    onChange={(value: { id: string; name: string } | null) => {
                      if (value?.id === 'all' || !value) {
                        setSelectedCompany(null)
                      } else {
                        setSelectedCompany(Number(value.id))
                      }
                    }}
                    placeholder="Select a company"
                  />
                </div>
              </div>
            </TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Amount (Decimal)</TableHead>
            <TableHead>Adjusted Amount (Decimal)</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-gray-500 py-4">
                No employees found matching {employeeSearch}
              </TableCell>
            </TableRow>
          ) : (
            filteredData.map((loan) => (
              <TableRow key={loan.iouId}>
                <TableCell>{getEmployeeName(loan.employeeId)}</TableCell>
                <TableCell>{getCompanyName(loan.companyId)}</TableCell>
                <TableCell>{getLocationName(loan.locationId)}</TableCell>
                <TableCell>{formatIndianNumber(loan.amount)}</TableCell>
                <TableCell>{formatIndianNumber(loan.adjustedAmount)}</TableCell>
                <TableCell>{loan.status}</TableCell>
                <TableCell>
                  {isNaN(new Date(loan.dueDate).getTime())
                    ? 'Invalid Date'
                    : new Date(loan.dueDate).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))
          )}
          {/* Fixed Total Row */}
          <TableRow className="sticky bottom-0 bg-slate-200 font-bold border-t-2 border-slate-400">
            <TableCell>Total ({filteredData.length} records)</TableCell>
            <TableCell />
            <TableCell />
            <TableCell className="text-blue-700">
              {formatIndianNumber(totalAmount)}
            </TableCell>
            <TableCell className="text-green-700">
              {formatIndianNumber(totalAdjustedAmount)}
            </TableCell>
            <TableCell />
            <TableCell />
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}

export default IouReportList