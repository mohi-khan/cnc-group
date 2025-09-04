


// 'use client'
// import { getQuickAsset } from '@/api/quick-asset-report-api'
// import { toast } from '@/hooks/use-toast'
// import type { QuickAssetType } from '@/utils/type'
// import { tokenAtom, useInitializeUser } from '@/utils/user'
// import { useAtom } from 'jotai'
// import React, { useCallback, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import QuickAssetReportHeading from './quick-asset-report-heading'
// import QuickAssetReportTable from './quick-asset-report-table'
// import { getAllCompanies } from '@/api/common-shared-api'
// import type { CompanyType } from '@/api/company-api'

// const QuickAssetReport = () => {
//   useInitializeUser()
//   const [token] = useAtom(tokenAtom)
//   const router = useRouter()

//   const [quickAsset, setQuickAsset] = React.useState<QuickAssetType[]>([])
//   const [startDate, setStartDate] = React.useState(
//     new Date().toISOString().split('T')[0]
//   )
//   const [endDate, setEndDate] = React.useState(
//     new Date().toISOString().split('T')[0]
//   )
//   const [companyId, setCompanyId] = React.useState<string>('')
//   const [companies, setCompanies] = React.useState<CompanyType[]>([])

//   const fetchCompanies = useCallback(async () => {
//     if (!token) return

//     try {
//       const fetchedCompanies = await getAllCompanies(token)
//       if (fetchedCompanies?.error?.status === 401) {
//         router.push('/unauthorized-access')
//         return
//       } else if (fetchedCompanies.error || !fetchedCompanies.data) {
//         console.error('Error getting companies:', fetchedCompanies.error)
//         toast({
//           title: 'Error',
//           description:
//             fetchedCompanies.error?.message || 'Failed to get companies',
//           variant: 'destructive',
//         })
//       } else {
//         setCompanies(fetchedCompanies.data)
//       }
//     } catch (error) {
//       console.error('Error fetching companies:', error)
//       toast({
//         title: 'Error',
//         description: 'Failed to fetch companies',
//         variant: 'destructive',
//       })
//     }
//   }, [token, router])

//   const fetchQuickAsset = useCallback(async () => {
//     if (!token) return

//     const response = await getQuickAsset({
//       companyIds: companyId ? [Number.parseInt(companyId)] : [3, 4, 11],
//       startDate: startDate,
//       endDate: endDate,
//       token
//     })

//     if (!response?.data) {
//       toast({
//         title: 'Error',
//         description: 'Failed to load quick asset',
//       })
//       setQuickAsset([])
//       return
//     }

//     const data = Array.isArray(response.data) ? response.data : [response.data]

//     setQuickAsset(data)
//     console.log(data)
//   }, [companyId, startDate, endDate, token])

//   useEffect(() => {
//     fetchQuickAsset()
//   }, [fetchQuickAsset])

//   useEffect(() => {
//     fetchCompanies()
//   }, [fetchCompanies])

//   return (
//     <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
//       <QuickAssetReportHeading
//         startDate={startDate}
//         endDate={endDate}
//         companyId={companyId}
//         companies={companies}
//         onStartDateChange={setStartDate}
//         onEndDateChange={setEndDate}
//         onCompanyIdChange={setCompanyId}
//         onRefresh={fetchQuickAsset}
//       />

//       {/* ✅ Pass companies into the table as well */}
//       <QuickAssetReportTable data={quickAsset} companies={companies} />
//     </div>
//   )
// }

// export default QuickAssetReport


// 'use client'
// import { getQuickAsset } from '@/api/quick-asset-report-api'
// import { toast } from '@/hooks/use-toast'
// import type { QuickAssetType } from '@/utils/type'
// import { tokenAtom, useInitializeUser } from '@/utils/user'
// import { useAtom } from 'jotai'
// import React, { useCallback, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import QuickAssetReportHeading from './quick-asset-report-heading'
// import QuickAssetReportTable from './quick-asset-report-table'
// import { getAllCompanies } from '@/api/common-shared-api'
// import type { CompanyType } from '@/api/company-api'

// const QuickAssetReport = () => {
//   useInitializeUser()
//   const [token] = useAtom(tokenAtom)
//   const router = useRouter()

//   const [quickAsset, setQuickAsset] = React.useState<QuickAssetType[]>([])
//   const [startDate, setStartDate] = React.useState(
//     new Date().toISOString().split('T')[0]
//   )
//   const [endDate, setEndDate] = React.useState(
//     new Date().toISOString().split('T')[0]
//   )
//   const [companyIds, setCompanyIds] = React.useState<number[]>([]) // multiple selected
//   const [companies, setCompanies] = React.useState<CompanyType[]>([])

