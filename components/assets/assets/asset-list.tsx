// 'use client'

// import type React from 'react'
// import { useState, useMemo } from 'react'
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table'
// import type {
//   AssetCategoryType,
//   CreateAssetData,
//   GetAssetData,
// } from '@/utils/type'
// import { Button } from '@/components/ui/button'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select'
// import {
//   Pagination,
//   PaginationContent,
//   PaginationEllipsis,
//   PaginationItem,
//   PaginationLink,
//   PaginationNext,
//   PaginationPrevious,
// } from '@/components/ui/pagination'

// interface AssetListProps {
//   asset: GetAssetData[]
//   onAddCategory: () => void
//   categories: AssetCategoryType[]
// }

// export const AssetList: React.FC<AssetListProps> = ({
//   asset,
//   onAddCategory,
// }) => {
//   const [sortBy, setSortBy] = useState<string>('name-asc')
//   const [currentPage, setCurrentPage] = useState(1)
//   const itemsPerPage = 10

//   const sortedAssets = useMemo(() => {
//     const sorted = [...asset]
//     switch (sortBy) {
//       case 'name-asc':
//         sorted.sort((a, b) => a.name.localeCompare(b.name))
//         break
//       case 'name-desc':
//         sorted.sort((a, b) => b.name.localeCompare(a.name))
//         break
//       case 'date-desc':
//         sorted.sort(
//           (a, b) =>
//             new Date(b.purchaseDate).getTime() -
//             new Date(a.purchaseDate).getTime()
//         )
//         break
//       case 'date-asc':
//         sorted.sort(
//           (a, b) =>
//             new Date(a.purchaseDate).getTime() -
//             new Date(b.purchaseDate).getTime()
//         )
//         break
//     }
//     return sorted
//   }, [asset, sortBy])

//   const paginatedAssets = useMemo(() => {
//     const startIndex = (currentPage - 1) * itemsPerPage
//     return sortedAssets.slice(startIndex, startIndex + itemsPerPage)
//   }, [sortedAssets, currentPage])

//   const totalPages = Math.ceil(asset.length / itemsPerPage)

//   return (
//     <div className="p-4">
//       {/* Header Section */}
//       <div className="flex justify-between items-center mb-6">
//         <div className="flex items-center gap-4">
//           <h1 className="text-2xl font-bold">Asset List</h1>
//           <Select value={sortBy} onValueChange={setSortBy}>
//             <SelectTrigger className="w-[200px]">
//               <SelectValue placeholder="Sort by" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="name-asc">Asset Name (A-Z)</SelectItem>
//               <SelectItem value="name-desc">Asset Name (Z-A)</SelectItem>
//               <SelectItem value="date-desc">Purchase Date (Latest)</SelectItem>
//               <SelectItem value="date-asc">Purchase Date (Oldest)</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
//         <Button onClick={onAddCategory}>Add Asset List</Button>
//       </div>

//       {/* Table Section */}
//       <Table className="border shadow-md">
//         <TableHeader className="sticky top-28 bg-slate-200 shadow-md">
//           <TableRow>
//             <TableHead>Asset Name</TableHead>
//             <TableHead>Category Id</TableHead>
//             <TableHead>Company Name</TableHead>
//             <TableHead>Location Name</TableHead>
//             <TableHead>Depreciation Name</TableHead>
//             <TableHead>Current Value</TableHead>
//             <TableHead>Purchase Date</TableHead>
//             <TableHead>Purchase Value</TableHead>
//             <TableHead>Salvage Value</TableHead>
//             <TableHead>Useful Life (Year)</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {paginatedAssets.map((assets) => (
//             <TableRow key={assets.id}>
//               <TableCell>{assets.name}</TableCell>
//               <TableCell>{assets.type}</TableCell>
//               <TableCell>{assets.company}</TableCell>
//               <TableCell>{assets.location}</TableCell>
//               <TableCell>{assets.depreciationMethod}</TableCell>
//               <TableCell>{assets.currentValue}</TableCell>
//               <TableCell>{assets.purchaseDate}</TableCell>
//               <TableCell>{assets.purchaseValue}</TableCell>
//               <TableCell>{assets.salvageValue}</TableCell>
//               <TableCell>{assets.usefulLifeYears}</TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>

