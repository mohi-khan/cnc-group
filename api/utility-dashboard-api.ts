import { MonthlyTotal } from "@/components/utility/dashboard/utility-dashboard";
import { fetchApi } from "@/utils/http";

export async function getChartDetails(type:string,token:string,location?:string) {
  const params = new URLSearchParams();
  params.append('utilityType', type);
  if (location) {
    params.append('location', location);
  }
  return fetchApi<MonthlyTotal[]>({
    // url: `api/dashboard/getcostBreakdownDetails?departmentId=${departmentId}&fromDate=${fromDate}&toDate=${toDate}&companyId=${companyId}&financial_Tag=${financial_Tag}`,
     url: `api/utilities/getDashboardData?${params.toString()}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
    
  })
}