//   const fetchCompanies = useCallback(async () => {
//     if (!token) return

//     try {
//       const fetchedCompanies = await getAllCompanies(token)
//       if (fetchedCompanies?.error?.status === 401) {
//         router.push('/unauthorized-access')
//         return
//       } else if (fetchedCompanies.error || !fetchedCompanies.data) {
//         console.error('Error getting companies:', fetchedCompanies.error)
//         toast({
//           title: 'Error',
//           description:
//             fetchedCompanies.error?.message || 'Failed to get companies',
//           variant: 'destructive',
//         })
//       } else {
//         setCompanies(fetchedCompanies.data)
//       }
//     } catch (error) {
//       console.error('Error fetching companies:', error)
//       toast({
//         title: 'Error',
//         description: 'Failed to fetch companies',
//         variant: 'destructive',
//       })
//     }
//   }, [token, router])

//   const fetchQuickAsset = useCallback(async () => {
//     if (!token || companyIds.length === 0) return

//     const response = await getQuickAsset({
//       companyIds: companyIds,
//       startDate,
//       endDate,
//       token,
//     })

//     if (!response?.data) {
//       toast({
//         title: 'Error',
//         description: 'Failed to load quick asset',
//       })
//       setQuickAsset([])
//       return
//     }

//     const data = Array.isArray(response.data) ? response.data : [response.data]
//     setQuickAsset(data)
//     console.log(data)
//   }, [companyIds, startDate, endDate, token])

//   useEffect(() => {
//     fetchCompanies()
//   }, [fetchCompanies])

//   useEffect(() => {
//     fetchQuickAsset()
//   }, [fetchQuickAsset])

//   return (
//     <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
//       <QuickAssetReportHeading
//         startDate={startDate}
//         endDate={endDate}
//         companyIds={companyIds}
//         companies={companies}
//         onStartDateChange={setStartDate}
//         onEndDateChange={setEndDate}
//         onCompanyIdsChange={setCompanyIds}
//         onRefresh={fetchQuickAsset}
//       />

//       <QuickAssetReportTable data={quickAsset} companies={companies} />
//     </div>
//   )
// }

// export default QuickAssetReport


// 'use client'
// import { getQuickAsset } from '@/api/quick-asset-report-api'
// import { toast } from '@/hooks/use-toast'
// import type { QuickAssetType } from '@/utils/type'
// import { tokenAtom, useInitializeUser } from '@/utils/user'
// import { useAtom } from 'jotai'
// import React, { useCallback, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import QuickAssetReportHeading from './quick-asset-report-heading'
// import QuickAssetReportTable from './quick-asset-report-table'
// import { getAllCompanies } from '@/api/common-shared-api'
// import type { CompanyType } from '@/api/company-api'

// const QuickAssetReport = () => {
//   useInitializeUser()
//   const [token] = useAtom(tokenAtom)
//   const router = useRouter()

//   const [quickAsset, setQuickAsset] = React.useState<QuickAssetType[]>([])
//   const [startDate, setStartDate] = React.useState(
//     new Date().toISOString().split('T')[0]
//   )
//   const [endDate, setEndDate] = React.useState(
//     new Date().toISOString().split('T')[0]
//   )
//   const [selectedCompanyIds, setSelectedCompanyIds] = React.useState<string[]>(
//     []
//   )
//   const [companies, setCompanies] = React.useState<CompanyType[]>([])

//   const fetchCompanies = useCallback(async () => {
//     if (!token) return

//     try {
//       const fetchedCompanies = await getAllCompanies(token)
//       if (fetchedCompanies?.error?.status === 401) {
//         router.push('/unauthorized-access')
//         return
//       } else if (fetchedCompanies.error || !fetchedCompanies.data) {
//         toast({
//           title: 'Error',
//           description:
//             fetchedCompanies.error?.message || 'Failed to get companies',
//           variant: 'destructive',
//         })
//       } else {
//         setCompanies(fetchedCompanies.data)
//       }
//     } catch (error) {
//       toast({
//         title: 'Error',
//         description: 'Failed to fetch companies',
//         variant: 'destructive',
//       })
//     }
//   }, [token, router])

//   const fetchQuickAsset = useCallback(async () => {
//     if (!token) return

