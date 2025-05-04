'use client'
import React, { JSX, useEffect, useState } from 'react'
import MeterEntryList from './meter-entry-list'
import MeterEntryPopUp from './meter-entry-popup'
import { GetElectricityMeterType } from '@/utils/type'
import { tokenAtom, useInitializeUser } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { getMeterEntry } from '@/api/meter-entry-api'
import { toast } from '@/hooks/use-toast'

const MeterEntry = () => {

    //getting userData from jotai atom component
    useInitializeUser()
  
    const [token] = useAtom(tokenAtom)
    const router = useRouter()
    const [isPopupOpen, setIsPopupOpen] = useState(false)
    const [meterEntry, setMeterEntry] = React.useState<GetElectricityMeterType[]>(
        []
      )

const fetchMeterEntry = React.useCallback(async () => {
      if (!token) return
      const response = await getMeterEntry(token)
      if (response?.error?.status === 401) {
        router.push('/unauthorized-access')
        console.log('Unauthorized access')
        return
      } else if (response.error || !response.data) {
        console.error('Error fetching meter entries:', response.error)
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.error?.message || 'Failed to fetch meter entries',
        })
      } else {
        setMeterEntry(response.data)
      }
    }, [token, router])
    
  useEffect(() => {
    fetchMeterEntry()
  }, [fetchMeterEntry])
    


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
              meterEntry={meterEntry}
          />
      <MeterEntryPopUp
        isOpen={isPopupOpen}
        onOpenChange={setIsPopupOpen}
        onCategoryAdded={handleCategoryAdded}
        fetchMeterEntry={fetchMeterEntry}
        
      />
    </div>
  )
}

export default MeterEntry
