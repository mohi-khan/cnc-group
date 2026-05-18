// import CashVoucher from "@/components/cash/cash-voucher/cash-voucher"


// const CashVoucherPage = () => {
//   return (
//     <div>
//       <CashVoucher onSuccess={undefined} />
//     </div>
//   )
// }

// export default CashVoucherPage


'use client'
import CashVoucher from "@/components/cash/cash-voucher/cash-voucher"
import { useState, useEffect } from "react"

const CashVoucherPage = () => {
  const [refreshKey, setRefreshKey] = useState(0)

  // ✅ voucherUpdated event listen করবে
  useEffect(() => {
    const handleRefresh = () => setRefreshKey(prev => prev + 1)
    window.addEventListener('voucherUpdated', handleRefresh)
    return () => window.removeEventListener('voucherUpdated', handleRefresh)
  }, [])

  return (
    <div>
      <CashVoucher 
        key={refreshKey}  // ✅ key বদলালে component re-mount হবে
        onSuccess={() => setRefreshKey(prev => prev + 1)} 
      />
    </div>
  )
}

export default CashVoucherPage