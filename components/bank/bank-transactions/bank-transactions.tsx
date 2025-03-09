"use client"

import ExcelFileInput from "@/utils/excel-file-input"

const BankTransactions = () => {
  return (
    <div className="App">
      <h1>Import Excel Data in React.js</h1>
      <ExcelFileInput apiEndpoint="api/bank-transactions/create-bank-transactions" />
    </div>
  )
}

export default BankTransactions

