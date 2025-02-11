'use client'

import BudgetForm from './test'

// import { useState } from 'react'

// import CreateBudgetHeading from './create-budget-heading'
// import CreateBudgetForm from './create-budget-form'
// import { createBudgetItems } from '@/api/budget-api'
// import { useToast } from '@/hooks/use-toast'
// import { CreateBudgetItemsType } from '@/utils/type'

const CreateBudget = () => {
  // const [showForm, setShowForm] = useState<boolean>(false)
  // const [budgetData, setBudgetData] = useState<CreateBudgetItemsType[] | null>(null)
  // const { toast } = useToast()

  // const handleDraft = () => {
  //   console.log('Draft saved')
  //   // Implement draft saving logic here
  // }

  // // const token = localStorage.getItem('authToken') // Ensure key matches storage
  // // console.log('token', token)

  // const handleSave = async () => {
  //   if (!budgetData) {
  //     toast({
  //       title: 'Error',
  //       description: 'No budget data to save',
  //       variant: 'destructive',
  //     })
  //     return
  //   }

  //   try {
  //     const response = await createBudgetItems(budgetData)
  //     if (response.error) {
  //       throw new Error(response.error.message)
  //     }
  //     toast({
  //       title: 'Success',
  //       description: 'Budget saved successfully',
  //     })
  //   } catch (error) {
  //     toast({
  //       title: 'Error',
  //       description: (error as Error).message || 'Failed to save budget',
  //       variant: 'destructive',
  //     })
  //   }
  // }

  // const handleNew = () => {
  //   setShowForm(true)
  // }

  return (
    <div>
      <BudgetForm />
    </div>
    // <div className="container mx-auto p-6">
    //   <CreateBudgetHeading
    //     onDraft={handleDraft}
    //     onSave={handleSave}
    //     onNew={handleNew}
    //   />
    //   {showForm && <CreateBudgetForm onDataChange={setBudgetData} />}
    // </div>
  )
}

export default CreateBudget
