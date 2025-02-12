'use client'

import { useState } from 'react'

import CreateBudgetHeading from './create-budget-heading'
import CreateBudgetForm from './create-budget-form'

import { useToast } from '@/hooks/use-toast'
import { CreateBudgetItemsType } from '@/utils/type'

const CreateBudget = () => {
  const [showForm, setShowForm] = useState<boolean>(false)
  const [budgetData, setBudgetData] = useState<CreateBudgetItemsType[] | null>(
    null
  )
  const { toast } = useToast()

  const handleDraft = () => {
    console.log('Draft saved')
  }

  const handleNew = () => {
    setShowForm(true)
  }

  return (
    <div className="container mx-auto p-6">
      <CreateBudgetHeading onDraft={handleDraft} onNew={handleNew} />
      {showForm && <CreateBudgetForm  />}
    </div>
  )
}

export default CreateBudget

