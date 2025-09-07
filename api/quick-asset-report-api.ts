// import { fetchApi } from "@/utils/http"
// import { QuickAssetType } from "@/utils/type"


// // Adjust the type according to your API response
// // Example: [{ from: string; to: string; balance: number }]
// export async function getQuickAsset({
//     companyId,
//     startDate,
//     endDate,
//     token,
// }: {
//     companyId: number
//     startDate: string
//     endDate: string
//     token: string
// }) {
//     return fetchApi<QuickAssetType[]>({
//         url: `api/fundPosition/getQuickAsset?companyId=${companyId}&startDate=${startDate}&endDate=${endDate}`,
//         method: "GET",
//         headers: {
//             Authorization: `${token}`,
//             "Content-Type": "application/json",
//         },
//     })
// }


import { fetchApi } from "@/utils/http"
import { QuickAssetType } from "@/utils/type"

export async function getQuickAsset({
    startDate,
    endDate,
    token,
}: {
  
    startDate: string
    endDate: string
    token: string
}) {
  

    return fetchApi<QuickAssetType[]>({
        url: `api/fundPosition/getQuickAsset?startDate=${startDate}&endDate=${endDate}`,
        method: "GET",
        headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
        },
    })
}
