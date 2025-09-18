'use client'
import ProfitAndLossHeading from './profit-and-loss-heading'
import ProfitAndLossTableData from './profit-and-loss-table-data'
import React, { useState, useEffect, useCallback } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'
import saveAs from 'file-saver'
import { useRouter } from 'next/navigation'
import { getCoaWithMapping } from '@/api/level-api'
import { tokenAtom, useInitializeUser } from '@/utils/user'
import { useAtom } from 'jotai'
import { CoaPlMappingReport } from '@/utils/type'

const ProfitAndLoss = () => {
  useInitializeUser()
  const [token] = useAtom(tokenAtom)
  const router = useRouter()
  const targetRef = React.useRef<HTMLDivElement>(null)
  const [profitAndLoss, setProfitAndLoss] = useState<CoaPlMappingReport[]>([])
  const [selectedDocument, setSelectedDocument] =
    useState<string>('Income Statement')
  const [filteredData, setFilteredData] = useState<CoaPlMappingReport[]>([])

  const generatePdf = async () => {
    if (!targetRef.current) return

    try {
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

      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text(`${selectedDocument} Report`, pdfWidth / 2, 15, {
        align: 'center',
      })

      while (currentY < scaledHeight) {
        if (pageNumber > 1) {
          pdf.addPage()
          // Add header to new page
          pdf.setFontSize(16)
          pdf.setFont('helvetica', 'bold')
          pdf.text(`${selectedDocument} Report`, pdfWidth / 2, 15, {
            align: 'center',
          })
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

      pdf.save(`${selectedDocument.toLowerCase().replace(' ', '-')}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
    }
  }

  const exportToExcel = (data: CoaPlMappingReport[], fileName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(flattenData(data))
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, selectedDocument)
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    })
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    })
    saveAs(blob, `${fileName}.xlsx`)
  }

  const flattenData = (data: CoaPlMappingReport[]): any[] => {
    return data.map((item) => ({
      Label: item.Label,
      Balance: item.balance,
      Position: item.position,
      Document: item.document,
    }))
  }

  const generateExcel = () => {
    exportToExcel(
      filteredData,
      `${selectedDocument.toLowerCase().replace(' ', '-')}`
    )
  }

  const handleDocumentChange = (document: string) => {
    setSelectedDocument(document)
  }

  const fetchData = useCallback(async () => {
    const response = await getCoaWithMapping(token)
    setProfitAndLoss(response.data || [])
    console.log('this income statement: ', response.data || [])
  }, [token])

  useEffect(() => {
    fetchData()
  }, [fetchData, router, token])

  useEffect(() => {
    const filtered = profitAndLoss.filter(
      (item) => item.document === selectedDocument
    )
    setFilteredData(filtered)
  }, [profitAndLoss, selectedDocument])

  return (
    <div>
      <ProfitAndLossHeading
        generatePdf={generatePdf}
        generateExcel={generateExcel}
        onDocumentChange={handleDocumentChange}
        selectedDocument={selectedDocument}
        availableDocuments={[
          ...new Set(profitAndLoss.map((item) => item.document)),
        ]}
      />
      <ProfitAndLossTableData targetRef={targetRef} data={filteredData} />
    </div>
  )
}

export default ProfitAndLoss
