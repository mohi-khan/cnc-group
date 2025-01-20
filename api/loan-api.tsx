import { fetchApi } from '@/utils/http'
import { IouRecordGetType } from '@/utils/type'

export async function getLoanData() {
  return fetchApi<IouRecordGetType[]>({
    url: 'api/iou/getIous',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
