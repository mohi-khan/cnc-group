import { fetchApi } from "@/utils/http";
import { GetCashFlowDFPType } from "@/utils/type";

// Fetch all Cash Flow DFP
export async function getCashFlowDFP(token: string) {
    return fetchApi<GetCashFlowDFPType[]>({
        url: 'api/fundPosition/getCashFlow',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `${token}`,
        },
    })
}