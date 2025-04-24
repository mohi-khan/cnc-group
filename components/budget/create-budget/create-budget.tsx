'use client'

import { useEffect, useState } from 'react'

import CreateBudgetHeading from './create-budget-heading'
import CreateBudgetForm from './create-budget-form'

import { toast } from '@/hooks/use-toast'
import { AccountsHead, ChartOfAccount, MasterBudgetType } from '@/utils/type'
import CreateBudgetList from './create-budget-list'
import { getAllMasterBudget } from '@/api/budget-api'
import { CompanyType } from '@/api/company-api'
import { getAllCompanies } from '@/api/common-shared-api'

const CreateBudget = () => {
  const [showForm, setShowForm] = useState<boolean>(false)
  const [masterBudget, setMasterBudget] = useState<MasterBudgetType[]>([])
  const [token, setToken] = useState<string | null>(null)
  const [company, setCompany] = useState<CompanyType[]>([])

  // Retrieve token from localStorage safely
  useEffect(() => {
    const mainToken = localStorage.getItem('authToken')
    if (mainToken) {
      setToken(`Bearer ${mainToken}`)
      console.log('🚀 ~ create budget token:', mainToken)
    }
  }, [])

  const handleDraft = () => {
    console.log('Draft saved')
  }

  const handleNew = () => {
    setShowForm(true)
  }

  async function fetchGetAllCompany() {
    try {
      const response = await getAllCompanies()
      if (!response.data) throw new Error('No data received')
      setCompany(response.data)
      console.log('In budget Company data get: ', response.data)
    } catch (error) {
      console.error('Error getting company AI:', error)
      toast({
        title: 'Error',
        description: 'Failed to load company AI data',
      })
      setCompany([])
    }
  }

  async function fetchGetAllMasterBudget(token: string) {
    try {
      const response = await getAllMasterBudget({ token })
      if (!response.data) throw new Error('No data received')
      setMasterBudget(response.data)
      console.log('Master budget data: ', response.data)
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
    if (token) {
      fetchGetAllMasterBudget(token)
      fetchGetAllCompany()
    }
  }, [token])

  return (
    <div className="container mx-auto p-6">
      <CreateBudgetHeading onDraft={handleDraft} onNew={handleNew} />
      <CreateBudgetList
        masterBudget={masterBudget}
        token={token}
        company={company}
      />
      {showForm && token && (
        <CreateBudgetForm
          token={token}
          company={company}
          refreshBudgetList={() => fetchGetAllMasterBudget(token)}
        />
      )}
    </div>
  )
}

export default CreateBudget
