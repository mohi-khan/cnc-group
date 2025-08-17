'use strict'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { vehiclePerLitreCost } from '@/utils/type'

interface VehiclePerformanceReportListProps {
  targetRef: React.RefObject<HTMLDivElement>
  vehiclePerformanceData: vehiclePerLitreCost[]
} 

const VehiclePerformanceReportList: React.FC<VehiclePerformanceReportListProps> = ({targetRef, vehiclePerformanceData}) => {
  const allCostTypes = Array.from(
    new Set(
      vehiclePerformanceData
        .map(item => item.costBreakdown ? Object.keys(item.costBreakdown) : [])
        .flat()
    )
  )

  return (
    <div
      ref={targetRef}
      style={{
       
        padding: '16px', // this acts as a 4px margin inside the PDF
      }}
      className="mt-10 mx-4"
    >
      <Table className="border shadow-md mt-10  ">
        <TableHeader className="bg-slate-200 shadow-md sticky top-28">
          <TableRow>
            <TableHead>Year</TableHead>
            <TableHead>Month</TableHead>
            <TableHead>Gas Consumption</TableHead>
            <TableHead>Octane Consumption</TableHead>
            <TableHead>KM/Litre</TableHead>
            {allCostTypes.map((costType, index) => (
              <TableHead key={index}>{costType}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehiclePerformanceData.map(
            (item: vehiclePerLitreCost, index: number) => (
              <TableRow key={index}>
                <TableCell>{item.year}</TableCell>
                <TableCell>
                  {new Date(0, item.month - 1).toLocaleString('default', {
                    month: 'long',
                  })}
                </TableCell>
                <TableCell>{item.gasConsumption}</TableCell>
                <TableCell>{item.octaneConsumption}</TableCell>
                <TableCell>{item.kmrsperlitre}</TableCell>
                {allCostTypes.map((costType, costIndex) => (
                  <TableCell key={costIndex}>
                    {item.costBreakdown?.[costType] || ''}
                  </TableCell>
                ))}
              </TableRow>
            )
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default VehiclePerformanceReportList
