'use client'

import React, { useState, useEffect } from 'react'
import PaymentRequisitionList from './payment-requisition-list'
import { GetPaymentOrder, PurchaseEntryType } from '@/utils/type'
import {
  createPaymentRequisition,
  getAllPaymentRequisition,
} from '@/api/payment-requisition-api'
import { PaymentRequisitionPopup } from './payment-requisition-popup'

const PaymentRequisition = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [requisitions, setRequisitions] = useState<GetPaymentOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const mainToken = localStorage.getItem('authToken')
  console.log('🚀 ~ PaymentRequisition ~ mainToken:', mainToken)
  const token = `Bearer ${mainToken}`

  useEffect(() => {
    fetchRequisitions()
  }, [])

  const fetchRequisitions = async () => {
    try {
      setLoading(true)
      const data = await getAllPaymentRequisition({
        companyId: 75,
        token: token,
      })
      const filteredRequisitions = data.data?.filter(
        (req) => req.status !== 'Invoice Created'
    ) || []; 
      setRequisitions(filteredRequisitions)
      console.log('🚀 ~ fetchRequisitions ~ data:', data.data)
    } catch (err) {
      setError('Failed to fetch requisitions')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRequisition = async (newRequisition: PurchaseEntryType) => {
    try {
      await createPaymentRequisition(newRequisition, token)
      await fetchRequisitions()
      setIsPopupOpen(false)
    } catch (err) {
      setError('Failed to create requisition')
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Payment Requisition</h1>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <PaymentRequisitionList requisitions={requisitions} token={token} onRefresh={fetchRequisitions} />
      )}
      <PaymentRequisitionPopup
        status={requisitions[0]?.status}
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onSubmit={handleCreateRequisition}
      />
    </div>
  )
}

export default PaymentRequisition
