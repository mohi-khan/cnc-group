import { fetchApi } from '@/utils/http'
import {
  Employee,
  IouAdjustmentCreateType,
  IouRecordCreateType,
  IouRecordGetType,
} from '@/utils/type'

//Create IOU Data Push in DB

export async function createIou(data: IouRecordCreateType) {
  return fetchApi<IouRecordCreateType[]>({
    url: 'api/iou/createIou',
    method: 'POST',
    body: data,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

//Fetch All Loan Data
export async function getLoanData(token: string) {
  return fetchApi<IouRecordGetType[]>({
    url: 'api/iou/getIous',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${token}`,
    },
  })
}

//Fetch All Employee Data
export async function getEmployee() {
  return fetchApi<Employee[]>({
    url: 'api/employee/getEmployees',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

//Create IOU Data Push in DB
export async function createAdjustment(data: IouAdjustmentCreateType) {
  return fetchApi<IouAdjustmentCreateType[]>({
    url: 'api/iou/createIouAdj',
    method: 'POST',
    body: data,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
