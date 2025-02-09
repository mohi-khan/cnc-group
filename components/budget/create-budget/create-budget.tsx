// 'use client'

// import React from 'react'
// import CreateBudgetForm from './create-budget-form'
// import CreateBudgetHeading from './create-budget-heading'

// const CreateBudget = () => {

//   const [showForm, setShowForm] = React.useState(false)
//   const handleDraft = () => {
//     console.log('Draft saved')
//     // Implement draft saving logic here
//   }

//   const handleSave = () => {
//     console.log('Budget saved')
//     // Implement final save logic here
//   }

//   const handleNew = () => {
//     setShowForm(true)
//   }

//   return (
//     <div className="container mx-auto p-6">
//       <CreateBudgetHeading
//         onDraft={handleDraft}
//         onSave={handleSave}
//         onNew={handleNew}
//       />
//       {showForm && <CreateBudgetForm />}
//     </div>
//   )
// }

// export default CreateBudget

'use client'

import { useState } from 'react'
import CreateBudgetForm from './create-budget-form'
import CreateBudgetHeading from './create-budget-heading'
import { createBudgetItems } from '@/api/budget-api'
import { useToast } from '@/hooks/use-toast'
import { CreateBudgetItemsType } from '@/utils/type'

const CreateBudget = () => {
  const [showForm, setShowForm] = useState<boolean>(false)
  const [budgetData, setBudgetData] = useState(null)
  const { toast } = useToast()

  const handleDraft = () => {
    console.log('Draft saved')
    // Implement draft saving logic here
  }

  const handleSave = async () => {
    if (!budgetData) {
      toast({
        title: 'Error',
        description: 'No budget data to save',
        variant: 'destructive',
      })
      return
    }

    try {
      const response = await createBudgetItems(budgetData)
      if (response.error) {
        throw new Error(response.error.message)
      }
      toast({
        title: 'Success',
        description: 'Budget saved successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).message || 'Failed to save budget',
        variant: 'destructive',
      })
    }
  }

  const handleNew = () => {
    setShowForm(true)
  }

  return (
    <div className="container mx-auto p-6">
      <CreateBudgetHeading
        onDraft={handleDraft}
        onSave={handleSave}
        onNew={handleNew}
      />
      {showForm && <CreateBudgetForm onDataChange={setBudgetData} />}
    </div>
  )
}

export default CreateBudget
