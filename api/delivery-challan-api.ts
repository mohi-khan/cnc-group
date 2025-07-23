import { fetchApi } from "@/utils/http";
import { CurrencyType, GetDeliveryChallan } from "@/utils/type";

export async function getDeliveryChallan(token:string) {
  return fetchApi<GetDeliveryChallan[]>({
    url: 'api/delivery/get',
    method: 'GET',
    headers: {
          Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}
