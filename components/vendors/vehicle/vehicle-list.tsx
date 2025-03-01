

'use client'

import type React from 'react'
import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { ArrowUpDown } from 'lucide-react'
import { CostCenter, GetAllVehicleType, GetAssetData } from '@/utils/type'

interface VehicleListProps {
  AllVehicles: GetAllVehicleType[]
  onAddVehicle: () => void
  costCenters: CostCenter[]
  asset: GetAssetData[]
}

type SortColumn =
  | 'vehicleNo'
  | 'costCenterId'
  | 'vehicleDescription'
  | 'purchaseDate'
  | 'assetId'
type SortDirection = 'asc' | 'desc'

export const VehicleList: React.FC<VehicleListProps> = ({
  AllVehicles,
  onAddVehicle,
  costCenters,
  asset,
}) => {
  const [sortColumn, setSortColumn] = useState<SortColumn>('vehicleNo')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Function to get cost center name by ID
  const getCostCenterName = (id: number) => {
    return (
      costCenters.find((center) => center.costCenterId === id)
        ?.costCenterName || 'Unknown'
    )
  }

  const getAssetName = (id: number) => {
    return asset.find((data) => Number(data.id) === id)?.name
  

  }

  const sortedVehicles = useMemo(() => {
    const sorted = [...AllVehicles]
    sorted.sort((a, b) => {
      if (sortColumn === 'purchaseDate') {
        return sortDirection === 'asc'
          ? new Date(a[sortColumn]).getTime() -
              new Date(b[sortColumn]).getTime()
          : new Date(b[sortColumn]).getTime() -
              new Date(a[sortColumn]).getTime()
      }
      return sortDirection === 'asc'
        ? String(a[sortColumn]).localeCompare(String(b[sortColumn]))
        : String(b[sortColumn]).localeCompare(String(a[sortColumn]))
    })
    return sorted
  }, [AllVehicles, sortColumn, sortDirection])

  const paginatedVehicles = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedVehicles.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedVehicles, currentPage])

  const totalPages = Math.ceil(AllVehicles.length / itemsPerPage)

  const handleSort = (column: SortColumn) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const SortableTableHead: React.FC<{
    column: SortColumn
    children: React.ReactNode
  }> = ({ column, children }) => {
    const isActive = column === sortColumn
    return (
      <TableHead
        onClick={() => handleSort(column)}
        className="cursor-pointer hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-1">
          <span>{children}</span>
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </TableHead>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4 mx-4 mt-2">
        <h1 className="text-2xl font-bold">Vehicle List</h1>
        <Button onClick={onAddVehicle}>ADD</Button>
      </div>
      <Table className="border shadow-md">
        <TableHeader className="sticky top-28 bg-slate-200">
          <TableRow>
            <SortableTableHead column="vehicleNo">Vehicle No</SortableTableHead>
            <SortableTableHead column="costCenterId">
              Cost Center
            </SortableTableHead>
            <SortableTableHead column="vehicleDescription">
              Vehicle Description
            </SortableTableHead>
            <SortableTableHead column="purchaseDate">
              Purchase Date
            </SortableTableHead>
            <SortableTableHead column="assetId">Asset Name</SortableTableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedVehicles.map((vehicle) => (
            <TableRow key={vehicle.vehicleNo}>
              <TableCell>{vehicle.vehicleNo}</TableCell>
              <TableCell>{getCostCenterName(vehicle.costCenterId)}</TableCell>
              <TableCell>{vehicle.vehicleDescription}</TableCell>
              <TableCell>
                {new Date(vehicle.purchaseDate).toLocaleDateString()}
               
              </TableCell>
              <TableCell>{getAssetName(vehicle.assetId)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