//       {/* Pagination Section */}
//       <div className="mt-4">
//         <Pagination>
//           <PaginationContent>
//             <PaginationItem>
//               <PaginationPrevious
//                 onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//                 className={
//                   currentPage === 1 ? 'pointer-events-none opacity-50' : ''
//                 }
//               />
//             </PaginationItem>
//             {[...Array(totalPages)].map((_, index) => (
//               <PaginationItem key={index}>
//                 <PaginationLink
//                   onClick={() => setCurrentPage(index + 1)}
//                   isActive={currentPage === index + 1}
//                 >
//                   {index + 1}
//                 </PaginationLink>
//               </PaginationItem>
//             ))}
//             <PaginationItem>
//               <PaginationNext
//                 onClick={() =>
//                   setCurrentPage((prev) => Math.min(prev + 1, totalPages))
//                 }
//                 className={
//                   currentPage === totalPages
//                     ? 'pointer-events-none opacity-50'
//                     : ''
//                 }
//               />
//             </PaginationItem>
//           </PaginationContent>
//         </Pagination>
//       </div>
//     </div>
//   )
// }

// export default AssetList

'use client'

import type React from 'react'
import { useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { AssetCategoryType, GetAssetData } from '@/utils/type'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Plus } from 'lucide-react'

interface AssetListProps {
  asset: GetAssetData[]
  onAddCategory: () => void
  categories: AssetCategoryType[]
}

export const AssetList: React.FC<AssetListProps> = ({
  asset,
  onAddCategory,
  categories,
}) => {
  const [sortBy, setSortBy] = useState<string>('name-asc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const sortedAssets = useMemo(() => {
    const sorted = [...asset]
    switch (sortBy) {
      case 'name-asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'name-desc':
        sorted.sort((a, b) => b.name.localeCompare(a.name))
        break
      case 'date-desc':
        sorted.sort(
          (a, b) =>
            new Date(b.purchaseDate).getTime() -
            new Date(a.purchaseDate).getTime()
        )
        break
      case 'date-asc':
        sorted.sort(
          (a, b) =>
            new Date(a.purchaseDate).getTime() -
            new Date(b.purchaseDate).getTime()
        )
        break
    }
    return sorted
  }, [asset, sortBy])

  const paginatedAssets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedAssets.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedAssets, currentPage])

  const totalPages = Math.ceil(asset.length / itemsPerPage)

  return (
    <div className="p-4">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Asset List</h1>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Asset Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Asset Name (Z-A)</SelectItem>
              <SelectItem value="date-desc">Purchase Date (Latest)</SelectItem>
              <SelectItem value="date-asc">Purchase Date (Oldest)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={onAddCategory}>
          <Plus className="h-4 w-4 mr-2" />
          ADD
        </Button>
      </div>

      {/* Table Section */}
      <Table className="border shadow-md">
        <TableHeader className="sticky top-28 bg-slate-200 shadow-md">
          <TableRow>
            <TableHead>Asset Name</TableHead>
            <TableHead>Category Name</TableHead>
            <TableHead>Company Name</TableHead>
            <TableHead>Location Name</TableHead>
            <TableHead>Depreciation Name</TableHead>
            <TableHead>Current Value</TableHead>
            <TableHead>Purchase Date</TableHead>
            <TableHead>Purchase Value</TableHead>
            <TableHead>Salvage Value</TableHead>
            <TableHead>Useful Life (Year)</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Cost Center</TableHead>
            <TableHead>Depreciation Rate</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedAssets.map((assets) => {
            // Find category name based on categoryId
            const category = categories.find(
              (cat) => cat.category_id === assets.type
            )
            return (
              <TableRow key={assets.id}>
                <TableCell>{assets.name}</TableCell>
                <TableCell>
                  {category ? category.category_name : 'Unknown'}
                </TableCell>
                <TableCell>{assets.company}</TableCell>
                <TableCell>{assets.location}</TableCell>
                <TableCell>{assets.depreciationMethod}</TableCell>
                <TableCell>{assets.currentValue}</TableCell>
                <TableCell>{assets.purchaseDate}</TableCell>
                <TableCell>{assets.purchaseValue}</TableCell>
                <TableCell>{assets.salvageValue}</TableCell>
                <TableCell>{assets.usefulLifeYears}</TableCell>
                <TableCell>{assets.department}</TableCell>
                <TableCell>{assets.costCenter}</TableCell>
                <TableCell>{assets.depreciationRate}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {/* Pagination Section */}
      <div className="mt-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className={
                  currentPage === 1 ? 'pointer-events-none opacity-50' : ''
                }
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  onClick={() => setCurrentPage(index + 1)}
                  isActive={currentPage === index + 1}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                className={
                  currentPage === totalPages
                    ? 'pointer-events-none opacity-50'
                    : ''
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}

export default AssetList
