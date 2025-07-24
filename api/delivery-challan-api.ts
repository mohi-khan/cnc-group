import { fetchApi } from "@/utils/http";
import { GetDeliveryChallan } from "@/utils/type";

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

export async function updateDeliveryChallan(token: string, id: number, exchangeRate: number) {
  return fetchApi({
    url: `api/delivery/update/${id}?exchangeRate=${exchangeRate}`,
    method: 'PATCH',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  });
}
