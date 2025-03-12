'use client'
import React, { JSX, useState } from 'react'
import MeterEntryList from './meter-entry-list'
import MeterEntryPopUp from './meter-entry-popup'

const MeterEntry = () => {
    const [isPopupOpen, setIsPopupOpen] = useState(false)
    


    const handleAddCategory = () => {
      setIsPopupOpen(true)
    }

    const handleCategoryAdded = () => {
     
      setIsPopupOpen(false)
    }
  return (
    <div>
          <MeterEntryList
              onAddCategory={handleAddCategory}
          />
      <MeterEntryPopUp
        isOpen={isPopupOpen}
        onOpenChange={setIsPopupOpen}
        onCategoryAdded={handleCategoryAdded}
      />
    </div>
  )
}

export default MeterEntry
