'use client'
import React, { useEffect, useState } from 'react'
import { AssetList } from '@/components/assets/assets/asset-list'

import { AssetCategoryType, CreateAssetData, GetAssetData } from '@/utils/type'
import { AssetPopUp } from './asset-popup'
import { getAllAssetCategories } from '@/api/asset-category-api'
import { getAssets } from '@/api/common-shared-api'
import { tokenAtom, useInitializeUser } from '@/utils/user'
import { useAtom } from 'jotai'

const Asset = () => {

    //getting userData from jotai atom component
    useInitializeUser()
  
  const [token] = useAtom(tokenAtom)
  
  const [asset, setAsset] = useState<GetAssetData[]>([])
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [assetCategories, setAssetCategories] = useState<AssetCategoryType[]>(
    []
  )
  useEffect(() => {
    fetchAssets()
    fetchAssetCategories()
  }, [])

  // Fetch all assets
  const fetchAssets = async () => {
    try {
      const assetdata = await getAssets(token)
      if (assetdata.data) {
        setAsset(assetdata.data)
      } else {
        setAsset([])
      }
      console.log('Show The Assets All Data :', assetdata.data)
    } catch (error) {
      console.error('Failed to fetch asset categories:', error)
    }
  }

  const fetchAssetCategories = async () => {
    try {
      const categories = await getAllAssetCategories(token)
      const categoryNames = categories.data ?? []
      setAssetCategories(categoryNames)
      console.log(
        'fetchAssetCategories category names asset tsx file:',
        categoryNames
      )
    } catch (error) {
      console.error('Failed to fetch asset categories:', error)
    }
  }

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
