// 'use client'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { Button } from '@/components/ui/button'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select'
// import type { CompanyType } from '@/api/company-api'

// interface Company {
//   id: number
//   name: string
//   code: string
// }

// interface QuickAssetReportHeadingProps {
//   startDate: string
//   endDate: string
//   companyId: string
//   companies: CompanyType[]
//   onStartDateChange: (date: string) => void
//   onEndDateChange: (date: string) => void
//   onCompanyIdChange: (id: string) => void
//   onRefresh: () => void
// }

// const QuickAssetReportHeading = ({
//   startDate,
//   endDate,
//   companyId,
//   companies,
//   onStartDateChange,
//   onEndDateChange,
//   onCompanyIdChange,
//   onRefresh,
// }: QuickAssetReportHeadingProps) => {
//   return (
//     <div className="bg-white p-6 rounded-lg shadow-sm border">
//       <h1 className="text-2xl font-bold text-gray-900 mb-6">
//         Quick Asset Report
//       </h1>

//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
//         <div className="space-y-2">
//           <Label
//             htmlFor="startDate"
//             className="text-sm font-medium text-gray-700"
//           >
//             Start Date
//           </Label>
//           <Input
//             id="startDate"
//             type="date"
//             value={startDate}
//             onChange={(e) => onStartDateChange(e.target.value)}
//             className="w-full"
//           />
//         </div>

//         <div className="space-y-2">
//           <Label
//             htmlFor="endDate"
//             className="text-sm font-medium text-gray-700"
//           >
//             End Date
//           </Label>
//           <Input
//             id="endDate"
//             type="date"
//             value={endDate}
//             onChange={(e) => onEndDateChange(e.target.value)}
//             className="w-full"
//           />
//         </div>

//         <div className="space-y-2">
//           <Label
//             htmlFor="companyId"
//             className="text-sm font-medium text-gray-700"
//           >
//             Company
//           </Label>
//           <Select value={companyId} onValueChange={onCompanyIdChange}>
//             <SelectTrigger className="w-full">
//               <SelectValue placeholder="Select a company" />
//             </SelectTrigger>
//             <SelectContent>
//               {companies.map((company) => (
//                 <SelectItem
//                   key={company.companyId}
//                   value={company.companyId?.toString() ?? ''}
//                 >
//                   {company.companyName}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>

//         <Button
//           onClick={onRefresh}
//           className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
//         >
//           Refresh Data
//         </Button>
//       </div>
//     </div>
//   )
// }

// export default QuickAssetReportHeading

// 'use client'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { Button } from '@/components/ui/button'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select'
// import type { CompanyType } from '@/api/company-api'

// interface QuickAssetReportHeadingProps {
//   startDate: string
//   endDate: string
//   companyIds: number[]
//   companies: CompanyType[]
//   onStartDateChange: (date: string) => void
//   onEndDateChange: (date: string) => void
//   onCompanyIdsChange: (ids: number[]) => void
//   onRefresh: () => void
// }

// const QuickAssetReportHeading = ({
//   startDate,
//   endDate,
//   companyIds,
//   companies,
//   onStartDateChange,
//   onEndDateChange,
//   onCompanyIdsChange,
//   onRefresh,
// }: QuickAssetReportHeadingProps) => {
//   const handleCompanySelect = (value: string) => {
//     const ids = value.split(',').map(Number)
//     onCompanyIdsChange(ids)
//   }

//   return (
//     <div className="bg-white p-6 rounded-lg shadow-sm border">
//       <h1 className="text-2xl font-bold text-gray-900 mb-6">
//         Quick Asset Report
//       </h1>

//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
//         <div className="space-y-2">
//           <Label
//             htmlFor="startDate"
//             className="text-sm font-medium text-gray-700"
//           >
//             Start Date
//           </Label>
//           <Input
//             id="startDate"
//             type="date"
//             value={startDate}
//             onChange={(e) => onStartDateChange(e.target.value)}
//             className="w-full"
//           />
//         </div>

//         <div className="space-y-2">
//           <Label
//             htmlFor="endDate"
//             className="text-sm font-medium text-gray-700"
//           >
//             End Date
//           </Label>
//           <Input
//             id="endDate"
//             type="date"
//             value={endDate}
//             onChange={(e) => onEndDateChange(e.target.value)}
//             className="w-full"
//           />
//         </div>

