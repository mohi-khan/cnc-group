import { fetchApi } from "@/utils/http";
import {  settings } from "@/utils/type";

export async function getSettings(token: string,settingName:string) {
  return fetchApi<string>({
    url: `api/settings/get/${settingName}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${token}`,
    },
  })
}