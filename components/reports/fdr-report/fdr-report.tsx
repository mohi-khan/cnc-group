import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface FDRRecord {
  sl: number
  fdrDate: string
  fdrNo: string
  accountNo: string
  bankBranch: string
  actualFaceValue: number
  presentFaceValue: number
  periodDate: string
  interest: string
}

const nationalAccessoriesData: FDRRecord[] = [
  {
    sl: 1,
    fdrDate: '10/Apr/11',
    fdrNo: '711396842/11',
    accountNo: '2450001035353',
    bankBranch: 'SEBL, Halishahar Br.',
    actualFaceValue: 1500000,
    presentFaceValue: 7768103,
    periodDate: '10/Apr/25',
    interest: '9.75%',
  },
  {
    sl: 20,
    fdrDate: '04/May/11',
    fdrNo: '151104',
    accountNo: '16.313.14020',
    bankBranch: 'Dhaka Bank, Agrabad Br.',
    actualFaceValue: 1000000,
    presentFaceValue: 4241425,
    periodDate: '5/Apr/25',
    interest: '9.50%',
  },
  {
    sl: 57,
    fdrDate: '30/Aug/04',
    fdrNo: '012395',
    accountNo: '2450001532406',
    bankBranch: 'SEBL, Jubilee Rd. Br.',
    actualFaceValue: 128200,
    presentFaceValue: 506533,
    periodDate: '17/Apr/25',
    interest: '9.75%',
  },
  {
    sl: 58,
    fdrDate: '17/Feb/05',
    fdrNo: '12394',
    accountNo: '2450001531906',
    bankBranch: 'SEBL, Jubilee Rd. Br.',
    actualFaceValue: 100000,
    presentFaceValue: 371709,
    periodDate: '17/Apr/25',
    interest: '9.75%',
  },
  {
    sl: 64,
    fdrDate: '13/Aug/06',
    fdrNo: '706291311/15/06',
    accountNo: '2450031934',
    bankBranch: 'SEBL, Agrabad Br.',
    actualFaceValue: 380177,
    presentFaceValue: 1431026,
    periodDate: '13/08/24',
    interest: '9.50%',
  },
  {
    sl: 75,
    fdrDate: '06/Feb/10',
    fdrNo: '716060141/6/10',
    accountNo: '2450032118',
    bankBranch: 'SEBL, Agrabad Br.',
    actualFaceValue: 165564,
    presentFaceValue: 430384,
    periodDate: '2/Mar/25',
    interest: '9.75%',
  },
  {
    sl: 77,
    fdrDate: '04/Mar/14',
    fdrNo: '731195649/1/14',
    accountNo: '2430033210',
    bankBranch: 'SEBL, Agrabad Br.',
    actualFaceValue: 135000,
    presentFaceValue: 236632,
    periodDate: '3/Apr/25',
    interest: '9.75%',
  },
  {
    sl: 80,
    fdrDate: '18/Jan/17',
    fdrNo: '21216',
    accountNo: '0105.7030000831',
    bankBranch: 'NRB Com, Agrabad Br.',
    actualFaceValue: 541556,
    presentFaceValue: 839988,
    periodDate: '18/Apr/25',
    interest: '9.75%',
  },
  {
    sl: 81,
    fdrDate: '18/Jan/17',
    fdrNo: '276344',
    accountNo: '330073308',
    bankBranch: 'MTBL, Agrabad Br.',
    actualFaceValue: 335049,
    presentFaceValue: 574640,
    periodDate: '18/Jan/25',
    interest: '6.50%',
  },
  {
    sl: 83,
    fdrDate: '21/Jan/18',
    fdrNo: '748533/45/1/18',
    accountNo: '2430033599',
    bankBranch: 'SEBL, Agrabad Br.',
    actualFaceValue: 421754,
    presentFaceValue: 596064,
    periodDate: '21/Apr/25',
    interest: '9.75%',
  },
]

const columbiaEnterpriseData: FDRRecord[] = [
  {
    sl: 7,
    fdrDate: '19/Mar/13',
    fdrNo: '1204158/346/13',
    accountNo: '2450033182',
    bankBranch: 'SEBL, Agrabad Br.',
    actualFaceValue: 2000000,
    presentFaceValue: 4174767,
    periodDate: '19/Mar/25',
    interest: '9.75%',
  },
  {
    sl: 9,
    fdrDate: '26/Dec/13',
    fdrNo: '0007177',
    accountNo: '0105.7030000663',
    bankBranch: 'NRB Commercial Bank, Agrabad Br.',
    actualFaceValue: 1500000,
    presentFaceValue: 2928199,
    periodDate: '26/Mar/25',
    interest: '9.75%',
  },
  {
    sl: 12,
    fdrDate: '04/Nov/19',
    fdrNo: '342742',
    accountNo: '033009142',
    bankBranch: 'MTBL, Agrabad Br.',
    actualFaceValue: 595833,
    presentFaceValue: 1203575,
    periodDate: '4/May/25',
    interest: '7.00%',
  },
  {
    sl: 22,
    fdrDate: '05/Apr/22',
    fdrNo: '761395/262/2022',
    accountNo: '2430033742',
    bankBranch: 'SEBL, Agrabad Br.',
    actualFaceValue: 10000000,
    presentFaceValue: 11868723,
    periodDate: '5/Apr/25',
    interest: '9.75%',
  },
  {
    sl: 31,
    fdrDate: '28/Apr/22',
    fdrNo: '',
    accountNo: '1306010120038',
    bankBranch: 'MTBL, Agrabad Br.',
    actualFaceValue: 10000000,
    presentFaceValue: 11366553,
    periodDate: '28/Apr/25',
    interest: '7.50%',
  },
  {
    sl: 32,
    fdrDate: '28/Apr/22',
    fdrNo: '',
    accountNo: '1306010120047',
    bankBranch: 'MTBL, Agrabad Br.',
    actualFaceValue: 10000000,
    presentFaceValue: 11365553,
    periodDate: '28/Apr/25',
    interest: '7.50%',
  },
]

