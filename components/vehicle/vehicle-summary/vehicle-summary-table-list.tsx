// import React from 'react'

// const VehicleSummaryTableList = () => {
//   return <div>VehicleSummaryTableList</div>
// }

// export default VehicleSummaryTableList


import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import exp from "constants";

const data = [
  {
    vehicleNo: 1,
    "Accounts Payable": "-190.00",
    "Barrett Kelley": "-158.00",
    "Hashim England 1": "-174.00",
    total_oct_consumption: "N/A",
    total_gas_consumption: "N/A",
    total_km: "N/A",
  },
  {
    vehicleNo: 2,
    "Accounts Payable": "-250.00",
    "Barrett Kelley": "-180.00",
    "Hashim England 1": "-220.00",
    total_oct_consumption: "150L",
    total_gas_consumption: "200L",
    total_km: "1500",
  },
  {
    vehicleNo: 3,
    "Accounts Payable": "-320.00",
    "Barrett Kelley": "-280.00",
    "Hashim England 1": "-290.00",
    total_oct_consumption: "180L",
    total_gas_consumption: "220L",
    total_km: "2000",
  },
  {
    vehicleNo: 4,
    "Accounts Payable": "-150.00",
    "Barrett Kelley": "-130.00",
    "Hashim England 1": "-145.00",
    total_oct_consumption: "120L",
    total_gas_consumption: "160L",
    total_km: "1200",
  },
  {
    vehicleNo: 5,
    "Accounts Payable": "-280.00",
    "Barrett Kelley": "-240.00",
    "Hashim England 1": "-260.00",
    total_oct_consumption: "200L",
    total_gas_consumption: "250L",
    total_km: "2500",
  }
];
const VehicleSummaryTableList = () => {  return (
    <Card className="p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vehicle No</TableHead>
            <TableHead>Accounts Payable</TableHead>
            <TableHead>Barrett Kelley</TableHead>
            <TableHead>Hashim England 1</TableHead>
            <TableHead>Total Oct Consumption</TableHead>
            <TableHead>Total Gas Consumption</TableHead>
            <TableHead>Total KM</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.vehicleNo}</TableCell>
              <TableCell>{row["Accounts Payable"]}</TableCell>
              <TableCell>{row["Barrett Kelley"]}</TableCell>
              <TableCell>{row["Hashim England 1"]}</TableCell>
              <TableCell>{row.total_oct_consumption}</TableCell>
              <TableCell>{row.total_gas_consumption}</TableCell>
              <TableCell>{row.total_km}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

export default VehicleSummaryTableList;