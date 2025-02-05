import React from 'react'
import CurrencyTable from './currency-table'

const Currency = () => {
  return (
    <div className="w-[97%] mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Currency List</h1>
      </div>
      <CurrencyTable />
    </div>
  )
}

export default Currency
