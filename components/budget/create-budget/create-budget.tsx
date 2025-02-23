'use client'

import { useEffect, useState } from 'react'

import CreateBudgetHeading from './create-budget-heading'
import CreateBudgetForm from './create-budget-form'

import { toast } from '@/hooks/use-toast'
import { MasterBudgetType } from '@/utils/type'
import CreateBudgetList from './create-budget-list'
import { getAllMasterBudget } from '@/api/budget-api'
import { string } from 'zod'

const CreateBudget = () => {
  const [showForm, setShowForm] = useState<boolean>(false)
  const [masterBudget, setMasterBudget] = useState<MasterBudgetType[]>([])

  const mainToken = localStorage.getItem('authToken')
  console.log('🚀 ~ create budget token:', mainToken)
  const token = `Bearer ${mainToken}`

  const handleDraft = () => {
    console.log('Draft saved')
  }

  const handleNew = () => {
    setShowForm(true)
  }

  async function fetchGetAllMasterBudget({token}: { token: string }) {
    try {
      const response = await getAllMasterBudget({token})
      if (!response.data) throw new Error('No data received')
      setMasterBudget(response.data)
      console.log('master budget data: ', response.data)
    } catch (error) {
      console.error('Error getting master budget:', error)
      toast({
        title: 'Error',
        description: 'Failed to load master budget',
      })
      setMasterBudget([])
    }
  }

  useEffect(() => {
    fetchGetAllMasterBudget( {token} )
  }, [token])

  return (
    <div className="container mx-auto p-6">
      <CreateBudgetHeading onDraft={handleDraft} onNew={handleNew} />
      <CreateBudgetList masterBudget={masterBudget} />
      {showForm && <CreateBudgetForm />}
    </div>
  )
}

export default CreateBudget
