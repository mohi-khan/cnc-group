'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import PaymentRequisitionList from './payment-requisition-list'
import PaymentRequisitionPopup from './payment-requisition-popup'
import { PurchaseEntryType } from '@/utils/type'
import { createPaymentRequisition, getAllPaymentRequisition } from '@/api/payment-requisition-api'

const PaymentRequisition = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [requisitions, setRequisitions] = useState<PurchaseEntryType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjg0LCJ1c2VybmFtZSI6InJpYWRuIiwiaWF0IjoxNzM5MjU3ODA3LCJleHAiOjE3MzkzNDQyMDd9.U2bbHQSkwzTps9MV5ixvKK81IpdpAJqU474i9hBpPuI' // Replace with actual token management logic

  useEffect(() => {
    fetchRequisitions()
  }, [])

  const fetchRequisitions = async () => {
    try {
      setLoading(true)
      const data = await getAllPaymentRequisition({
        companyId: 75,
        token: token
      })
      setRequisitions(data.data)
      console.log("🚀 ~ fetchRequisitions ~ data:", data.data)
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
        <Button onClick={() => setIsPopupOpen(true)}>Add</Button>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <PaymentRequisitionList requisitions={requisitions} />
      )}
      <PaymentRequisitionPopup 
        isOpen={isPopupOpen} 
        onClose={() => setIsPopupOpen(false)}
        onSubmit={handleCreateRequisition}
      />
    </div>
  )
}

export default PaymentRequisition
