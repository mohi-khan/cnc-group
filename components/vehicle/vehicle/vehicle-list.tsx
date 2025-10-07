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
import { ArrowUpDown, Edit, Check, X } from 'lucide-react'
import {
  CostCenter,
  Employee,
  GetAllVehicleType,
  GetAssetData,
} from '@/utils/type'
import { updateVehicleEmployee } from '@/api/vehicle.api'
import { tokenAtom, useInitializeUser } from '@/utils/user'
import { useAtom } from 'jotai'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface VehicleListProps {
  AllVehicles: GetAllVehicleType[]
  onAddVehicle: () => void
  costCenters: CostCenter[]
  asset: GetAssetData[]
  employeeData: Employee[]
  refreshVehicles: () => void
}

type SortDirection = 'asc' | 'desc'
type SortColumn =
  | 'vehicleNo'
  | 'costCenterName'
  | 'description'
  | 'purchaseDate'
  | 'assetId'
  | 'employeeid'
  | 'driverName'
  | 'employeeName'

export const VehicleList: React.FC<VehicleListProps> = ({
  AllVehicles,
  onAddVehicle,
  asset,
  employeeData,
  refreshVehicles,
}) => {
  useInitializeUser()

  const [token] = useAtom(tokenAtom)
  const [sortColumn, setSortColumn] = useState<SortColumn>('vehicleNo')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [editingVehicle, setEditingVehicle] = useState<number | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const getAssetName = (id: number) =>
    asset.find((data) => Number(data.id) === id)?.name || 'Unknown'

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
  }, [sortedVehicles, currentPage, itemsPerPage])

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

  function onEditEmployee(vehicleId: number): void {
    setEditingVehicle(vehicleId)
    const vehicle = AllVehicles.find((v) => v.vehicleNo === vehicleId)
    setSelectedEmployee(vehicle ? vehicle.employeeid || null : null)
  }

  async function handleSaveEmployee(
    vehicleId: number,
    vehicleUser: number | null
  ) {
    if (vehicleUser === null) return
    try {
      await updateVehicleEmployee(vehicleId, vehicleUser, token)
      setEditingVehicle(null)
      setSelectedEmployee(null)
      refreshVehicles()
    } catch (error) {
      console.error('Failed to update vehicle employee:', error)
    }
  }

  function handleCancelEdit() {
    setEditingVehicle(null)
    setSelectedEmployee(null)
  }

  return (
    <div className="p-4">
      {/* Title with Items per Page beside it */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Vehicle List</h1>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {
              setItemsPerPage(Number(value))
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Items per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 per page</SelectItem>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="20">20 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
              <SelectItem value="100">100 per page</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={onAddVehicle}>ADD</Button>
      </div>

      <div className="mx-4 rounded-md">
        <Table className="border shadow-md ">
          <TableHeader className="sticky top-28 bg-slate-200">
            <TableRow>
              <SortableTableHead column="vehicleNo">
                Vehicle Name
              </SortableTableHead>
              <SortableTableHead column="costCenterName">
                Cost Center
              </SortableTableHead>
              <SortableTableHead column="description">
                Vehicle Description
              </SortableTableHead>
              <SortableTableHead column="purchaseDate">
                Purchase Date
              </SortableTableHead>
              <SortableTableHead column="assetId">Asset Name</SortableTableHead>
              <SortableTableHead column="driverName">
                Driver Name
              </SortableTableHead>
              <SortableTableHead column="employeeName">
                Employee Name
              </SortableTableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedVehicles.map((vehicle) => (
              <TableRow key={vehicle.vehicleNo}>
                <TableCell>{vehicle.description}</TableCell>
                <TableCell>{vehicle.costCenterName}</TableCell>
                <TableCell>{vehicle.description}</TableCell>
                <TableCell>
                  {new Date(vehicle.purchaseDate).toLocaleDateString()}
                </TableCell>
                <TableCell>{getAssetName(vehicle.assetId)}</TableCell>
                <TableCell>{vehicle.driverName}</TableCell>
                <TableCell>
                  {editingVehicle === vehicle.vehicleNo ? (
                    <select
                      value={selectedEmployee ?? ''}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setSelectedEmployee(Number(e.target.value))
                      }
                      className="border rounded p-1"
                    >
                      {employeeData.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.employeeName}
                        </option>
                      ))}
                    </select>
                  ) : (
                    vehicle.employeeName
                  )}
                </TableCell>
                <TableCell>
                  {editingVehicle === vehicle.vehicleNo ? (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleSaveEmployee(
                            vehicle.vehicleNo,
                            selectedEmployee
                          )
                        }
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEdit}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditEmployee(vehicle.vehicleNo)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Change User
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
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

            {[...Array(totalPages)].map((_, index) => {
              if (
                index === 0 ||
                index === totalPages - 1 ||
                (index >= currentPage - 2 && index <= currentPage + 2)
              ) {
                return (
                  <PaginationItem key={`page-${index}`}>
                    <PaginationLink
                      onClick={() => setCurrentPage(index + 1)}
                      isActive={currentPage === index + 1}
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                )
              } else if (
                index === currentPage - 3 ||
                index === currentPage + 3
              ) {
                return (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationLink>...</PaginationLink>
                  </PaginationItem>
                )
              }
              return null
            })}

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

// 'use client'

// import type React from 'react'
// import { useState, useMemo } from 'react'
// import { Button } from '@/components/ui/button'
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table'
// import {
//   Pagination,
//   PaginationContent,
//   PaginationItem,
//   PaginationLink,
//   PaginationNext,
//   PaginationPrevious,
// } from '@/components/ui/pagination'
// import { ArrowUpDown, Edit, Check, X } from 'lucide-react'
// import {
//   CostCenter,
//   Employee,
//   GetAllVehicleType,
//   GetAssetData,
// } from '@/utils/type'
// import { updateVehicleEmployee } from '@/api/vehicle.api'
// import { tokenAtom, useInitializeUser } from '@/utils/user'
// import { useAtom } from 'jotai'

// interface VehicleListProps {
//   AllVehicles: GetAllVehicleType[]
//   onAddVehicle: () => void
//   costCenters: CostCenter[]
//   asset: GetAssetData[]
//   employeeData: Employee[]
//   refreshVehicles: () => void
// }

// type SortDirection = 'asc' | 'desc'
// type SortColumn =
//   | 'vehicleNo'
//   | 'costCenterName'
//   | 'description'
//   | 'purchaseDate'
//   | 'assetId'
//   | 'employeeid'
//   | 'driverName'
//   | 'employeeName'

// export const VehicleList: React.FC<VehicleListProps> = ({
//   AllVehicles,
//   onAddVehicle,
//   asset,
//   employeeData,
//   refreshVehicles,
// }) => {
//   useInitializeUser()

//   const [token] = useAtom(tokenAtom)
//   const [sortColumn, setSortColumn] = useState<SortColumn>('vehicleNo')
//   const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
//   const [currentPage, setCurrentPage] = useState(1)
//   const [editingVehicle, setEditingVehicle] = useState<number | null>(null)
//   const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null)
//   const itemsPerPage = 10

//   const getAssetName = (id: number) =>
//     asset.find((data) => Number(data.id) === id)?.name || 'Unknown'

//   const sortedVehicles = useMemo(() => {
//     const sorted = [...AllVehicles]
//     sorted.sort((a, b) => {
//       if (sortColumn === 'purchaseDate') {
//         return sortDirection === 'asc'
//           ? new Date(a[sortColumn]).getTime() -
//               new Date(b[sortColumn]).getTime()
//           : new Date(b[sortColumn]).getTime() -
//               new Date(a[sortColumn]).getTime()
//       }
//       return sortDirection === 'asc'
//         ? String(a[sortColumn]).localeCompare(String(b[sortColumn]))
//         : String(b[sortColumn]).localeCompare(String(a[sortColumn]))
//     })
//     return sorted
//   }, [AllVehicles, sortColumn, sortDirection])

//   const paginatedVehicles = useMemo(() => {
//     const startIndex = (currentPage - 1) * itemsPerPage
//     return sortedVehicles.slice(startIndex, startIndex + itemsPerPage)
//   }, [sortedVehicles, currentPage])

//   const totalPages = Math.ceil(AllVehicles.length / itemsPerPage)

//   const handleSort = (column: SortColumn) => {
//     if (column === sortColumn) {
//       setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
//     } else {
//       setSortColumn(column)
//       setSortDirection('asc')
//     }
//   }

//   const SortableTableHead: React.FC<{
//     column: SortColumn
//     children: React.ReactNode
//   }> = ({ column, children }) => {
//     return (
//       <TableHead
//         onClick={() => handleSort(column)}
//         className="cursor-pointer hover:bg-muted/50 transition-colors"
//       >
//         <div className="flex items-center gap-1">
//           <span>{children}</span>
//           <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
//         </div>
//       </TableHead>
//     )
//   }

//   function onEditEmployee(vehicleId: number): void {
//     setEditingVehicle(vehicleId)
//     const vehicle = AllVehicles.find((v) => v.vehicleNo === vehicleId)
//     setSelectedEmployee(vehicle ? vehicle.employeeid || null : null)
//   }

//   async function handleSaveEmployee(
//     vehicleId: number,
//     vehicleUser: number | null
//   ) {
//     if (vehicleUser === null) return
//     try {
//       await updateVehicleEmployee(vehicleId, vehicleUser, token)
//       setEditingVehicle(null)
//       setSelectedEmployee(null)
//       refreshVehicles()
//     } catch (error) {
//       console.error('Failed to update vehicle employee:', error)
//     }
//   }

//   function handleCancelEdit() {
//     setEditingVehicle(null)
//     setSelectedEmployee(null)
//   }

//   return (
//     <div>
//       <div className="flex justify-between items-center mb-4 mx-4 mt-2">
//         <h1 className="text-2xl font-bold">Vehicle List</h1>
//         <Button onClick={onAddVehicle}>ADD</Button>
//       </div>
//       <div className="mx-4 rounded-md">
//         <Table className="border shadow-md ">
//           <TableHeader className="sticky top-28 bg-slate-200">
//             <TableRow>
//               <SortableTableHead column="vehicleNo">
//                 Vehicle Name
//               </SortableTableHead>
//               <SortableTableHead column="costCenterName">
//                 Cost Center
//               </SortableTableHead>
//               <SortableTableHead column="description">
//                 Vehicle Description
//               </SortableTableHead>
//               <SortableTableHead column="purchaseDate">
//                 Purchase Date
//               </SortableTableHead>
//               <SortableTableHead column="assetId">Asset Name</SortableTableHead>
//               <SortableTableHead column="driverName">
//                 Driver Name
//               </SortableTableHead>
//               <SortableTableHead column="employeeName">
//                 Employee Name
//               </SortableTableHead>

//               <TableHead>Actions</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {paginatedVehicles.map((vehicle) => (
//               <TableRow key={vehicle.vehicleNo}>
//                 <TableCell>{vehicle.description}</TableCell>
//                 <TableCell>{vehicle.costCenterName}</TableCell>
//                 <TableCell>{vehicle.description}</TableCell>
//                 <TableCell>
//                   {new Date(vehicle.purchaseDate).toLocaleDateString()}
//                 </TableCell>
//                 <TableCell>{getAssetName(vehicle.assetId)}</TableCell>
//                 <TableCell>{vehicle.driverName}</TableCell>

//                 <TableCell>
//                   {editingVehicle === vehicle.vehicleNo ? (
//                     <select
//                       value={selectedEmployee ?? ''}
//                       onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
//                         setSelectedEmployee(Number(e.target.value))
//                       }
//                       className="border rounded p-1"
//                     >
//                       {employeeData.map((emp) => (
//                         <option key={emp.id} value={emp.id}>
//                           {emp.employeeName}
//                         </option>
//                       ))}
//                     </select>
//                   ) : (
//                     vehicle.employeeName
//                   )}
//                 </TableCell>
//                 <TableCell>
//                   {editingVehicle === vehicle.vehicleNo ? (
//                     <div className="flex gap-2">
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() =>
//                           handleSaveEmployee(
//                             vehicle.vehicleNo,
//                             selectedEmployee
//                           )
//                         }
//                       >
//                         <Check className="h-4 w-4" />
//                       </Button>
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={handleCancelEdit}
//                       >
//                         <X className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   ) : (
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => onEditEmployee(vehicle.vehicleNo)}
//                     >
//                       <Edit className="h-4 w-4 mr-2" />
//                       Change User
//                     </Button>
//                   )}
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </div>
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

//             {[...Array(totalPages)].map((_, index) => {
//               if (
//                 index === 0 ||
//                 index === totalPages - 1 ||
//                 (index >= currentPage - 2 && index <= currentPage + 2)
//               ) {
//                 return (
//                   <PaginationItem key={`page-${index}`}>
//                     <PaginationLink
//                       onClick={() => setCurrentPage(index + 1)}
//                       isActive={currentPage === index + 1}
//                     >
//                       {index + 1}
//                     </PaginationLink>
//                   </PaginationItem>
//                 )
//               } else if (
//                 index === currentPage - 3 ||
//                 index === currentPage + 3
//               ) {
//                 return (
//                   <PaginationItem key={`ellipsis-${index}`}>
//                     <PaginationLink>...</PaginationLink>
//                   </PaginationItem>
//                 )
//               }

//               return null
//             })}

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