const FdrReport = () => {
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString()
  }

  const nationalTotal = nationalAccessoriesData.reduce(
    (sum, record) => sum + record.actualFaceValue,
    0
  )
  const nationalPresentTotal = nationalAccessoriesData.reduce(
    (sum, record) => sum + record.presentFaceValue,
    0
  )

  const columbiaTotal = columbiaEnterpriseData.reduce(
    (sum, record) => sum + record.actualFaceValue,
    0
  )
  const columbiaPresentTotal = columbiaEnterpriseData.reduce(
    (sum, record) => sum + record.presentFaceValue,
    0
  )

  const grandTotalActual = nationalTotal + columbiaTotal
  const grandTotalPresent = nationalPresentTotal + columbiaPresentTotal

  return (
    <div className="w-full p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            CNC GROUP - FDR Statement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* National Accessories Ltd. Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 bg-gray-100 p-2 rounded">
                National Accessories Ltd.
              </h3>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Sl #</TableHead>
                      <TableHead>FDR Date</TableHead>
                      <TableHead>FDR No.</TableHead>
                      <TableHead>Account No.</TableHead>
                      <TableHead>Bank & Branch</TableHead>
                      <TableHead className="text-right">
                        Actual Face Value
                      </TableHead>
                      <TableHead className="text-right">
                        Present Face Value Amount
                      </TableHead>
                      <TableHead>Period Date</TableHead>
                      <TableHead>Interest @</TableHead>
                    </TableRow>
                    <TableRow className="bg-gray-50 font-semibold">
                      <TableCell colSpan={5} className="font-semibold">
                        National Accessories Ltd. Total:
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(nationalTotal)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(nationalPresentTotal)}
                      </TableCell>
                      <TableCell colSpan={2}></TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {nationalAccessoriesData.map((record) => (
                      <TableRow key={record.sl}>
                        <TableCell className="font-medium">
                          {record.sl}
                        </TableCell>
                        <TableCell>{record.fdrDate}</TableCell>
                        <TableCell>{record.fdrNo}</TableCell>
                        <TableCell>{record.accountNo}</TableCell>
                        <TableCell>{record.bankBranch}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(record.actualFaceValue)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(record.presentFaceValue)}
                        </TableCell>
                        <TableCell>{record.periodDate}</TableCell>
                        <TableCell>{record.interest}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Columbia Enterprise Ltd. Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 bg-gray-100 p-2 rounded">
                Columbia Enterprise Ltd.
              </h3>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Sl #</TableHead>
                      <TableHead>FDR Date</TableHead>
                      <TableHead>FDR No.</TableHead>
                      <TableHead>Account No.</TableHead>
                      <TableHead>Bank & Branch</TableHead>
                      <TableHead className="text-right">
                        Actual Face Value
                      </TableHead>
                      <TableHead className="text-right">
                        Present Face Value Amount
                      </TableHead>
                      <TableHead>Period Date</TableHead>
                      <TableHead>Interest @</TableHead>
                    </TableRow>
                    <TableRow className="bg-gray-50 font-semibold">
                      <TableCell colSpan={5} className="font-semibold">
                        Columbia Enterprise Ltd. Total:
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(columbiaTotal)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(columbiaPresentTotal)}
                      </TableCell>
                      <TableCell colSpan={2}></TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {columbiaEnterpriseData.map((record) => (
                      <TableRow key={record.sl}>
                        <TableCell className="font-medium">
                          {record.sl}
                        </TableCell>
                        <TableCell>{record.fdrDate}</TableCell>
                        <TableCell>{record.fdrNo}</TableCell>
                        <TableCell>{record.accountNo}</TableCell>
                        <TableCell>{record.bankBranch}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(record.actualFaceValue)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(record.presentFaceValue)}
                        </TableCell>
                        <TableCell>{record.periodDate}</TableCell>
                        <TableCell>{record.interest}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Grand Total Section */}
            <div className="mt-8">
              <div className="overflow-x-auto">
                <Table>
                  <TableBody>
                    <TableRow className="bg-yellow-200 hover:bg-yellow-200 font-bold">
                      <TableCell className="font-bold">Grand Total</TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(grandTotalActual)}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(grandTotalPresent)}
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default FdrReport
