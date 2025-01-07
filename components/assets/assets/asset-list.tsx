'use client'
import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CreateAssetData } from '@/utils/type'
import { Button } from '@/components/ui/button'

interface AssetCategoryListProps {
  asset: CreateAssetData[] // Asset data type
  onAddCategory: () => void // Function to handle adding category
}

const AssetList: React.FC<AssetCategoryListProps> = ({ asset }) => {
  return (
    <div className="p-4">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Asset List</h1>
        <Button>Add Asset Category</Button>
      </div>

      {/* Table Section */}
      <Table>
        <TableHeader>
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {asset.map((assets) => (
            <TableRow key={assets.asset_id}>
              <TableCell>{assets.asset_name}</TableCell>
              <TableCell>{assets.category_id}</TableCell>
              <TableCell>{assets.company_id}</TableCell>
              <TableCell>{assets.location_id}</TableCell>
              <TableCell>{assets.depreciation_method}</TableCell>
              <TableCell>{assets.current_value}</TableCell>
              <TableCell>{assets.purchase_date}</TableCell>
              <TableCell>{assets.purchase_value}</TableCell>
              <TableCell>{assets.salvage_value}</TableCell>
              <TableCell>{assets.useful_life_years}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default AssetList

// import React from 'react'
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table'
// import { CreateAssetData } from '@/utils/type'
// import { Button } from '@/components/ui/button'

// interface AssetCategoryListProps {
//   asset: CreateAssetData[]
//   onAddCategory: () => void
// }

// const AssetList: React.FC<AssetCategoryListProps> = ({ asset }) => {
//   console.log(asset)

//   return (
//     <div>
//       <div className="flex justify-between items-center mb-4">
//         <div className="flex justify-between items-center mb-4">
//           <h1 className="text-2xl font-bold mb-4">Asset List</h1>
//           <Button>Add Asset Category</Button>
//         </div>

//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Asset Name</TableHead>
//               <TableHead>Category Name</TableHead>
//               <TableHead>Company Name</TableHead>
//               <TableHead>Location Name</TableHead>
//               <TableHead>Depreciation Name</TableHead>
//               <TableHead>Current Value</TableHead>
//               <TableHead>Purchase Date</TableHead>
//               <TableHead>Purchase Value</TableHead>
//               <TableHead>Salvage Value</TableHead>
//               <TableHead>Useful Life (Year)</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody></TableBody>
//         </Table>
//         {/* <TableBody>
//         {asset?.map((assets) => (
//           <TableRow key={assets.asset_id}>
//             <TableCell>{assets.category_name}</TableCell>
//             <TableCell>{assets.depreciation_rate}%</TableCell>
//             <TableCell>{assets.account_code}</TableCell>
//             <TableCell>{asset.depreciation_account_code}</TableCell>
//           </TableRow>
//         ))}
//       </TableBody> */}
//       </div>
//     </div>
//   )
// }

// export default AssetList
