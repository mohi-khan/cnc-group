import { getAllBudgetDetails, getAllMasterBudget } from '@/api/budget-api'
import { FormItem, FormLabel } from '@/components/ui/form'
import { toast } from '@/hooks/use-toast'
import { CustomCombobox } from '@/utils/custom-combobox'
import { BudgetItems, MasterBudgetType } from '@/utils/type'
import React, { useEffect, useState } from 'react'

const CreateBudgetList = () => {
  const [masterBudget, setMasterBudget] = useState<MasterBudgetType[]>()
  const [budgetItems, setBudgetItems] = useState<BudgetItems[]>()

  async function fetchGetAllMasterBudget() {
    try {
      const response = await getAllMasterBudget()
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

  async function fetchGetBudgetItems() {
    try {
      const response = await getAllBudgetDetails()
      if (!response.data) throw new Error('No data received')
      setBudgetItems(response.data)
      console.log('Budget Items data: ', response.data)
    } catch (error) {
      console.error('Error getting Budget Items:', error)
      toast({
        title: 'Error',
        description: 'Failed to load Budget Items',
      })
      setBudgetItems([])
    }
  }

  useEffect(() => {
    fetchGetAllMasterBudget()
    fetchGetBudgetItems()
  }, [])
  const [field, setField] = useState<{ value: number | null }>({ value: null })

  return (
    <div>
          <FormItem>
              
        <CustomCombobox
          items={(masterBudget ?? []).map((riad, index) => ({
            id: index.toString(),
            name: riad.name || 'Unnamed Budget',
          }))}
          value={
            field.value
              ? {
                  id: field.value.toString(),
                  name:
                    masterBudget?.find((_, idx) => idx === field.value)?.name ||
                    'Select Budget',
                }
              : null
          }
          onChange={(value: { id: string; name: string } | null) =>
            setField({ value: value ? Number.parseInt(value.id, 10) : null })
          }
          placeholder="Select Budget"
        />
      </FormItem>
    </div>
  )
}

export default CreateBudgetList
