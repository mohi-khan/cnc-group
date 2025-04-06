"use client"

import ExcelFileInput from "@/utils/excel-file-input"

const BankTransactions = () => {
  return (
    <div className="w-[96%] mx-auto pt-10">
      <h1>Upload Excel file</h1>
      <ExcelFileInput apiEndpoint="api/bank-transactions/create-bank-transactions" />
    </div>
  )
}

export default BankTransactions

