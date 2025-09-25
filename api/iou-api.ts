import { fetchApi } from '@/utils/http'
import {
  Employee,
  IouAdjustmentCreateType,
  IouRecordCreateType,
  IouRecordGetType,
} from '@/utils/type'

//Create IOU Data Push in DB

export async function createIou(data: IouRecordCreateType, token: string) {
  return fetchApi<IouRecordCreateType[]>({
    url: 'api/iou/createIou',
    method: 'POST',
    body: data,
    headers: {
      Authorization: `${token}`,
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
// get iou list by date
export async function getLoanDataByDate(token: string, date: string) {
  return fetchApi<IouRecordGetType[]>({
    url: `api/iou/getIousByDate?date=${(date)}`,
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
export async function createAdjustment(data: IouAdjustmentCreateType, token: string) {
  return fetchApi<IouAdjustmentCreateType[]>({
    url: 'api/iou/createIouAdj',
    method: 'POST',
    body: data,
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}


