import React from 'react'

import CashPositionTable from './cash-position-table'
import CashPositonHeading from './cash-position-heading'

const CashPositon = () => {
  return (
    <div className="container mx-4">
      <CashPositonHeading />
      <CashPositionTable />
    </div>
  )
}

export default CashPositon
