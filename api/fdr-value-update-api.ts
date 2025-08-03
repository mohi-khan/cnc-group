import { fetchApi } from "@/utils/http";
import { NewFdrValueUpdate } from "@/utils/type";

// Create FDR Record
export async function createFdrUpdate(data: NewFdrValueUpdate, token: string) {
  return fetchApi<NewFdrValueUpdate[]>({
    url: 'api/fdr-value-update/createfdrvalue',
    method: 'POST',
    body: data,
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}