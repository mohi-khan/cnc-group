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
}

const IouReportList: React.FC<Props> = ({
  data,
  employees,
  companies,
  locations,
  targetRef,
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

  const formatAmount = (value: number | null | undefined) => {
    if (value == null || isNaN(value)) return '-'
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const filteredData = selectedCompany
    ? data.filter((loan) => loan.companyId === selectedCompany)
    : data

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
          {filteredData.map((loan) => (
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
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default IouReportList

// import React from 'react'
// import { Employee, IouRecordGetType, LocationData } from '@/utils/type'
// import { CompanyType } from '@/api/company-api'
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table'
// import { CustomCombobox } from '@/utils/custom-combobox'

// interface Props {
//   data: IouRecordGetType[]
//   employees: Employee[]
//   companies: CompanyType[]
//   locations: LocationData[]
//   targetRef: React.RefObject<HTMLDivElement>
// }

// const IouReportList: React.FC<Props> = ({
//   data,
//   employees,
//   companies,
//   locations,
//   targetRef,
// }) => {
//   const [selectedCompany, setSelectedCompany] = React.useState<number | null>(
//     null
//   )

//   if (data.length === 0) {
//     return <div>No loan records found for this date.</div>
//   }

//   const getEmployeeName = (employeeId: number) =>
//     employees.find((emp) => emp.id === employeeId)?.employeeName ||
//     'Unknown Employee'

//   const getCompanyName = (id: number | string) =>
//     companies.find((c) => c.companyId === id)?.companyName || `Unknown (${id})`

//   const getLocationName = (id: number | string) =>
//     locations.find((l) => l.locationId === id)?.address || `Unknown (${id})`

//   const filteredData = selectedCompany
//     ? data.filter((loan) => loan.companyId === selectedCompany)
//     : data

//   return (
//     <div ref={targetRef} className="border shadow-lg p-3 mt-4 bg-white">
//       <Table className="border shadow-md">
//         <TableHeader className="sticky top-28 bg-slate-200 shadow-md">
//           <TableRow>
//             <TableHead>Employee Name</TableHead>
//             <TableHead>
//               <div className="flex items-center gap-2">
//                 <span>Company</span>
//                 {/* keep the combobox in the same place visually,
//                     but give it the hide-in-pdf class so generatePdf can hide it */}
//                 <div className="hide-in-pdf">
//                   <CustomCombobox
//                     items={[
//                       { id: 'all', name: 'All Companies' },
//                       ...companies.map((company) => ({
//                         id: company.companyId?.toString() ?? '',
//                         name: company.companyName,
//                       })),
//                     ]}
//                     value={
//                       selectedCompany
//                         ? {
//                             id: selectedCompany.toString(),
//                             name:
//                               companies.find(
//                                 (c) => c.companyId === selectedCompany
//                               )?.companyName || 'Select company',
//                           }
//                         : { id: 'all', name: 'All Companies' }
//                     }
//                     onChange={(value: { id: string; name: string } | null) => {
//                       if (value?.id === 'all' || !value) {
//                         setSelectedCompany(null)
//                       } else {
//                         setSelectedCompany(Number(value.id))
//                       }
//                     }}
//                     placeholder="Select a company"
//                   />
//                 </div>
//               </div>
//             </TableHead>
//             <TableHead>Location</TableHead>
//             <TableHead>Amount</TableHead>
//             <TableHead>Adjusted Amount</TableHead>
//             <TableHead>Status</TableHead>
//             <TableHead>Date</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {filteredData.map((loan) => (
//             <TableRow key={loan.iouId}>
//               <TableCell>{getEmployeeName(loan.employeeId)}</TableCell>
//               <TableCell>{getCompanyName(loan.companyId)}</TableCell>
//               <TableCell>{getLocationName(loan.locationId)}</TableCell>
//               <TableCell>{loan.amount}</TableCell>
//               <TableCell>{loan.adjustedAmount ?? '-'}</TableCell>
//               <TableCell>{loan.status}</TableCell>
//               <TableCell>
//                 {isNaN(new Date(loan.dueDate).getTime())
//                   ? 'Invalid Date'
//                   : new Date(loan.dueDate).toLocaleDateString()}
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </div>
//   )
// }

// export default IouReportList
