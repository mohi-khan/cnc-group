'use client'

import React, { useState, useEffect, useCallback } from 'react'
import PaymentRequisitionList from './payment-requisition-list'
import { GetPaymentOrder } from '@/utils/type'
import { getAllPaymentRequisition } from '@/api/payment-requisition-api'
import { PaymentRequisitionPopup } from './payment-requisition-popup'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'

const PaymentRequisition = () => {
  //getting userData from jotai atom component
  useInitializeUser()
  const [token] = useAtom(tokenAtom)
  const [userData] = useAtom(userDataAtom)
  

  const router = useRouter()

  //state variables
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [requisitions, setRequisitions] = useState<GetPaymentOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRequisitions = useCallback(async () => {
    if (!token) return
    const companyId = userData?.userCompanies
      ?.map((company) => company?.company?.companyId)
      .join(',')
    if (!companyId) return
    try {
      setLoading(true)
      const data = await getAllPaymentRequisition({
        companyId: parseInt(companyId),
        token: token,
      })
      if (data?.error?.status === 401) {
        router.push('/unauthorized-access')
        
        return
      } else if (data.error || !data.data) {
        console.error('Error fetching requisitions:', data.error)
        setError(data.error?.message || 'Failed to fetch requisitions')
        return
      } else {
        const filteredRequisitions =
          data.data?.filter((req) => req.status !== 'Invoice Created') || []
        setRequisitions(filteredRequisitions)
        
      }
    } catch (err) {
      setError('Failed to fetch requisitions')
    } finally {
      setLoading(false)
    }
  }, [token, router, userData?.userCompanies])

  useEffect(() => {
    const checkUserData = () => {
      const storedUserData = localStorage.getItem('currentUser')
      const storedToken = localStorage.getItem('authToken')

      if (!storedUserData || !storedToken) {
        
        router.push('/')
        return
      }
    }

    checkUserData()
    fetchRequisitions()
  }, [fetchRequisitions, router])

  // const handleCreateRequisition = async (newRequisition: PurchaseEntryType) => {
  //   try {
  //     await createPaymentRequisition(newRequisition, token)
  //     await fetchRequisitions()
  //     setIsPopupOpen(false)
  //   } catch (err) {
  //     setError('Failed to create requisition')
  //   }
  // // }  Commented out as Requistion creation function is not required in the business logic

  return (
    <div className="p-6">
     
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <PaymentRequisitionList
          requisitions={requisitions}
          token={token}
          onRefresh={fetchRequisitions}
        />
      )}
      <PaymentRequisitionPopup
        status={requisitions[0]?.status}
        isOpen={isPopupOpen}
        onOpenChange={setIsPopupOpen}
        requisition={requisitions[0] || null}
        token={token}
        onSuccess={fetchRequisitions}
      />
    </div>
  )
}

export default PaymentRequisition
