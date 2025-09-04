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
    companyIds, // now accepts array of numbers
    startDate,
    endDate,
    token,
}: {
    companyIds: number[] // array of company IDs
    startDate: string
    endDate: string
    token: string
}) {
    // Convert array to comma-separated string for query param
    const companyIdParam = companyIds.join(",")

    return fetchApi<QuickAssetType[]>({
        url: `api/fundPosition/getQuickAsset?companyId=${companyIdParam}&startDate=${startDate}&endDate=${endDate}`,
        method: "GET",
        headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
        },
    })
}
