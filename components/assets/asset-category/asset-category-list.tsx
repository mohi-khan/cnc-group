import React from 'react'
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AssetCategoryType } from '@/utils/type'

interface AssetCategoryListProps {
  categories: AssetCategoryType[]
  onAddCategory: () => void
}

export const AssetCategoryList: React.FC<AssetCategoryListProps> = ({ categories, onAddCategory }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
      <h1 className="text-2xl font-bold mb-4">Asset Categories</h1>
        <Button onClick={onAddCategory}>Add Asset Category</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category Name</TableHead>
            <TableHead>Depreciation Rate</TableHead>
            <TableHead>Account Code</TableHead>
            <TableHead>Depreciation Account Code</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.category_id}>
              <TableCell>{category.category_name}</TableCell>
              <TableCell>{category.depreciation_rate}%</TableCell>
              <TableCell>{category.account_code}</TableCell>
              <TableCell>{category.depreciation_account_code}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

