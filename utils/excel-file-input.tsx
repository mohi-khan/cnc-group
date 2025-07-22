'use client'

import { createBankTransactions } from '@/api/excel-file-input-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import React from 'react'
import * as XLSX from 'xlsx'
import { tokenAtom, useInitializeUser } from './user'
import { useAtom } from 'jotai'

interface ExcelFileInputProps {
  apiEndpoint: string
}

function ExcelFileInput({ apiEndpoint }: ExcelFileInputProps) {
  //getting userData from jotai atom component
  useInitializeUser()
  const [token] = useAtom(tokenAtom)

  //state variables
  const [data, setData] = React.useState<object[] | null>(null)
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [message, setMessage] = React.useState<string | null>(null)

  interface FileInputEvent extends React.ChangeEvent<HTMLInputElement> {
    target: HTMLInputElement & EventTarget
  }

  // Handle Excel file upload
  const handleFileUpload = (e: FileInputEvent): void => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()

    reader.onload = (event: ProgressEvent<FileReader>): void => {
      if (!event.target) return
      const workbook = XLSX.read(event.target.result as string, {
        type: 'binary',
      })
      const sheetName = workbook.SheetNames[0]
      const sheet = workbook.Sheets[sheetName]
      let sheetData = XLSX.utils.sheet_to_json(sheet, {
        raw: false,
      }) as Record<string, any>[]

      // Convert Excel serial numbers to proper dates
      sheetData = sheetData.map((row) => {
        const newRow: Record<string, any> = {}

        for (const key in row) {
          if (
            typeof row[key] === 'number' &&
            row[key] > 40000 &&
            row[key] < 50000
          ) {
            // Assuming values in this range are Excel date serial numbers
            newRow[key] = convertExcelDate(row[key])
          } else {
            newRow[key] = row[key]
          }
        }

        return newRow
      })

      
      setData(sheetData)
    }

    reader.readAsBinaryString(file)
  }

  // Convert Excel serial number to a JavaScript date string (YYYY-MM-DD)
  const convertExcelDate = (serial: number): string => {
    const excelStartDate = new Date(1899, 11, 30) // Excel starts from 1899-12-30
    const date = new Date(excelStartDate.getTime() + serial * 86400000) // Add days
    return date.toISOString().split('T')[0] // Format as YYYY-MM-DD
  }

  // Handle data submission to API
  const handleSubmit = async () => {
    if (!data) {
      setMessage('No data to submit. Please upload an Excel file first.')
      return
    }

    try {
      setIsLoading(true)
      setMessage('Submitting data...')

      const response = await createBankTransactions(data, apiEndpoint, token)

      setMessage('Bank transactions created successfully!')
      
    } catch (error) {
      setMessage(
        `Error creating bank transactions: ${error instanceof Error ? error.message : String(error)}`
      )
      console.error('Error creating bank transactions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Get table headers from the first data item
  const getTableHeaders = () => {
    if (!data || data.length === 0) return []
    return Object.keys(data[0] as Record<string, any>)
  }

  return (
    <div className="space-y-2 mb-8">
      {/* File Upload */}
      <div className="flex items-center justify-center  rounded-md">
        <Input
          type="file"
          onChange={handleFileUpload}
          className="w-[5px] mr-2 rounded-md file:mr-4 file:py-5 file:font-semibold file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-400 file:cursor-pointer  file:text-sm file:shadow-sm file:rounded-lg file:transition-all file:duration-300 file:ease-in-out"
        />
        <Button type="button" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Submitting...' : 'Submit Data'}
        </Button>
      </div>

      {/* Submission Status Message */}
      {message && (
        <div
          className={`p-3 rounded-md ${message.includes('Error') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
        >
          {message}
        </div>
      )}

      {/* Display Imported Data as Table */}
      {Array.isArray(data) && data.length > 0 && (
        <div className="mt-4 pb-10">
          <h2 className="text-lg font-semibold mb-4">Imported Data:</h2>
          <div className="overflow-x-auto">
            <Table className="border-2 shadow-2xl mb-24 w-full rounded-xl ">
              <TableHeader className="bg-slate-200 shadow-md rounded-xl">
                <TableRow>
                  {getTableHeaders().map((header) => (
                    <TableHead key={header} className="p-4">{header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {getTableHeaders().map((header) => (
                      <TableCell key={`${rowIndex}-${header}`} className="p-3">
                        {(row as Record<string, any>)[header]?.toString() || ''}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExcelFileInput
