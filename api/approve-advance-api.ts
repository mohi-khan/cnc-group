import { fetchApi } from "@/utils/http";
import { ApproveAdvanceType } from "@/utils/type";

export async function getAllAdvance(
  token: string
) {
  return fetchApi<ApproveAdvanceType[]>({
    url: 'api/advance/getAdvance?approvalStatus=PENDING',
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}