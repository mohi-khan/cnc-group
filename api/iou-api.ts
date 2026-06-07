import { fetchApi } from '@/utils/http'
import {
  Employee,
  IouAdjustmentCreateType,
  IouRecordCreateType,
  IouRecordGetType,
} from '@/utils/type'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface IouBulkRowType {
  amount: number
  employeeId: number
  dueDate: Date
  notes?: string
}

export interface IouBulkCreateType {
  companyId: number
  locationId: number
  dateIssued: Date
  status: 'draft' | 'active' | 'inactive'
  createdBy: number
  rows: IouBulkRowType[]
}

// ─── Single IOU ───────────────────────────────────────────────────────────────

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

// ─── Bulk IOU (new) ───────────────────────────────────────────────────────────

export async function createIouBulk(data: IouBulkCreateType, token: string) {
  return fetchApi<{ inserted: { iouId: number }[] }>({
    url: 'api/iou/createIouBulk',
    method: 'POST',
    body: data,
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

// ─── Get all IOUs ─────────────────────────────────────────────────────────────

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

// ─── Get IOUs by date ─────────────────────────────────────────────────────────

export async function getLoanDataByDate(token: string, date: string) {
  return fetchApi<IouRecordGetType[]>({
    url: `api/iou/getIousByDate?date=${date}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${token}`,
    },
  })
}

// ─── Get Employee ─────────────────────────────────────────────────────────────

export async function getEmployee() {
  return fetchApi<Employee[]>({
    url: 'api/employee/getEmployees',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

// ─── Create Adjustment ────────────────────────────────────────────────────────

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

// ─── Post IOU ─────────────────────────────────────────────────────────────────

export async function postIouRecord(iouId: number, token: string) {
  return fetchApi<void>({
    url: `api/iou/${iouId}/post`,
    method: 'PATCH',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

// ─── Delete IOU ───────────────────────────────────────────────────────────────

export async function deleteIouRecord(iouId: number, token: string | null) {
  return fetchApi<void>({
    url: `api/iou/${iouId}`,
    method: 'DELETE',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}


// import { fetchApi } from '@/utils/http'
// import {
//   Employee,
//   IouAdjustmentCreateType,
//   IouRecordCreateType,
//   IouRecordGetType,
// } from '@/utils/type'

// //Create IOU Data Push in DB

// export async function createIou(data: IouRecordCreateType, token: string) {
//   return fetchApi<IouRecordCreateType[]>({
//     url: 'api/iou/createIou',
//     method: 'POST',
//     body: data,
//     headers: {
//       Authorization: `${token}`,
//       'Content-Type': 'application/json',
//     },
//   })
// }

// //Fetch All Loan Data
// export async function getLoanData(token: string) {
//   return fetchApi<IouRecordGetType[]>({
//     url: 'api/iou/getIous',
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `${token}`,
//     },
//   })
// }
// // get iou list by date
// export async function getLoanDataByDate(token: string, date: string) {
//   return fetchApi<IouRecordGetType[]>({
//     url: `api/iou/getIousByDate?date=${(date)}`,
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `${token}`,
//     },
//   })
// }


// //Fetch All Employee Data
// export async function getEmployee() {
//   return fetchApi<Employee[]>({
//     url: 'api/employee/getEmployees',
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   })
// }

// //Create IOU Data Push in DB
// export async function createAdjustment(data: IouAdjustmentCreateType, token: string) {
//   return fetchApi<IouAdjustmentCreateType[]>({
//     url: 'api/iou/createIouAdj',
//     method: 'POST',
//     body: data,
//     headers: {
//       Authorization: `${token}`,
//       'Content-Type': 'application/json',
//     },
//   })
// }


// // IOU post api
// export async function postIouRecord(iouId: number, token: string) {
//   return fetchApi<void>({
//     url: `api/iou/${iouId}/post`,
//     method: 'PATCH',
//     headers: {
//       Authorization: `${token}`,
//       'Content-Type': 'application/json',
//     },
//   })
// }

// // IOU delete api
// export async function deleteIouRecord(iouId: number, token: string | null) {
//   return fetchApi<void>({
//     url: `api/iou/${iouId}`,
//     method: 'DELETE',
//     headers: {
//       Authorization: `${token}`,
//       'Content-Type': 'application/json',
//     },
//   })
// }
