'use client'
import { useState } from 'react'
import LoanList from './loan-list'
import LoanPopUp from './loan-popup'

const Loan = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false)

  const handleAddCategory = () => {
    setIsPopupOpen(true)
  }

  const handleCategoryAdded = () => {
    setIsPopupOpen(false)
  }

  return (
    <div className="container mx-auto p-4">
      <LoanList onAddCategory={handleAddCategory} />
      <LoanPopUp
        isOpen={isPopupOpen}
        onOpenChange={setIsPopupOpen}
        onCategoryAdded={handleCategoryAdded}
        employees={[]} // Pass an empty array or the appropriate employees data
      />
    </div>
  )
}

export default Loan
