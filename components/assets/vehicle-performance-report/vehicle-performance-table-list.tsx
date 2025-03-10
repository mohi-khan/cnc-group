'use strict'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const data = [
  {
    month: 'Total',
    grantTotal: 71930,
    fuel: {
      totalFuelConsu: 15162,
      totalDieselItrs: 118,
      gasCbm: 0,
      totalCbm: 146,
      kmsOperatedTo0: 632,
      kmsLtr: 0,
      maintenanceTk: 15194,
      serviceChargeTk: 3369,
      taxTokenFitness: 11830,
      insuranceTk: 20597,
      driverSalaryBenefitsTk: 5778,
      ot: 3502,
    },
  },
  {
    month: 'Jan',
    grantTotal: 56620,
    fuel: {
      totalFuelConsu: 8580,
      totalDieselItrs: 66,
      gasCbm: 81.16,
      totalCbm: 835,
      kmsOperatedTo0: 10.29,
      kmsLtr: 12565,
      maintenanceTk: 10110,
      serviceChargeTk: 0,
      taxTokenFitness: 0,
      insuranceTk: 20597,
      driverSalaryBenefitsTk: 4768,
      ot: 3502,
    },
  },
  {
    month: 'Feb',
    grantTotal: 48750,
    fuel: {
      totalFuelConsu: 7850,
      totalDieselItrs: 58,
      gasCbm: 75.2,
      totalCbm: 780,
      kmsOperatedTo0: 9.85,
      kmsLtr: 11890,
      maintenanceTk: 9580,
      serviceChargeTk: 0,
      taxTokenFitness: 0,
      insuranceTk: 15420,
      driverSalaryBenefitsTk: 4120,
      ot: 3502,
    },
  },
  {
    month: 'Mar',
    grantTotal: 52340,
    fuel: {
      totalFuelConsu: 8120,
      totalDieselItrs: 62,
      gasCbm: 78.5,
      totalCbm: 810,
      kmsOperatedTo0: 10.05,
      kmsLtr: 12240,
      maintenanceTk: 9890,
      serviceChargeTk: 0,
      taxTokenFitness: 0,
      insuranceTk: 16780,
      driverSalaryBenefitsTk: 4500,
      ot: 3502,
    },
  },
  {
    month: 'Apr',
    grantTotal: 49890,
    fuel: {
      totalFuelConsu: 7920,
      totalDieselItrs: 60,
      gasCbm: 76.8,
      totalCbm: 795,
      kmsOperatedTo0: 9.9,
      kmsLtr: 11950,
      maintenanceTk: 9650,
      serviceChargeTk: 0,
      taxTokenFitness: 0,
      insuranceTk: 15890,
      driverSalaryBenefitsTk: 4280,
      ot: 3502,
    },
  },
]

const VehiclePerformanceReportList = () => {
  return (
    <Table className="border shadow-md mt-10  ">
      <TableHeader className="bg-slate-200 shadow-md sticky top-28">
        <TableRow>
          <TableHead>Month</TableHead>
          <TableHead>Grant Total</TableHead>
          <TableHead>Total Fuel (Consu)</TableHead>
          <TableHead>Octane/ Diesel (Itrs)</TableHead>
          <TableHead>Gas (cbm)</TableHead>
          <TableHead>Total Converted to(cbm)</TableHead>
          <TableHead>Kms Operated to 0</TableHead>
          <TableHead>Kms/Ltr</TableHead>
          <TableHead>Maintenance (Tk)</TableHead>
          <TableHead>Service Charge (Tk)</TableHead>
          <TableHead>Tax Token & Fitness</TableHead>
          <TableHead>Insurance (Tk)</TableHead>
          <TableHead>Drivers Salary & Benefits (Tk)</TableHead>
          <TableHead>OT (Tk)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item, index) => (
          <TableRow key={index}>
            <TableCell>{item.month}</TableCell>
            <TableCell>{item.grantTotal}</TableCell>
            <TableCell>{item.fuel.totalFuelConsu}</TableCell>
            <TableCell>{item.fuel.totalDieselItrs}</TableCell>
            <TableCell>{item.fuel.gasCbm}</TableCell>
            <TableCell>{item.fuel.totalCbm}</TableCell>
            <TableCell>{item.fuel.kmsOperatedTo0}</TableCell>
            <TableCell>{item.fuel.kmsLtr}</TableCell>
            <TableCell>{item.fuel.maintenanceTk}</TableCell>
            <TableCell>{item.fuel.serviceChargeTk}</TableCell>
            <TableCell>{item.fuel.taxTokenFitness}</TableCell>
            <TableCell>{item.fuel.insuranceTk}</TableCell>
            <TableCell>{item.fuel.driverSalaryBenefitsTk}</TableCell>
            <TableCell>{item.fuel.ot}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default VehiclePerformanceReportList
