'use client'

import React, { useState, useEffect } from 'react'
import { AssetCategoryType } from '@/utils/type'
import { getAllAssetCategories } from '@/api/asset-category-api'
import { AssetCategoryList } from './asset-category-list'
import { AssetCategoryPopup } from './asset-category-popup'

const AssetCategory = () => {
  const [assetCategories, setAssetCategories] = useState<AssetCategoryType[]>([])
  const [isPopupOpen, setIsPopupOpen] = useState(false)

  useEffect(() => {
    fetchAssetCategories()
  }, [])

  const fetchAssetCategories = async () => {
    try {
      const categories = await getAllAssetCategories()
      setAssetCategories(categories.data ?? [])
      console.log("🚀 ~ fetchAssetCategories ~ categories:", categories)
    } catch (error) {
      console.error('Failed to fetch asset categories:', error)
    }
  }

  const handleAddCategory = () => {
    setIsPopupOpen(true)
  }

  const handleClosePopup = () => {
    setIsPopupOpen(false)
  }

  const handleCategoryAdded = () => {
    fetchAssetCategories()
    setIsPopupOpen(false)
  }

  return (
    <div className="container mx-auto p-4">
      <AssetCategoryList 
        categories={assetCategories} 
        onAddCategory={handleAddCategory} 
      />
      <AssetCategoryPopup 
        isOpen={isPopupOpen}
        onOpenChange={setIsPopupOpen}
        onCategoryAdded={handleCategoryAdded} 
      />
    </div>
  )
}

export default AssetCategory

