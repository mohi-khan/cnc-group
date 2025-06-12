// import { Button } from '@/components/ui/button'
// import { Label } from '@/components/ui/label'
// import { CustomCombobox } from '@/utils/custom-combobox'
// import { CompanyFromLocalstorage, LocationFromLocalstorage } from '@/utils/type'
// import { FileText } from 'lucide-react'
// import React, { useState } from 'react'

// type CashReportHeadingProps = {
//   fromDate: string
//   setFromDate: (date: string) => void
//   endDate: string
//   setEndDate: (date: string) => void
//   companies: CompanyFromLocalstorage[]
//   setCompanies: (companies: CompanyFromLocalstorage[]) => void
//   locations: LocationFromLocalstorage[]
//   setLocations: (locations: LocationFromLocalstorage[]) => void
//   setCompanyId: (id: number) => void
//   location?: number
//   setLocation: (id: number) => void
//   companyId?: number
//   generatePdf: () => void
//   generateExcel: () => void
// }

// const CashReportHeading: React.FC<CashReportHeadingProps> = ({
//   fromDate,
//   setFromDate,
//   endDate,
//   setEndDate,
//   companies,
//   locations,
//   companyId,
//   setCompanyId,
//   location,
//   setLocation,
//   generatePdf,
//   generateExcel,
// }) => {
//   return (
//     <div className="grid grid-cols-6 gap-8 mb-4 px-4 mx-20">
//       <div className="flex items-center gap-2">
//         <Button
//           onClick={generatePdf}
//           variant="ghost"
//           size="sm"
//           className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-900 hover:bg-purple-200"
//         >
//           <FileText className="h-4 w-4" />
//           <span className="font-medium">PDF</span>
//         </Button>
//         <Button
//           onClick={generateExcel}
//           variant="ghost"
//           size="sm"
//           className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-900 hover:bg-green-200"
//         >
//           <svg
//             className="h-4 w-4"
//             viewBox="0 0 24 24"
//             fill="none"
//             xmlns="http://www.w3.org/2000/svg"
//           >
//             <path
//               d="M14.5 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V7.5L14.5 2Z"
//               stroke="currentColor"
//               strokeWidth="2"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             />
//             <path
//               d="M14 2V8H20"
//               stroke="currentColor"
//               strokeWidth="2"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             />
//             <path
//               d="M8 13H16"
//               stroke="currentColor"
//               strokeWidth="2"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             />
//             <path
//               d="M8 17H16"
//               stroke="currentColor"
//               strokeWidth="2"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             />
//             <path
//               d="M10 9H8"
//               stroke="currentColor"
//               strokeWidth="2"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             />
//           </svg>
//           <span className="font-medium">Excel</span>
//         </Button>
//       </div>
//       <div className="space-y-2">
//         <Label className="text-sm font-medium">From Date</Label>
//         <input
//           type="date"
//           value={fromDate}
//           onChange={(e) => setFromDate(e.target.value)}
//           className="w-full p-1 border rounded"
//         />
//       </div>
//       <div className="space-y-2">
//         <Label className="text-sm font-medium">End Date</Label>
//         <input
//           type="date"
//           value={endDate}
//           onChange={(e) => setEndDate(e.target.value)}
//           className="w-full p-1 border rounded"
//         />
//       </div>
//       <div className="space-y-2">
//         <Label className="text-sm font-medium">Company</Label>
//         <CustomCombobox
//           value={
//             companies
//               .map((company) => ({
//                 id: company.company?.companyId ?? 0,
//                 name: company.company?.companyName,
//               }))
//               .find((item) => item.id === Number(companyId)) || null
//           }
//           onChange={(item) => setCompanyId(item ? Number(item.id) : 0)}
//           items={companies.map((company) => ({
//             id:
//               company.company?.companyId !== undefined
//                 ? company.company.companyId
//                 : 0,
//             name: company.company?.companyName,
//           }))}
//           placeholder="Select Company"
//         />
//       </div>
//       <div className="space-y-2">
//         <Label className="text-sm font-medium">Location</Label>
//         <CustomCombobox
//           value={
//             locations
//               .map((location) => ({
//                 id: location.location?.locationId ?? 0,
//                 name: location.location?.address,
//               }))
//               .find((item) => item.id === location) || null
//           }
//           onChange={(item) => setLocation(item ? Number(item.id) : 0)}
//           items={locations.map((location) => ({
//             id:
//               location.location?.locationId !== undefined
//                 ? location.location?.locationId
//                 : 0,
//             name: location.location?.address,
//           }))}
//           placeholder="Select Location"
//         />
//       </div>
//     </div>
//   )
// }

// export default CashReportHeading


import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { CustomCombobox } from '@/utils/custom-combobox'
import { CompanyFromLocalstorage, LocationFromLocalstorage } from '@/utils/type'
import { FileText } from 'lucide-react'
import React, { useState } from 'react'

type CashReportHeadingProps = {
  date: string
  setDate: (date: string) => void
  companies: CompanyFromLocalstorage[]
  setCompanies: (companies: CompanyFromLocalstorage[]) => void
  locations: LocationFromLocalstorage[]
  setLocations: (locations: LocationFromLocalstorage[]) => void
  setCompanyId: (id: number) => void
  location?: number
  setLocation: (id: number) => void
  companyId?: number
  generatePdf: () => void
  generateExcel: () => void
}

const CashReportHeading: React.FC<CashReportHeadingProps> = ({
  date,
  setDate, 
  companies,
  locations,
  companyId,
  setCompanyId,
  location,
  setLocation,
  generatePdf,
  generateExcel,
}) => {
  return (
    <div className="grid grid-cols-6 gap-8 mb-4 px-4 mx-20">
      <div className="flex items-center gap-2">
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
      <div className="space-y-2">
        <Label className="text-sm font-medium"> Date</Label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-1 border rounded"
        />
      </div>
      {/* <div className="space-y-2">
        <Label className="text-sm font-medium">End Date</Label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full p-1 border rounded"
        />
      </div> */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Company</Label>
        <CustomCombobox
          value={
            companies
              .map((company) => ({
                id: company.company?.companyId ?? 0,
                name: company.company?.companyName,
              }))
              .find((item) => item.id === Number(companyId)) || null
          }
          onChange={(item) => setCompanyId(item ? Number(item.id) : 0)}
          items={companies.map((company) => ({
            id:
              company.company?.companyId !== undefined
                ? company.company.companyId
                : 0,
            name: company.company?.companyName,
          }))}
          placeholder="Select Company"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium">Location</Label>
        <CustomCombobox
          value={
            locations
              .map((location) => ({
                id: location.location?.locationId ?? 0,
                name: location.location?.address,
              }))
              .find((item) => item.id === location) || null
          }
          onChange={(item) => setLocation(item ? Number(item.id) : 0)}
          items={locations.map((location) => ({
            id:
              location.location?.locationId !== undefined
                ? location.location?.locationId
                : 0,
            name: location.location?.address,
          }))}
          placeholder="Select Location"
        />
      </div>
    </div>
  )
}

export default CashReportHeading
