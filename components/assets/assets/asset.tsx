'use client'
import React, { useEffect, useState,useCallback } from 'react'
import { AssetList } from '@/components/assets/assets/asset-list'

import { AssetCategoryType, CreateAssetData, GetAssetData } from '@/utils/type'
import { AssetPopUp } from './asset-popup'
import { getAllAssetCategories } from '@/api/asset-category-api'
import { getAssets } from '@/api/common-shared-api'
import { tokenAtom, useInitializeUser } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'

const Asset = () => {

    //getting userData from jotai atom component
    useInitializeUser()
  
  const [token] = useAtom(tokenAtom)
    const router = useRouter()
  
  const [asset, setAsset] = useState<GetAssetData[]>([])
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [assetCategories, setAssetCategories] = useState<AssetCategoryType[]>(
    []
  )
 

  // Fetch all assets
  const fetchAssets = useCallback(async () => {
    if(!token) return;
    const assetdata = await getAssets(token)
    if (assetdata?.error?.status === 401) {
      router.push('/unauthorized-access')
      
      return
    } else if (assetdata.error || !assetdata.data) {
      console.error('Error fetching assets:', assetdata.error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: assetdata.error?.message || 'Failed to fetch assets',
      })
    } else {
      setAsset(assetdata.data)
    }
  }, [token, router])

  // Fetch all asset categories
  const fetchAssetCategories = React.useCallback(async () => {
    if(!token) return;
    const categories = await getAllAssetCategories(token)
    const categoryNames = categories.data ?? []
    setAssetCategories(categoryNames)
  }, [token])
  
  useEffect(() => {
    const checkUserData = () => {
      const storedUserData = localStorage.getItem('currentUser')
      const storedToken = localStorage.getItem('authToken')

      if (!storedUserData || !storedToken) {
        
        router.push('/')
        return
      }
      
    }

checkUserData()

    fetchAssets()
    fetchAssetCategories()
  }, [fetchAssets, fetchAssetCategories, router])

  const handleAddCategory = () => {
    setIsPopupOpen(true)
  }

  const handleCategoryAdded = () => {
    fetchAssets()
    setIsPopupOpen(false)
  }

  return (
    <div className="container mx-auto p-4">
      <AssetList
        asset={asset}
        onAddCategory={handleAddCategory}
        categories={assetCategories}
      />
      <AssetPopUp
        isOpen={isPopupOpen}
        onOpenChange={setIsPopupOpen}
        onCategoryAdded={handleCategoryAdded}
        categories={assetCategories}
      />
    </div>
  )
}

export default Asset
