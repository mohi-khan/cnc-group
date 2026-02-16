import { formatIndianNumber } from '@/utils/Formatindiannumber'
import { UtilityBillSummary } from '@/utils/type'

interface UtilityReportListProps {
  bills: UtilityBillSummary[]
}

export default function UtilityReportList({ bills }: UtilityReportListProps) {
  if (bills.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">No available data</div>
    )
  }

  // Group bills by year
  const billsByYear = bills.reduce(
    (acc, bill) => {
      if (!acc[bill.year]) {
        acc[bill.year] = {}
      }
      acc[bill.year][bill.monthNo] = bill
      return acc
    },
    {} as Record<number, Record<number, UtilityBillSummary>>
  )

  // Get all years and sort them in descending order
  const years = Object.keys(billsByYear)
    .map(Number)
    .sort((a, b) => b - a)

  // Fix: Get unique months properly and sort January to December
  const getUniqueMonths = () => {
    const monthsMap = new Map<number, string>()

    bills.forEach((bill) => {
      monthsMap.set(bill.monthNo, bill.month.substring(0, 3))
    })

    // Convert to array and sort from January (1) to December (12)
    const monthsArray = Array.from(monthsMap.entries()).map(([num, name]) => ({
      num,
      name,
    }))

    return monthsArray.sort((a, b) => a.num - b.num)
  }

  const months = getUniqueMonths()

  // Calculate percentage change and average for each year
  const calculateYearData = (year: number) => {
    const yearBills = billsByYear[year] || {}
    const totalAmount = Object.values(yearBills).reduce(
      (sum, bill) => sum + bill.totalAmount,
      0
    )
    const billCount = Object.keys(yearBills).length
    const average = billCount > 0 ? totalAmount / billCount : 0

    // Calculate percentage change from previous year
    const previousYear = year - 1
    const previousYearBills = billsByYear[previousYear] || {}
    const previousTotal = Object.values(previousYearBills).reduce(
      (sum, bill) => sum + bill.totalAmount,
      0
    )
    const percentage =
      previousTotal > 0
        ? ((totalAmount - previousTotal) / previousTotal) * 100
        : 0

    return { totalAmount, average, percentage }
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300 text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-3 border-b text-left font-medium">Period</th>
            <th className="py-2 px-3 border-b text-center font-medium">
              Percentage
            </th>
            <th className="py-2 px-3 border-b text-center font-medium">
              Average
            </th>
            {months.map((month) => (
              <th
                key={month.num}
                className="py-2 px-3 border-b text-center font-medium"
              >
                {month.name}
              </th>
            ))}
            <th className="py-2 px-3 border-b text-center font-medium">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {years.map((year, index) => {
            const yearData = calculateYearData(year)
            const nextYear = year + 1
            const fiscalYear = `${year}-${nextYear.toString().slice(-2)}`

            return (
              <tr key={year} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                <td className="py-2 px-3 border-b font-medium">{fiscalYear}</td>
                <td className="py-2 px-3 border-b text-center">
                  <span
                    className={
                      yearData.percentage >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }
                  >
                    {yearData.percentage.toFixed(2)}%
                  </span>
                </td>
                <td className="py-2 px-3 border-b text-center">
                  {/* {Math.round(yearData.average).toLocaleString()} */}
                  {formatIndianNumber(Math.round(yearData.average))}
                </td>
                {months.map((month) => {
                  const bill = billsByYear[year]?.[month.num]
                  return (
                    <td
                      key={month.num}
                      className="py-2 px-3 border-b text-center"
                    >
                      {bill ? (
                        <span
                          className={
                            Number(bill.unpaidAmount) > 0 ? 'text-red-600' : ''
                          }
                        >
                          {formatIndianNumber(Number(bill.totalAmount))}
                          {Number(bill.unpaidAmount) > 0 && (
                            <sup className="text-red-500">*</sup>
                          )}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                  )
                })}
                <td className="py-2 px-3 border-b text-center font-medium">
                  {formatIndianNumber(yearData.totalAmount).toLocaleString()}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Legend for unpaid amounts */}
      <div className="mt-2 text-xs text-gray-600">
        <span className="text-red-500">*</span> Indicates unpaid amount
      </div>
    </div>
  )
}
