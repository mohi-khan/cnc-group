import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import React from 'react'

const Loader = () => {
  return (
    // <div className="flex justify-center items-center h-64">
    //   <Loader2 className="h-8 w-8 animate-spin" />
    // </div>
    <Card>
      <CardContent className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default Loader
