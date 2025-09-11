import type { QuickAssetType } from '@/utils/type'
import type { CompanyType } from '@/api/company-api'

interface QuickAssetReportTableProps {
  data: QuickAssetType[]
  companies: CompanyType[]
  selectedCompanyIds?: string[]
}

const QuickAssetReportTable = ({
  data,
  companies,
  selectedCompanyIds = [],
}: QuickAssetReportTableProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <p className="text-gray-500">No data available</p>
      </div>
    )
  }

  // Only take 'to' dates and remove duplicates
  const dates = Array.from(
    new Set(data.map((item) => item.to).filter(Boolean))
  ).sort()

  const companyMap: Record<number, string> = {}
  companies.forEach((c) => {
    if (c.companyId != null) companyMap[c.companyId] = c.companyName
  })

  const allCompanyIds = Array.from(new Set(data.map((item) => item.company)))
  const companyIds =
    selectedCompanyIds.length > 0
      ? allCompanyIds.filter((id) => selectedCompanyIds.includes(id.toString()))
      : allCompanyIds

  const filteredData =
    selectedCompanyIds.length > 0
      ? data.filter((item) =>
          selectedCompanyIds.includes(item.company.toString())
        )
      : data

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                Company
              </th>
              {dates.map((date) => (
                <th
                  key={`header-${date}`}
                  className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px] whitespace-nowrap"
                >
                  {new Date(date).toLocaleDateString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                  })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {companyIds.map((companyId) => {
              const companyName =
                companyMap[companyId] || `Company ${companyId}`
              return (
                <tr key={`row-${companyId}`} className="bg-white">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-inherit z-10 border-r">
                    {companyName}
                  </td>
                  {dates.map((date) => {
                    const item = filteredData.find(
                      (d) => d.company === companyId && d.to === date
                    )
                    const value = item ? item.balance : null
                    return (
                      <td
                        key={`cell-${companyId}-${date}`}
                        className="px-4 py-3 text-sm text-gray-900 text-right"
                      >
                        {value !== null ? Number(value).toLocaleString() : '-'}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
            <tr className="bg-blue-50 border-t-2 border-blue-200 font-semibold">
              <td className="px-4 py-3 text-sm font-bold text-gray-900 sticky left-0 bg-blue-50 z-10 border-r">
                TOTAL
              </td>
              {dates.map((date) => {
                const total = filteredData.reduce((sum, item) => {
                  if (item.to === date) {
                    return sum + Number(item.balance)
                  }
                  return sum
                }, 0)
                return (
                  <td
                    key={`total-${date}`}
                    className="px-4 py-3 text-sm font-bold text-gray-900 text-right"
                  >
                    {total !== 0 ? total.toLocaleString() : '-'}
                  </td>
                )
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default QuickAssetReportTable
