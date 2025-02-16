'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import PaymentRequisitionList from './payment-requisition-list'
import PaymentRequisitionPopup from './payment-requisition-popup'
import { GetPaymentOrder, PurchaseEntryType } from '@/utils/type'
import {
  createPaymentRequisition,
  getAllPaymentRequisition,
} from '@/api/payment-requisition-api'

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
      setRequisitions(data.data || [])
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
      await fetchRequisitions() // Refresh the list after creating
      setIsPopupOpen(false)
    } catch (err) {
      setError('Failed to create requisition')
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Payment Requisition</h1>
        {requisitions[0]?.status === 'GRN Completed' && (
          <Button onClick={() => setIsPopupOpen(true)}>Create Invoice</Button>
        )}
        {requisitions[0]?.status === 'Invoice Approved' && (
          <Button onClick={() => setIsPopupOpen(true)}>Create Payment</Button>
        )}
        {requisitions[0]?.status === 'Purchase Orderd' && (
          <Button onClick={() => setIsPopupOpen(true)}>Create Advance</Button>
        )}
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <PaymentRequisitionList requisitions={requisitions} />
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