//         <div className="space-y-2">
//           <Label
//             htmlFor="companyId"
//             className="text-sm font-medium text-gray-700"
//           >
//             Company
//           </Label>
//           <Select
//             value={companyIds.join(',')}
//             onValueChange={handleCompanySelect}
//           >
//             <SelectTrigger className="w-full">
//               <SelectValue placeholder="Select companies" />
//             </SelectTrigger>
//             <SelectContent>
//               {companies.map((company) => (
//                 <SelectItem
//                   key={company.companyId}
//                   value={company.companyId?.toString() ?? ''}
//                 >
//                   {company.companyName}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>

//         <Button
//           onClick={onRefresh}
//           className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
//         >
//           Refresh Data
//         </Button>
//       </div>
//     </div>
//   )
// }

// export default QuickAssetReportHeading


// 'use client'
// import { Label } from '@/components/ui/label'
// import { Button } from '@/components/ui/button'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select'
// import { Input } from '@/components/ui/input'
// import type { CompanyType } from '@/api/company-api'

// interface QuickAssetReportHeadingProps {
//   startDate: string
//   endDate: string
//   selectedCompanyIds: string[]
//   companies: CompanyType[]
//   onStartDateChange: (date: string) => void
//   onEndDateChange: (date: string) => void
//   onCompanyIdsChange: (ids: string[]) => void
//   onRefresh: () => void
// }

// const QuickAssetReportHeading = ({
//   startDate,
//   endDate,
//   selectedCompanyIds,
//   companies,
//   onStartDateChange,
//   onEndDateChange,
//   onCompanyIdsChange,
//   onRefresh,
// }: QuickAssetReportHeadingProps) => {
//   return (
//     <div className="bg-white p-6 rounded-lg shadow-sm border">
//       <h1 className="text-2xl font-bold text-gray-900 mb-6">
//         Quick Asset Report
//       </h1>

//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
//         <div className="space-y-2">
//           <Label
//             htmlFor="startDate"
//             className="text-sm font-medium text-gray-700"
//           >
//             Start Date
//           </Label>
//           <Input
//             id="startDate"
//             type="date"
//             value={startDate}
//             onChange={(e) => onStartDateChange(e.target.value)}
//           />
//         </div>

//         <div className="space-y-2">
//           <Label
//             htmlFor="endDate"
//             className="text-sm font-medium text-gray-700"
//           >
//             End Date
//           </Label>
//           <Input
//             id="endDate"
//             type="date"
//             value={endDate}
//             onChange={(e) => onEndDateChange(e.target.value)}
//           />
//         </div>

//         <div className="space-y-2">
//           <Label
//             htmlFor="companyIds"
//             className="text-sm font-medium text-gray-700"
//           >
//             Company
//           </Label>
//           <Select
//             value={selectedCompanyIds[0] ?? ''}
//             onValueChange={(value) => onCompanyIdsChange([value])}
//           >
//             <SelectTrigger className="w-full">
//               <SelectValue placeholder="Select company" />
//             </SelectTrigger>
//             <SelectContent>
//               {companies.map((company) => (
//                 <SelectItem
//                   key={company.companyId}
//                   value={company.companyId?.toString() ?? ''}
//                 >
//                   {company.companyName}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>

//         <Button
//           onClick={onRefresh}
//           className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
//         >
//           Refresh Data
//         </Button>
//       </div>
//     </div>
//   )
// }

// export default QuickAssetReportHeading


'use client'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import type { CompanyType } from '@/api/company-api'

interface QuickAssetReportHeadingProps {
  startDate: string
  endDate: string
  selectedCompanyIds: string[]
  companies: CompanyType[]
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
  onCompanyIdsChange: (ids: string[]) => void
  onRefresh: () => void
}

const QuickAssetReportHeading = ({
  startDate,
  endDate,
  selectedCompanyIds,
  companies,
  onStartDateChange,
  onEndDateChange,
  onCompanyIdsChange,
  onRefresh,
}: QuickAssetReportHeadingProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Quick Asset Report
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="space-y-2">
          <Label
            htmlFor="startDate"
            className="text-sm font-medium text-gray-700"
          >
            Start Date
          </Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="endDate"
            className="text-sm font-medium text-gray-700"
          >
            End Date
          </Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="companyIds"
            className="text-sm font-medium text-gray-700"
          >
            Company
          </Label>
          <Select
            value={selectedCompanyIds[0] ?? ''}
            onValueChange={(value) => onCompanyIdsChange([value])}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem
                  key={company.companyId}
                  value={company.companyId?.toString() ?? ''}
                >
                  {company.companyName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={onRefresh}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
        >
          Refresh Data
        </Button>
      </div>
    </div>
  )
}

export default QuickAssetReportHeading
