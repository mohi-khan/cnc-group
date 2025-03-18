import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { GetAllVehicleType, VehicleSummaryType } from '@/utils/type'

interface VehicleSummaryTableListProps {
   vehicles: GetAllVehicleType[]
  vehicleSummary: {
    month: number
    year: number
    pivotData: VehicleSummaryType[][]
  }[]
   targetRef: React.RefObject<HTMLTableElement>

}

const VehicleSummaryTableList: React.FC<VehicleSummaryTableListProps> = ({
  vehicleSummary,vehicles,targetRef
}) => {
  return (
    <Card className="p-4">
      <Table ref={targetRef} className="border shadow-md ">
        <TableHeader className="bg-slate-200 shadow-md sticky top-28">
          <TableRow>
            <TableHead>Vehicle Name</TableHead>
            <TableHead>Accounts Payable</TableHead>
            <TableHead>Barrett Kelley</TableHead>
            <TableHead>Hashim England 1</TableHead>
            <TableHead>Total Oct Consumption</TableHead>
            <TableHead>Total Gas Consumption</TableHead>
            <TableHead>Total KM</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicleSummary.map((monthData) =>
            monthData.pivotData[0].map((row, index) => {
              const vehicle = vehicles.find(
                (v) => v.vehicleNo === row.vehicleNo
              )
              return (
                <TableRow key={`${monthData.month}-${monthData.year}-${index}`}>
                  <TableCell>{vehicle?.description || 'N/A'}</TableCell>
                  <TableCell>{row['Accounts Payable']}</TableCell>
                  <TableCell>{row['Barrett Kelley']}</TableCell>
                  <TableCell>{row['Hashim England 1']}</TableCell>
                  <TableCell>{row.total_oct_consumption || 'N/A'}</TableCell>
                  <TableCell>{row.total_gas_consumption || 'N/A'}</TableCell>
                  <TableCell>{row.total_km || 'N/A'}</TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </Card>
  )
}

export default VehicleSummaryTableList