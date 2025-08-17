import { fetchApi } from "@/utils/http"
import { JournalQuery, JournalQueryDateRange } from "@/utils/type"

export async function getAllVoucher(data: JournalQuery, token: string) {
  const queryParams = new URLSearchParams({
    date: data.date,
    companyId: JSON.stringify(data.companyId), // Convert array to JSON string
    locationId: JSON.stringify(data.locationId), // Convert array to JSON string
  }).toString()

  return fetchApi({
    url: `api/journal/getJournalLists/?${queryParams}`,
    method: 'GET',
    headers: {
      Authorization: `${token}`,
    },
  })
}


// get api by date range
export async function getAllVoucherByDate(data: JournalQueryDateRange, token: string) {
  const queryParams = new URLSearchParams({
    startDate: data.startDate,
    endDate: data.endDate,
    companyId: JSON.stringify(data.companyId), // Convert array to JSON string
    locationId: JSON.stringify(data.locationId), // Convert array to JSON string
  }).toString()

  return fetchApi({
    url: `api/journal/getJournalListsDateRange/?${queryParams}`,
    method: 'GET',
    headers: {
      Authorization: `${token}`,
    },
  })
}


