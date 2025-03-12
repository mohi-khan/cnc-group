'use client'
import React, { useEffect, useState } from 'react'
import BillEntryList from './bill-entry-list'
import BillEntryPopUp from './bill-entry-popup'
import { GetElectricityBillType } from '@/utils/type'
import { getBillEntry } from '@/api/bill-entry-api'

const BillEntry = () => {

  const [isPopupOpen, setIsPopupOpen] = useState(false)
   const [billEntry, setBillEntry] = React.useState<GetElectricityBillType[]>([])
    
  
    const fetchBillEntry = async () => {
      const response = await getBillEntry()
      setBillEntry(response.data ?? [])
      console.log('🚀 ~get meter entry data :', response)
    }
  
    useEffect(() => {
      fetchBillEntry()
    }, [])
      
  
  
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