//     const response = await getQuickAsset({
//       companyIds:
//         selectedCompanyIds.length > 0
//           ? selectedCompanyIds.map((id) => Number(id))
//           : [], // empty array means all companies
//       startDate: startDate || '2025-07-01',
//       endDate: endDate || '2025-09-30',
//       token,
//     })

//     if (!response?.data) {
//       toast({
//         title: 'Error',
//         description: 'Failed to load quick asset',
//       })
//       setQuickAsset([])
//       return
//     }

//     const data = Array.isArray(response.data) ? response.data : [response.data]

//     setQuickAsset(data)
//   }, [selectedCompanyIds, startDate, endDate, token])

//   useEffect(() => {
//     fetchQuickAsset()
//   }, [fetchQuickAsset])

//   useEffect(() => {
//     fetchCompanies()
//   }, [fetchCompanies])

//   return (
//     <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
//       <QuickAssetReportHeading
//         startDate={startDate}
//         endDate={endDate}
//         selectedCompanyIds={selectedCompanyIds}
//         companies={companies}
//         onStartDateChange={setStartDate}
//         onEndDateChange={setEndDate}
//         onCompanyIdsChange={setSelectedCompanyIds}
//         onRefresh={fetchQuickAsset}
//       />

//       <QuickAssetReportTable data={quickAsset} companies={companies} />
//     </div>
//   )
// }

// export default QuickAssetReport


'use client'
import { getQuickAsset } from '@/api/quick-asset-report-api'
import { toast } from '@/hooks/use-toast'
import type { QuickAssetType } from '@/utils/type'
import { tokenAtom, useInitializeUser } from '@/utils/user'
import { useAtom } from 'jotai'
import React, { useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import QuickAssetReportHeading from './quick-asset-report-heading'
import QuickAssetReportTable from './quick-asset-report-table'
import { getAllCompanies } from '@/api/common-shared-api'
import type { CompanyType } from '@/api/company-api'

const QuickAssetReport = () => {
  useInitializeUser()
  const [token] = useAtom(tokenAtom)
  const router = useRouter()

  const [quickAsset, setQuickAsset] = React.useState<QuickAssetType[]>([])
  const [startDate, setStartDate] = React.useState(
    new Date().toISOString().split('T')[0]
  )
  const [endDate, setEndDate] = React.useState(
    new Date().toISOString().split('T')[0]
  )
  const [selectedCompanyIds, setSelectedCompanyIds] = React.useState<string[]>(
    []
  )
  const [companies, setCompanies] = React.useState<CompanyType[]>([])

  // Fetch companies
  const fetchCompanies = useCallback(async () => {
    if (!token) return

    try {
      const fetchedCompanies = await getAllCompanies(token)
      if (fetchedCompanies?.error?.status === 401) {
        router.push('/unauthorized-access')
        return
      } else if (fetchedCompanies.error || !fetchedCompanies.data) {
        toast({
          title: 'Error',
          description:
            fetchedCompanies.error?.message || 'Failed to get companies',
          variant: 'destructive',
        })
      } else {
        setCompanies(fetchedCompanies.data)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch companies',
        variant: 'destructive',
      })
    }
  }, [token, router])

  // Fetch quick asset
  const fetchQuickAsset = useCallback(async () => {
    if (!token) return

    const companyIds =
      selectedCompanyIds.length > 0
        ? selectedCompanyIds.map((id) => Number(id))
        : []

    const response = await getQuickAsset({
      companyIds,
      startDate: startDate || '2025-07-01',
      endDate: endDate || '2025-09-30',
      token,
    })

    if (!response?.data) {
      toast({
        title: 'Error',
        description: 'Failed to load quick asset',
      })
      setQuickAsset([])
      return
    }

    const data = Array.isArray(response.data) ? response.data : [response.data]
    setQuickAsset(data)
  }, [selectedCompanyIds, startDate, endDate, token])

  useEffect(() => {
    fetchQuickAsset()
  }, [fetchQuickAsset])

  useEffect(() => {
    fetchCompanies()
  }, [fetchCompanies])

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <QuickAssetReportHeading
        startDate={startDate}
        endDate={endDate}
        selectedCompanyIds={selectedCompanyIds}
        companies={companies}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onCompanyIdsChange={setSelectedCompanyIds}
        onRefresh={fetchQuickAsset}
      />

      <QuickAssetReportTable data={quickAsset} companies={companies} />
    </div>
  )
}

export default QuickAssetReport
