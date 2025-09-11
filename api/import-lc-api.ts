import { fetchApi } from "@/utils/http";
import { LcInfoByCostIsActive } from "@/utils/type";

export async function getLcInfoByCostIsActive(token: string) {
    return fetchApi<LcInfoByCostIsActive[]>({
        url: 'api/import-lc-info/getLcNoBy-costIsActive',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `${token}`,
        },
    })
}