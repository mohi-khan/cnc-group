'use client'
import React, { useEffect, useState } from 'react'
import { AssetList } from '@/components/assets/assets/asset-list'
import { getAssets } from '@/api/assets.api'
import { CreateAssetData } from '@/utils/type'

const Asset = () => {
  const [asset, setAsset] = useState<CreateAssetData[]>([])
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  useEffect(() => {
    fetchAssets()
  }, [])
  const fetchAssets = async () => {
    try {
      const assetdata = await getAssets()
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

  const handleAddCategory = () => {
    setIsPopupOpen(true)
  }

  const handleCategoryAdded = () => {
    fetchAssets()
    setIsPopupOpen(false)
  }
  return (
    <div className="container mx-auto p-4">
      <AssetList asset={asset} onAddCategory={handleAddCategory} />
      {/* <AssetPopUp
      // isOpen={isPopupOpen}
      // onOpenChange={setIsPopupOpen}
      // onCategoryAdded={handleCategoryAdded}
      /> */}
    </div>
  )
}

export default Asset
