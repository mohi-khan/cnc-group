'use client'

import React, { useState, useEffect } from 'react'
import { AssetCategoryType } from '@/utils/type'
import { getAllAssetCategories } from '@/api/asset-category-api'
import { AssetCategoryList } from './asset-category-list'
import { AssetCategoryPopup } from './asset-category-popup'
import { tokenAtom, useInitializeUser } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'

const AssetCategory = () => {
  //getting userData from jotai atom component
  useInitializeUser()

  const [token] = useAtom(tokenAtom)
  const router = useRouter()

  const [assetCategories, setAssetCategories] = useState<AssetCategoryType[]>(
    []
  )
  const [isPopupOpen, setIsPopupOpen] = useState(false)

  const fetchAssetCategories = React.useCallback(async () => {
    const categories = await getAllAssetCategories(token)
    console.log('🚀 ~ fetchAssetCategories ~ categories:', categories)
    setAssetCategories(categories.data ?? [])
  }, [token])

  useEffect(() => {const checkUserData = () => {
      const storedUserData = localStorage.getItem('currentUser')
      const storedToken = localStorage.getItem('authToken')

      if (!storedUserData || !storedToken) {
        console.log('No user data or token found in localStorage')
        router.push('/')
        return
      }
      
    }

checkUserData()
    fetchAssetCategories()
  }, [fetchAssetCategories, router])

  
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
