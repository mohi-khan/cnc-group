import { fetchApi } from '@/utils/http'
import { ApproveAdvanceType } from '@/utils/type'

export async function getAllAdvance(token: string) {
  return fetchApi<ApproveAdvanceType[]>({
    url: 'api/advance/getAdvance?approvalStatus=PENDING',
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

export async function approveAdvance(
  data: {
    invoiceId: string
    approvalStatus: string
    approvedBy: string
  },
  token: string
) {
  return fetchApi({
    url: 'api/advance/updateApproval',
    method: 'POST',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
    body: data,
  })
}
