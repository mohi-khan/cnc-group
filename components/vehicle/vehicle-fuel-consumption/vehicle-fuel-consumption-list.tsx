'use client'

import React, { useState, useMemo, useCallback } from 'react'
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
import { GetAllVehicleType, GetVehicleConsumptionType } from '@/utils/type'

interface VehicleFuelConsumptionListProps {
  vehicleFuel: GetVehicleConsumptionType[]
  onAddVehicle: () => void
  vehicles: GetAllVehicleType[]
}

type SortColumn =
  | 'vehicleName'
  | 'octConsumption'
  | 'gasConsumption'
  | 'totalConsumption'
  | 'kmrsPerLitr'
  | 'transDate'
type SortDirection = 'asc' | 'desc'

const VehicleFuelConsumptionList: React.FC<VehicleFuelConsumptionListProps> = ({
  vehicleFuel,
  onAddVehicle,
  vehicles,
}) => {
  const [sortColumn, setSortColumn] = useState<SortColumn>('transDate')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const getVehicleName = useCallback(
    (vehicleNo: number) => {
      const vehicle = vehicles.find((v) => v.vehicleNo === vehicleNo)
      return vehicle ? vehicle.description : ''
    },
    [vehicles]
  )
  
  

  const sortedFuelData = useMemo(() => {
    const sorted = [...vehicleFuel].map((item) => ({
      ...item,
      vehicleName: getVehicleName(item.vehicleId),
    }))

    sorted.sort((a, b) => {
      if (sortColumn === 'transDate') {
        return sortDirection === 'asc'
          ? new Date(a.transDate).getTime() - new Date(b.transDate).getTime()
          : new Date(b.transDate).getTime() - new Date(a.transDate).getTime()
      }
      return sortDirection === 'asc'
        ? String(a[sortColumn]).localeCompare(String(b[sortColumn]))
        : String(b[sortColumn]).localeCompare(String(a[sortColumn]))
    })
    return sorted
  }, [vehicleFuel, sortColumn, sortDirection, getVehicleName])


  const paginatedFuelData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedFuelData.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedFuelData, currentPage])

  const totalPages = Math.ceil(vehicleFuel.length / itemsPerPage)

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
  }> = ({ column, children }) => (
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

  return (
    <div>
      <div className="flex justify-between items-center mb-4 mx-4 mt-2">
        <h1 className="text-2xl font-bold">Vehicle Fuel Consumption</h1>
        <Button onClick={onAddVehicle}>ADD</Button>
      </div>
      <Table className="border shadow-md">
        <TableHeader className="sticky top-28 bg-slate-200">
          <TableRow>
            <SortableTableHead column="vehicleName">
              Vehicle Name
            </SortableTableHead>
            <SortableTableHead column="octConsumption">
              Octane Consumption
            </SortableTableHead>
            <SortableTableHead column="gasConsumption">
              Gas Consumption
            </SortableTableHead>
            <SortableTableHead column="totalConsumption">
              Total Consumption
            </SortableTableHead>
            <SortableTableHead column="kmrsPerLitr">
              Km per Liter
            </SortableTableHead>
            <SortableTableHead column="transDate">
              Transaction Date
            </SortableTableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedFuelData.map((data) => (
            <TableRow key={data.id}>
              <TableCell>{data.vehicleName}</TableCell>
              <TableCell>{data.octConsumption}</TableCell>
              <TableCell>{data.gasConsumption}</TableCell>
              <TableCell>{data.totalConsumption}</TableCell>
              <TableCell>{data.kmrsPerLitr}</TableCell>
              <TableCell>
                {' '}
                {new Date(data.transDate).toLocaleDateString()} 
              </TableCell>
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

export default VehicleFuelConsumptionList



