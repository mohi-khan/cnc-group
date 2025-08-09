import { fetchApi } from "@/utils/http";
import { GetFdrReport } from "@/utils/type";



// Get All FDR Records
export async function getFdrReport(token: string) {
  return fetchApi<GetFdrReport[]>({
    url: 'api/FDR/getfdr',
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}