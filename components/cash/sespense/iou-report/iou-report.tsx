
'use client'
import { getLoanDataByDate } from '@/api/iou-api'
import { Employee, IouRecordGetType, LocationData } from '@/utils/type'
import { tokenAtom, useInitializeUser } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'
import IouReportHeading from './iou-report-heading'
import IouReportList from './iou-report-list'
import { CompanyType } from '@/api/company-api'
import {
  getAllCompanies,
  getAllLocations,
  getEmployee,
} from '@/api/common-shared-api'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'
import saveAs from 'file-saver'

const IouReport = () => {
  useInitializeUser()
  const [token] = useAtom(tokenAtom)
  const router = useRouter()
  const targetRef = React.useRef<HTMLDivElement>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [loanDataByDate, setLoanDataByDate] = useState<IouRecordGetType[]>([])
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0] // default today
  })
  const [employeeData, setEmployeeData] = useState<Employee[]>([])
  const [companyData, setCompanyData] = useState<CompanyType[]>([])
  const [locationData, setLocationData] = useState<LocationData[]>([])

  // ---------- PDF export (hide .hide-in-pdf elements before capture) ----------
  const generatePdf = async () => {
    if (!targetRef.current) return

    // select all elements that should be hidden in the PDF
    const hideSelector = '.hide-in-pdf'
    const elementsToHide = Array.from(
      document.querySelectorAll<HTMLElement>(hideSelector)
    )

    // store previous inline styles to restore later
    const previousStyles = elementsToHide.map((el) => ({
      el,
      visibility: el.style.visibility,
      display: el.style.display,
      opacity: el.style.opacity,
    }))

    // hide them (use visibility to keep layout / spacing)
    elementsToHide.forEach((el) => {
      el.style.visibility = 'hidden'
      el.style.pointerEvents = 'none'
      el.style.opacity = '0'
    })

    try {
      const element = targetRef.current
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      })

      const imgData = canvas.toDataURL('image/jpeg', 0.9)
      const pdf = new jsPDF('p', 'mm', 'a4')

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height

      // Convert px to mm: 1 px ≈ 0.264583 mm
      const pxToMm = 0.264583
      const scale = pdfWidth / (imgWidth * pxToMm)
      const scaledHeight = imgHeight * pxToMm * scale

      const headerHeight = 30
      const pageContentHeight = pdfHeight - headerHeight - 10

      let currentY = 0
      let pageNumber = 1

      // draw headline + date on each page
      const drawHeader = (pageNum: number) => {
        pdf.setFontSize(16)
        pdf.setFont('helvetica', 'bold')
        pdf.text('IOU Report', pdfWidth / 2, 15, { align: 'center' })
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'normal')
        pdf.text(`Date: ${selectedDate}`, pdfWidth / 2, 22, { align: 'center' })
      }

      drawHeader(pageNumber)

      while (currentY < scaledHeight) {
        if (pageNumber > 1) {
          pdf.addPage()
          drawHeader(pageNumber)
        }

        const sourceY = currentY / scale / pxToMm
        const sourceHeight = Math.min(
          pageContentHeight / scale / pxToMm,
          imgHeight - sourceY
        )

        if (sourceHeight > 0) {
          const tempCanvas = document.createElement('canvas')
          tempCanvas.width = imgWidth
          tempCanvas.height = Math.ceil(sourceHeight)
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
            const tempImgData = tempCanvas.toDataURL('image/jpeg', 0.9)
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

      pdf.save(`iou-report-${selectedDate}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
    } finally {
      // restore inline styles
      previousStyles.forEach(({ el, visibility, display, opacity }) => {
        el.style.visibility = visibility
        el.style.display = display
        el.style.opacity = opacity
        el.style.pointerEvents = '' // clear pointerEvents override
      })
    }
  }

  // ---------- Excel export (unchanged) ----------
  const exportToExcel = (data: IouRecordGetType[], fileName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((item) => ({
        Employee: employeeData.find((e) => e.id === item.employeeId)
          ?.employeeName,
        Company: companyData.find((c) => c.companyId === item.companyId)
          ?.companyName,
        Location: locationData.find((l) => l.locationId === item.locationId)
          ?.address,
        Amount: item.amount,
        AdjustedAmount: item.adjustedAmount ?? '-',
        Status: item.status,
        DueDate: new Date(item.dueDate).toLocaleDateString(),
      }))
    )
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'IOU Report')
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    })
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    })
    saveAs(blob, `${fileName}.xlsx`)
  }

  const generateExcel = () => {
    exportToExcel(loanDataByDate, `iou-report-${selectedDate}`)
  }

  // Fetch Loan Data
  const fetchLoanDataByDate = useCallback(
    async (date: string) => {
      if (!token) return
      try {
        setIsLoading(true)
        const loansdataByDate = await getLoanDataByDate(token, date)

        if (loansdataByDate?.error?.status === 401) {
          router.push('/unauthorized-access')
          return
        } else if (loansdataByDate.error || !loansdataByDate.data) {
          console.error('Error fetching loans:', loansdataByDate.error)
          setLoanDataByDate([])
        } else {
          setLoanDataByDate(loansdataByDate.data)
        }
      } catch (err) {
        console.error(
          'Error:',
          err instanceof Error ? err.message : 'An error occurred'
        )
        setLoanDataByDate([])
      } finally {
        setIsLoading(false)
      }
    },
    [token, router]
  )

  // Fetch Employee Data
  const fetchEmployeeData = useCallback(async () => {
    if (!token) return
    const employees = await getEmployee(token)
    if (employees.data) {
      setEmployeeData(employees.data)
    } else {
      setEmployeeData([])
    }
  }, [token])

  // Fetch Company Data
  const fetchCompany = useCallback(async () => {
    if (!token) return
    const response = await getAllCompanies(token)
    setCompanyData(response.data || [])
  }, [token])

  // Fetch Location Data
  const fetchLocation = useCallback(async () => {
    if (!token) return
    const response = await getAllLocations(token)
    setLocationData(response.data ?? [])
  }, [token])

  useEffect(() => {
    fetchLoanDataByDate(selectedDate)
    fetchEmployeeData()
    fetchCompany()
    fetchLocation()
  }, [
    fetchLoanDataByDate,
    fetchEmployeeData,
    fetchCompany,
    fetchLocation,
    selectedDate,
    token,
  ])

  return (
    <div className="p-4">
      <IouReportHeading
        date={selectedDate}
        onDateChange={setSelectedDate}
        generatePdf={generatePdf}
        generateExcel={generateExcel}
      />
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <IouReportList
          targetRef={targetRef}
          data={loanDataByDate}
          employees={employeeData}
          companies={companyData}
          locations={locationData}
        />
      )}
    </div>
  )
}

export default IouReport
