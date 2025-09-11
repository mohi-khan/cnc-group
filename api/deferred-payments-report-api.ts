import { fetchApi } from "@/utils/http";
import { DeferredPayment, DeferredPaymentsReport } from "@/utils/type";


export async function getDeferredPayments(data: { token: string }) {
    return fetchApi<DeferredPayment[]>({
        url: `api/fundPosition/deferredPayments`,
        method: 'GET',
        headers: {
            Authorization: `${data.token}`,
        },
    });
}
