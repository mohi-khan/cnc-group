

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

interface Props {
  data: IouRecordGetType[]
  employees: Employee[]
  companies: CompanyType[]
  locations: LocationData[]
}

const IouReportList: React.FC<Props> = ({
  data,
  employees,
  companies,
  locations,
}) => {
  if (data.length === 0) {
    return <div>No loan records found for this date.</div>
  }

  // Helper functions to map IDs -> Names

    const getEmployeeName = (employeeId: number) => {
    const employee = employees.find((emp) => emp.id === employeeId)
    return employee ? employee.employeeName : 'Unknown Employee'
  }

  const getCompanyName = (id: number | string) => {
    const comp = companies.find((c) => c.companyId === id)
    return comp ? comp.companyName : `Unknown (${id})`
  }

  const getLocationName = (id: number | string) => {
    const loc = locations.find((l) => l.locationId === id)
    return loc ? loc.address : `Unknown (${id})`
  }

  return (
    <Table className=" border shadow-md">
      <TableHeader className="sticky top-28 bg-slate-200 shadow-md">
        <TableRow>
          <TableHead>Employee Name</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Adjusted Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((loan) => (
          <TableRow key={loan.iouId}>
            <TableCell>{getEmployeeName(loan.employeeId)}</TableCell>
            <TableCell>{getCompanyName(loan.companyId)}</TableCell>
            <TableCell>{getLocationName(loan.locationId)}</TableCell>
            <TableCell>{loan.amount}</TableCell>
            <TableCell>{loan.adjustedAmount ?? '-'}</TableCell>
            <TableCell>{loan.status}</TableCell>
            <TableCell>
              {isNaN(new Date(loan.dueDate).getTime())
                ? 'Invalid Date'
                : new Date(loan.dueDate).toLocaleDateString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default IouReportList
