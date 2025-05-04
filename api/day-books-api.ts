import { fetchApi } from "@/utils/http"
import { JournalQuery } from "@/utils/type"

export async function getAllVoucher(data: JournalQuery, token: string) {
  const queryParams = new URLSearchParams({
    date: data.date,
    companyId: JSON.stringify(data.companyId), // Convert array to JSON string
    locationId: JSON.stringify(data.locationId), // Convert array to JSON string
  }).toString()
  console.log(queryParams)
  return fetchApi({
    url: `api/journal/getJournalLists/?${queryParams}`,
    method: 'GET',
    headers: {
      Authorization: `${token}`,
    },
  })
}