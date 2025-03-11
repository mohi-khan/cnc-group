'use client'
import React, { useState } from 'react'
import BillEntryList from './bill-entry-list'
import BillEntryPopUp from './bill-entry-popup'

const BillEntry = () => {

  const [isPopupOpen, setIsPopupOpen] = useState(false)
      
  
  
      const handleAddCategory = () => {
        setIsPopupOpen(true)
      }
  
      const handleCategoryAdded = () => {
       
        setIsPopupOpen(false)
      }
  return <div>
    <BillEntryList
      onAddCategory={handleAddCategory}
    />
    <BillEntryPopUp
      isOpen={isPopupOpen}
      onOpenChange={setIsPopupOpen}
      onCategoryAdded={handleCategoryAdded}
    />
  </div>
}

export default BillEntry
