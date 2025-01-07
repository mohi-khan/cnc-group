'use client'
import React, { useEffect, useState } from 'react'
import AssetList from './asset-list'
import { getAssets } from '@/api/assets.api'
import { CreateAssetData } from '@/utils/type'

const Asset = () => {
  const [asset, setAsset] = useState<CreateAssetData[]>([])
  useEffect(() => {
    fetchAssets()
  }, [])
  const fetchAssets = async () => {
    try {
      const response = await getAssets()
      if (response.data) {
        setAsset(response.data)
      } else {
        setAsset([])
      }
      console.log('Show The Assets All Data :', response.data)
    } catch (error) {
      console.error('Failed to fetch asset categories:', error)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <AssetList response={asset} />
    </div>
  )
}

export default Asset
