'use client'

import React from 'react'
import CreateBudgetForm from './create-budget-form'
import CreateBudgetHeading from './create-budget-heading'

const CreateBudget = () => {

  const [showForm, setShowForm] = React.useState(false)
  const handleDraft = () => {
    console.log('Draft saved')
    // Implement draft saving logic here
  }

  const handleSave = () => {
    console.log('Budget saved')
    // Implement final save logic here
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
      {showForm && <CreateBudgetForm />}
    </div>
  )
}

export default CreateBudget
