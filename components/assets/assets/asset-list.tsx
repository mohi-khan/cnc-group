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
  // Function to handle adding category
}

export const AssetList: React.FC<AssetCategoryListProps> = ({ asset }) => {
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
            <TableHead>Category Id</TableHead>
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
            <TableRow key={assets.id}>
              <TableCell>{assets.name}</TableCell>
              <TableCell>{assets.type}</TableCell>
              <TableCell>{assets.company}</TableCell>
              <TableCell>{assets.location}</TableCell>
              <TableCell>{assets.depreciationMethod}</TableCell>
              <TableCell>{assets.currentValue}</TableCell>
              <TableCell>{assets.purchaseDate}</TableCell>
              <TableCell>{assets.purchaseValue}</TableCell>
              <TableCell>{assets.salvageValue}</TableCell>
              <TableCell>{assets.usefulLifeYears}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default AssetList
