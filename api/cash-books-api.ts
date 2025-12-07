import { fetchApi } from "@/utils/http"
import { JournalQueryDateRange } from "@/utils/type"

// get api by date range
export async function getCashJournalByDate(data: JournalQueryDateRange, token: string) {
  const queryParams = new URLSearchParams({
    startDate: data.startDate,
    endDate: data.endDate,
    companyId: JSON.stringify(data.companyId), // Convert array to JSON string
    locationId: JSON.stringify(data.locationId), // Convert array to JSON string
  }).toString()

  return fetchApi({
      url: `api/journal/getCashJournal?${queryParams}`,
    method: 'GET',
    headers: {
      Authorization: `${token}`,
    },
  })
}
