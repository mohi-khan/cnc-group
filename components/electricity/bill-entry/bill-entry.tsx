'use client'
import React, { useEffect, useState } from 'react'
import BillEntryList from './bill-entry-list'
import BillEntryPopUp from './bill-entry-popup'
import { GetElectricityBillType } from '@/utils/type'
import { getBillEntry } from '@/api/bill-entry-api'
import { tokenAtom, useInitializeUser } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'

const BillEntry = () => {
  useInitializeUser()

  const [token] = useAtom(tokenAtom)
  const router = useRouter()

  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [billEntry, setBillEntry] = React.useState<GetElectricityBillType[]>([])

  const fetchBillEntry = React.useCallback(async () => {
    if (!token) return
    const response = await getBillEntry(token)

    setBillEntry(response?.data ?? [])
    
  }, [token])

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
    fetchBillEntry()
  }, [fetchBillEntry, router,token])

  const handleAddCategory = () => {
    setIsPopupOpen(true)
  }

  const handleCategoryAdded = () => {
    setIsPopupOpen(false)
  }
  return (
    <div>
      <BillEntryList onAddCategory={handleAddCategory} billEntry={billEntry} />
      <BillEntryPopUp
        isOpen={isPopupOpen}
        onOpenChange={setIsPopupOpen}
        onCategoryAdded={handleCategoryAdded}
        fetchBillEntry={fetchBillEntry}
      />
    </div>
  )
}

export default BillEntry
