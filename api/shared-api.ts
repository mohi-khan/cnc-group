import { fetchApi } from "@/utils/http";


export async function getSettings(token: string,settingName:string) {
  return fetchApi<number>({
    url: `api/settings/get/${settingName}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${token}`,
    },
  })
}