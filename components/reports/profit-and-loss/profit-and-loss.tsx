'use client'
import ProfitAndLossHeading from './profit-and-loss-heading'
import ProfitAndLossTableData from './profit-and-loss-table-data'
import React, { useState, useEffect } from 'react'
import { ProfitAndLossType } from '@/utils/type'
import { usePDF } from 'react-to-pdf'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { getProfitAndLoss } from '@/api/profit-and-loss-api'

const ProfitAndLoss = () => {
  const { toPDF, targetRef } = usePDF({ filename: 'profit_and_loss.pdf' })
  const [profitAndLoss, setProfitAndLoss] = useState<ProfitAndLossType[]>([])
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [companyId, setCompanyId] = useState<string>('')

  const generatePdf = () => {
    toPDF()
  }

  const exportToExcel = (data: ProfitAndLossType[], fileName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(flattenData(data))
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Trial Balance')
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    })
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    })
    saveAs(blob, `${fileName}.xlsx`)
  }

  const flattenData = (data: ProfitAndLossType[]): any[] => {
    return data.map((item) => ({
      title: item.title,
      value: item.value,
      position: item.position,
      negative: item.negative,
    }))
  }

  const generateExcel = () => {
    exportToExcel(profitAndLoss, 'profit-and-loss')
  }

  const handleFilterChange = (
    newStartDate: Date | undefined,
    newEndDate: Date | undefined,
    newCompanyId: string
  ) => {
    setStartDate(newStartDate)
    setEndDate(newEndDate)
    setCompanyId(newCompanyId)
  }

  useEffect(() => {
    if (startDate && endDate && companyId) {
      const fetchData = async () => {
        const response = await getProfitAndLoss({
          fromdate: startDate.toISOString().split('T')[0],
          enddate: endDate.toISOString().split('T')[0],
          companyId: companyId,
        })
        setProfitAndLoss(response.data || [])
        console.log('this is from Profit and loss data : ', response.data || [])
      }
      fetchData()
    }
  }, [startDate, endDate, companyId])

  return (
    <div>
      <ProfitAndLossHeading
        generatePdf={generatePdf}
        generateExcel={generateExcel}
        onFilterChange={handleFilterChange}
      />
      <ProfitAndLossTableData targetRef={targetRef} data={profitAndLoss} />
    </div>
  )
}

export default ProfitAndLoss
