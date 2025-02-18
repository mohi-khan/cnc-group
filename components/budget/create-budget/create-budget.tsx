'use client'

import { useState } from 'react'

import CreateBudgetHeading from './create-budget-heading'
import CreateBudgetForm from './create-budget-form'

import { useToast } from '@/hooks/use-toast'
import { CreateBudgetItemsType } from '@/utils/type'
import CreateBudgetList from './create-budget-list'

const CreateBudget = () => {
  const [showForm, setShowForm] = useState<boolean>(false)

  const handleDraft = () => {
    console.log('Draft saved')
  }

  const handleNew = () => {
    setShowForm(true)
  }

  return (
    <div className="container mx-auto p-6">
      <CreateBudgetHeading onDraft={handleDraft} onNew={handleNew} />
      <CreateBudgetList />
      {showForm && <CreateBudgetForm />}
    </div>
  )
}

export default CreateBudget
