// 'use client'
// import React, { useState } from 'react'
// import FdrRecordList from './fdr-record-list'
// import FdrRecordPopUp from './fdr-record-popup'
// import {
//   Card,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card'
// import { CreditCard } from 'lucide-react'

// const FdrRecord = () => {
//   const [isPopupOpen, setIsPopupOpen] = useState(false)

//   const handleAddCategory = () => {
//     setIsPopupOpen(true)
//   }

//   const handleCategoryAdded = () => {
//     setIsPopupOpen(false)
//   }
//   return (
//     <div>
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <CreditCard className="h-5 w-5" />
//             FDR Records
//           </CardTitle>
//           <CardDescription>
//             Manage and view all Fixed Deposit Receipt records
//             {/* ({fdrdata.length}{' '} */}
//             total records
//           </CardDescription>
//         </CardHeader>
//       </Card>

//       <FdrRecordList />
//       <FdrRecordPopUp
//         isOpen={isPopupOpen}
//         onOpenChange={setIsPopupOpen}
//         onCategoryAdded={handleCategoryAdded}
//       />
//     </div>
//   )
// }

// export default FdrRecord

'use client'

import { useState } from 'react'
import FdrRecordList from './fdr-record-list'
import FdrRecordPopUp from './fdr-record-popup'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreditCard, Plus } from 'lucide-react'

const FdrRecord = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false)

  const handleAddRecord = () => {
    setIsPopupOpen(true)
  }

  const handleRecordAdded = () => {
    setIsPopupOpen(false)
    // You can add logic here to refresh the FDR list
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                FDR Records
              </CardTitle>
              <CardDescription>
                Manage and view all Fixed Deposit Receipt records
              </CardDescription>
            </div>
            <Button
              onClick={handleAddRecord}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              ADD 
            </Button>
          </div>
        </CardHeader>
      </Card>

      <FdrRecordList />

      <FdrRecordPopUp
        isOpen={isPopupOpen}
        onOpenChange={setIsPopupOpen}
        onRecordAdded={handleRecordAdded}
      />
    </div>
  )
}

export default FdrRecord
