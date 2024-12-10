import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

// Updated dummy data
const voucherData = {
  voucherNo: 'RV-2023-042',
  companyName: 'GreenLeaf Innovations',
  location: 'Austin, TX',
  currency: 'EUR',
  accountName: 'Research and Development',
  costCenter: 'Product Innovation',
  department: 'Sustainability',
  partnerName: 'Dr. Emma Rodriguez',
  remarks: 'Eco-friendly material research project funding',
  totalAmount: '25,000.00',
}

export default function ReceiptVoucher() {
  return (
    <Card className="w-full max-w-3xl mx-auto my-4">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center border-2 p-4 shadow-lg">
          Receipt Voucher
        </CardTitle>
        <p className="text-center text-muted-foreground"></p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="voucherNo">Voucher No</Label>
            <p id="voucherNo" className="text-sm font-medium">
              {voucherData.voucherNo}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <p id="company" className="text-sm font-medium">
              {voucherData.companyName}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <p id="location" className="text-sm font-medium">
              {voucherData.location}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Badge
              variant="secondary"
              className="text-lg font-bold"
              id="currency"
            >
              {voucherData.currency}
            </Badge>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Item</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Account Name</TableCell>
              <TableCell>{voucherData.accountName}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Cost Center</TableCell>
              <TableCell>{voucherData.costCenter}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Department</TableCell>
              <TableCell>{voucherData.department}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Partner Name</TableCell>
              <TableCell>{voucherData.partnerName}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Remarks</TableCell>
              <TableCell>{voucherData.remarks}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex flex-col items-end space-y-2">
        <Label htmlFor="totalAmount" className="text-lg">
          Total Funding Amount
        </Label>
        <p id="totalAmount" className="text-3xl font-bold text-primary">
          <span className="text-2xl font-extrabold mr-2">
            {voucherData.currency}
          </span>
          {voucherData.totalAmount}
        </p>
      </CardFooter>
    </Card>
  )
}
