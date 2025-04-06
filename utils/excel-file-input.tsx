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

interface ExcelFileInputProps {
  apiEndpoint: string
}

function ExcelFileInput({ apiEndpoint }: ExcelFileInputProps) {
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

      console.log('Parsed Excel Data with Dates:', sheetData) // Debugging
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

      const response = await createBankTransactions(data, apiEndpoint)

      setMessage('Bank transactions created successfully!')
      console.log('API response:', response)
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
    <div className="space-y-4">
      {/* File Upload */}
      <div className="flex items-center justify-center py-5 rounded-md">
        <Input
          type="file"
          onChange={handleFileUpload}
          className="w-20 mr-2 rounded-md file:mr-4 file:py-5 file:font-semibold"
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
          <h2 className="text-lg font-semibold mb-2">Imported Data:</h2>
          <Table className='border shadow-md mb-20'>
            <TableHeader className='bg-slate-200 shadow-md'>
              <TableRow>
                {getTableHeaders().map((header) => (
                  <TableHead key={header}>{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {getTableHeaders().map((header) => (
                    <TableCell key={`${rowIndex}-${header}`}>
                      {(row as Record<string, any>)[header]?.toString() || ''}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

export default ExcelFileInput
