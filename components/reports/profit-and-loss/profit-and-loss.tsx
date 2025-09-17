'use client'
import ProfitAndLossHeading from './profit-and-loss-heading'
import ProfitAndLossTableData from './profit-and-loss-table-data'
import React, { useState, useEffect, useCallback } from 'react'
import type { CoaPlMappingReport, ProfitAndLossType } from '@/utils/type'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { getProfitAndLoss } from '@/api/profit-and-loss-api'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { getCoaWithMapping } from '@/api/level-api'

const ProfitAndLoss = () => {
  //getting userData from jotai atom component
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const router = useRouter()
  const targetRef = React.useRef<HTMLDivElement>(null)
  const [profitAndLoss, setProfitAndLoss] = useState<CoaPlMappingReport[]>([])
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [companyId, setCompanyId] = useState<string>('')

  const generatePdf = async () => {
    if (!targetRef.current) return

    try {
      // Get company name
      let companyName = 'Company Report'
      if (userData && companyId) {
        const selectedCompany = userData.userCompanies.find(
          (uc) => uc.company.companyId === Number(companyId)
        )
        if (selectedCompany) {
          companyName = selectedCompany.company.companyName
        }
      }

      const element = targetRef.current
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      })

      const imgData = canvas.toDataURL('image/jpeg')
      const pdf = new jsPDF('p', 'mm', 'a4')

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height

      // Calculate scaling to fit page width while maintaining aspect ratio
      const scale = pdfWidth / (imgWidth * 0.264583) // Convert pixels to mm
      const scaledHeight = imgHeight * 0.264583 * scale

      const headerHeight = 20
      const pageContentHeight = pdfHeight - headerHeight - 10

      let currentY = 0
      let pageNumber = 1

      // Add company name header
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text(companyName, pdfWidth / 2, 15, { align: 'center' })

      while (currentY < scaledHeight) {
        if (pageNumber > 1) {
          pdf.addPage()
          // Add header to new page
          pdf.setFontSize(16)
          pdf.setFont('helvetica', 'bold')
          pdf.text(companyName, pdfWidth / 2, 15, { align: 'center' })
        }

        // Calculate the portion of image to show on this page
        const sourceY = currentY / scale / 0.264583
        const sourceHeight = Math.min(
          pageContentHeight / scale / 0.264583,
          imgHeight - sourceY
        )

        if (sourceHeight > 0) {
          // Create temporary canvas for this page slice
          const tempCanvas = document.createElement('canvas')
          tempCanvas.width = imgWidth
          tempCanvas.height = sourceHeight
          const tempCtx = tempCanvas.getContext('2d')

          if (tempCtx) {
            tempCtx.drawImage(
              canvas,
              0,
              sourceY,
              imgWidth,
              sourceHeight,
              0,
              0,
              imgWidth,
              sourceHeight
            )
            const tempImgData = tempCanvas.toDataURL('image/jpeg', 0.8)

            const displayHeight = Math.min(
              pageContentHeight,
              scaledHeight - currentY
            )
            pdf.addImage(
              tempImgData,
              'JPEG',
              0,
              headerHeight,
              pdfWidth,
              displayHeight
            )
          }
        }

        currentY += pageContentHeight
        pageNumber++
      }

      pdf.save('profit-and-loss.pdf')
    } catch (error) {
      console.error('Error generating PDF:', error)
    }
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

  // const generateExcel = () => {
  //   exportToExcel(profitAndLoss, 'profit-and-loss')
  // }

  const handleFilterChange = (
    newStartDate: Date | undefined,
    newEndDate: Date | undefined,
    newCompanyId: string
  ) => {
    setStartDate(newStartDate)
    setEndDate(newEndDate)
    setCompanyId(newCompanyId)
  }

  // const fetchData = useCallback(async () => {
  //   if (startDate && endDate && companyId) {
  //     const response = await getProfitAndLoss({
  //       fromdate: startDate.toISOString().split('T')[0],
  //       enddate: endDate.toISOString().split('T')[0],
  //       companyId: companyId,
  //       token: token,
  //     })
  //     setProfitAndLoss(response.data || [])
  //   }
  // }, [startDate, endDate, companyId, token])
  const fetchData = useCallback(async () => {
  
      const response = await getCoaWithMapping(token)
      setProfitAndLoss(response.data || [])
      console.log('this income statement: ',response.data || []);
    
  }, [ token])

  useEffect(() => {
    const checkUserData = () => {
      const storedUserData = localStorage.getItem('currentUser')
      const storedToken = localStorage.getItem('authToken')

      if (!storedUserData || !storedToken) {
        router.push('/')
        return
      }
    }

    checkUserData()
    fetchData()
  }, [fetchData, router])

  return (
    
    <div>
      {/* <ProfitAndLossHeading
        generatePdf={generatePdf}
        // generateExcel={generateExcel}
        onFilterChange={handleFilterChange}
      /> */}
      <ProfitAndLossTableData targetRef={targetRef} data={profitAndLoss} />
    </div>
  )
}

export default ProfitAndLoss
