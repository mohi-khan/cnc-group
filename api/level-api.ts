import { fetchApi } from '@/utils/http'
import {  CoaPlMappingReport, LevelType } from '@/utils/type'

export async function createLevel(data: LevelType[], token: string) {
  
  
  return fetchApi<LevelType[]>({
    url: 'api/coa-pl-map/create-coa-pl-map',
    method: 'POST',
    body: data,
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

export async function getAllLevel(token: string) {
  return fetchApi<LevelType[]>({
    url: 'api/coa-pl-map/get-all-coa-pl-map',
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

export async function editLevel(data: LevelType[], token: string) {
  
  
  return fetchApi<LevelType[]>({
    url: 'api/coa-pl-map/edit-coa-pl-map',
    method: 'PATCH',
    body: data,
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}


//api/coa-pl-map/getCoaWithMapping report
// export async function getCoaWithMapping(token: string) {
//   return fetchApi<CoaPlMappingReport[]>({
//     url: 'api/coa-pl-map/getCoaWithMapping',
//     method: 'GET',
//     headers: {
//       Authorization: `${token}`,
//       'Content-Type': 'application/json',
//     },
//   })
// }
export async function getCoaWithMapping(token: string, date: string) {
  return fetchApi<CoaPlMappingReport[]>({
    url: `api/coa-pl-map/getCoaWithMapping?date=${encodeURIComponent(date)}`,
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}
