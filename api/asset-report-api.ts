import { fetchApi } from "@/utils/http"
import { AssetDepreciationReportType } from "@/utils/type"

export async function getAssetReport(
  companyId: number,
  startDate: string,
  endDate: string,
  token: string
) {
  return fetchApi<AssetDepreciationReportType>({
    url: `api/depreciation-schedules/getDepReport?startDate=${startDate}&endDate=${endDate}&companyId=${companyId}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
  })
}