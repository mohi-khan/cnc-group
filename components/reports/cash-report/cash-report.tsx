import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'

export default function CashReport() {
  // Create empty rows for the tables
  const emptyRows = Array(15).fill(null)

  return (
    <Card className="w-full border border-gray-300 rounded-none shadow-none ">
      <CardContent className="px-6 my-10">
        {/* Header */}
        <div className="text-center border-b border-gray-300 py-2">
          <h1 className="text-base font-semibold">National Accessories Ltd.</h1>
          <h2 className="text-base font-medium">
            Daily Cash Transaction Report
          </h2>
          <p className="text-sm">Dated: Tuesday, April 8, 2025</p>
        </div>

        <div className="grid grid-cols-2">
          {/* Left side - Received */}
          <div className="border-r border-gray-300">
            <Table className="border-collapse">
              <TableHeader className="bg-slate-200 shadow-md">
                <TableRow className="shadow-md">
                  <TableHead className="h-8 border border-gray-300 text-center font-medium p-0 text-sm">
                    Date
                  </TableHead>
                  <TableHead className="h-8 border border-gray-300 text-center font-medium p-0 text-sm whitespace-nowrap">
                    Vr.
                    <br />
                    No.
                  </TableHead>
                  <TableHead className="h-8 border border-gray-300 text-center font-medium p-0 text-sm">
                    Received
                  </TableHead>
                  <TableHead
                    className="h-8 border border-gray-300 text-center font-medium p-0 text-sm"
                    colSpan={2}
                  >
                    <div className="text-center">Amount</div>
                    <div className="grid grid-cols-2 border-t border-gray-300">
                      <div className="text-center py-1">Cash</div>
                      <div className="text-center py-1 border-l border-gray-300">
                        Suspense
                      </div>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emptyRows.map((_, index) => (
                  <TableRow key={`received-${index}`} className="h-8">
                    <TableCell className="border border-gray-300 p-0"></TableCell>
                    <TableCell className="border border-gray-300 p-0"></TableCell>
                    <TableCell className="border border-gray-300 p-0"></TableCell>
                    <TableCell className="border border-gray-300 p-0"></TableCell>
                    <TableCell className="border border-gray-300 p-0"></TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="border border-gray-300 text-center font-medium p-1"
                  >
                    Total
                  </TableCell>
                  <TableCell className="border border-gray-300 text-right p-1">
                    -
                  </TableCell>
                  <TableCell className="border border-gray-300 text-right p-1">
                    -
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Right side - Payment and Denominations */}
          <div>
            <Table className="border-collapse">
              <TableHeader className='bg-slate-200 shadow-md'>
                <TableRow>
                  <TableHead className="h-8 border border-gray-300 text-center font-medium p-0 text-sm">
                    Date
                  </TableHead>
                  <TableHead className="h-8 border border-gray-300 text-center font-medium p-0 text-sm whitespace-nowrap">
                    Vr.
                    <br />
                    No.
                  </TableHead>
                  <TableHead className="h-8 border border-gray-300 text-center font-medium p-0 text-sm">
                    Payment
                  </TableHead>
                  <TableHead
                    className="h-8 border border-gray-300 text-center font-medium p-0 text-sm"
                    colSpan={2}
                  >
                    <div className="text-center">Amount</div>
                    <div className="grid grid-cols-2 border-t border-gray-300">
                      <div className="text-center py-1">Cash</div>
                      <div className="text-center py-1 border-l border-gray-300">
                        Suspense
                      </div>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array(10)
                  .fill(null)
                  .map((_, index) => (
                    <TableRow key={`payment-${index}`} className="h-8">
                      <TableCell className="border border-gray-300 p-0"></TableCell>
                      <TableCell className="border border-gray-300 p-0"></TableCell>
                      <TableCell className="border border-gray-300 p-0"></TableCell>
                      <TableCell className="border border-gray-300 p-0"></TableCell>
                      <TableCell className="border border-gray-300 p-0"></TableCell>
                    </TableRow>
                  ))}
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="border border-gray-300 text-center font-medium p-1"
                  >
                    Total
                  </TableCell>
                  <TableCell className="border border-gray-300 text-right p-1">
                    -
                  </TableCell>
                  <TableCell className="border border-gray-300 text-right p-1">
                    -
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            {/* Cash Denominations */}
            <div>
              <div className="px-2 py-1 border-t border-gray-300">
                Cash Denominations:
              </div>
              <Table className="border-collapse">
                <TableHeader>
                  <TableRow>
                    <TableHead className="h-8 border border-gray-300 text-center font-medium p-0 text-sm">
                      Note
                    </TableHead>
                    <TableHead className="h-8 border border-gray-300 text-center font-medium p-0 text-sm">
                      No.
                    </TableHead>
                    <TableHead className="h-8 border border-gray-300 text-center font-medium p-0 text-sm">
                      Amount (Tk.)
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[1000, 500, 100, 50, 20, 10, 5, 2, 1].map((note) => (
                    <TableRow key={`note-${note}`} className="h-8">
                      <TableCell className="border border-gray-300 text-center p-0">
                        {note}
                      </TableCell>
                      <TableCell className="border border-gray-300 p-0"></TableCell>
                      <TableCell className="border border-gray-300 text-right p-1">
                        0.00
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell className="border border-gray-300 font-medium p-1">
                      Coin
                    </TableCell>
                    <TableCell className="border border-gray-300 p-0"></TableCell>
                    <TableCell className="border border-gray-300 p-0"></TableCell>
                  </TableRow>
                  {[5, 2, 1].map((coin) => (
                    <TableRow key={`coin-${coin}`} className="h-8">
                      <TableCell className="border border-gray-300 text-center p-0">
                        {coin}
                      </TableCell>
                      <TableCell className="border border-gray-300 p-0"></TableCell>
                      <TableCell className="border border-gray-300 text-right p-1">
                        0.00
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="border border-gray-300 text-center font-medium p-1"
                    >
                      Cash in hand
                    </TableCell>
                    <TableCell className="border border-gray-300 text-right p-1">
                      -
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="grid grid-cols-2 border-t border-gray-300">
          <div className="p-2 border-r border-gray-300">
            <div className="flex items-center">
              <div className="font-medium mr-2">In word (Tk.)</div>
              <div className="flex-1"></div>
            </div>
          </div>
          <div className="p-2">
            <div className="flex justify-end">
              <div className="font-medium text-right p-1">Total</div>
              <div className="w-24 text-right p-1">-</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
