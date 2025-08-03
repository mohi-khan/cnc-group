// 'use client'

// import type React from 'react'
// import { useState } from 'react'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { format } from 'date-fns'
// import { Trash2Icon, PlusIcon } from 'lucide-react'
// import { cn } from '@/lib/utils'
// import type { NewFdrValueUpdate } from '@/utils/type' // Using type import
// import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
// import { useAtom } from 'jotai'
// import { toast } from '@/hooks/use-toast'
// import { createFdrUpdate } from '@/api/fdr-value-update-api'

// const FdrValueUpdate = () => {
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   useInitializeUser()
//   const [userData] = useAtom(userDataAtom)
//   const [token] = useAtom(tokenAtom) // Accessing token from Jotai atom

//   // Initialize with one empty row
//   const [rows, setRows] = useState<(NewFdrValueUpdate & { id: string })[]>([
//     {
//       id: crypto.randomUUID(), // Client-side unique ID (string)
//       fdrNo: '',
//       newValue: 0,
//       updateDate: format(new Date(), 'yyyy-MM-dd'),
//       createdBy: userData?.userId || 0,
//     },
//   ])

//   // --- CONSOLE LOGS START ---
//   console.log('Current form rows state (on render):', rows)
//   // --- CONSOLE LOGS END ---

//   // Add a new row
//   const addRow = () => {
//     const newRow = {
//       id: crypto.randomUUID(), // Client-side unique ID (string)
//       fdrNo: '',
//       newValue: 0,
//       updateDate: format(new Date(), 'yyyy-MM-dd'),
//       createdBy: userData?.userId || 0,
//     }
//     setRows((prevRows) => {
//       const updatedRows = [...prevRows, newRow]
//       // --- CONSOLE LOGS START ---
//       console.log('Adding new row. New rows state:', updatedRows)
//       // --- CONSOLE LOGS END ---
//       return updatedRows
//     })
//   }

//   // Delete a row
//   const deleteRow = (id: string) => {
//     if (rows.length === 1) {
//       toast({
//         title: 'Cannot delete',
//         description: 'At least one row is required',
//         variant: 'destructive',
//       })
//       // --- CONSOLE LOGS START ---
//       console.log('Attempted to delete last row. Deletion prevented.')
//       // --- CONSOLE LOGS END ---
//       return
//     }
//     setRows((prevRows) => {
//       const updatedRows = prevRows.filter((row) => row.id !== id)
//       // --- CONSOLE LOGS START ---
//       console.log('Deleting row with ID:', id, 'New rows state:', updatedRows)
//       // --- CONSOLE LOGS END ---
//       return updatedRows
//     })
//   }

//   // Update a field in a specific row
//   const updateField = (
//     id: string,
//     field: keyof NewFdrValueUpdate,
//     value: any
//   ) => {
//     setRows(
//       rows.map((row) => {
//         if (row.id === id) {
//           const updatedRow = { ...row, [field]: value }
//           // --- CONSOLE LOGS START ---
//           console.log(
//             'Updating row ID:',
//             id,
//             'Field:',
//             field,
//             'New value:',
//             value,
//             'Updated row:',
//             updatedRow
//           )
//           // --- CONSOLE LOGS END ---
//           return updatedRow
//         }
//         return row
//       })
//     )
//   }

//   // Handle form submission
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     // --- CONSOLE LOGS START ---
//     console.log('Form submission initiated. Current rows to submit:', rows)
//     // --- CONSOLE LOGS END ---

//     // Validate form
//     const hasEmptyFields = rows.some((row) => !row.fdrNo || row.newValue <= 0)
//     if (hasEmptyFields) {
//       toast({
//         title: 'Validation Error',
//         description: 'Please fill all required fields',
//         variant: 'destructive',
//       })
//       // --- CONSOLE LOGS START ---
//       console.log('Validation failed: Empty fields detected.')
//       // --- CONSOLE LOGS END ---
//       return
//     }

//     setIsSubmitting(true)
//     // --- CONSOLE LOGS START ---
//     console.log('Setting isSubmitting to true.')
//     // --- CONSOLE LOGS END ---

//     try {
//       // Ensure token is available
//       if (!token) {
//         toast({
//           title: 'Authentication Error',
//           description: 'No authentication token found. Please log in.',
//           variant: 'destructive',
//         })
//         setIsSubmitting(false)
//         // --- CONSOLE LOGS START ---
//         console.error('Authentication token is missing.')
//         // --- CONSOLE LOGS END ---
//         return
//       }
//       // --- CONSOLE LOGS START ---
//       console.log(
//         'Using token (first 10 chars):',
//         token.substring(0, 10) + '...'
//       ) // Log token (partial for security)
//       // --- CONSOLE LOGS END ---

//       // Submit each row
//       for (const row of rows) {
//         const { id, ...rowData } = row // Destructure to remove client-side 'id'
//         // --- CONSOLE LOGS START ---
//         console.log(
//           'Preparing to send row data (excluding client-side ID):',
//           rowData
//         )
//         // --- CONSOLE LOGS END ---
//         await createFdrUpdate(rowData, token)
//         // --- CONSOLE LOGS START ---
//         console.log('Successfully sent row data for FDR No:', rowData.fdrNo)
//         // --- CONSOLE LOGS END ---
//       }

//       toast({
//         title: 'Success',
//         description: 'FDR values updated successfully',
//       })
//       // --- CONSOLE LOGS START ---
//       console.log('All FDR values updated successfully. Resetting form.')
//       // --- CONSOLE LOGS END ---

//       // Reset form after successful submission
//       setRows([
//         {
//           id: crypto.randomUUID(), // New client-side ID for the reset row
//           fdrNo: '',
//           newValue: 0,
//           updateDate: format(new Date(), 'yyyy-MM-dd'),
//           createdBy: userData?.userId || 0,
//         },
//       ])
//     } catch (error) {
//       toast({
//         title: 'Error',
//         description: 'Failed to update FDR values',
//         variant: 'destructive',
//       })
//       // --- CONSOLE LOGS START ---
//       console.error('Error during FDR value update:', error) // Log the error object
//       // --- CONSOLE LOGS END ---
//     } finally {
//       setIsSubmitting(false)
//       // --- CONSOLE LOGS START ---
//       console.log('Setting isSubmitting to false. Submission process finished.')
//       // --- CONSOLE LOGS END ---
//     }
//   }

//   return (
//     <div className="w-full p-4 ">
//       <h2 className="text-2xl font-bold mb-6 ml-4 mt-6">FDR Value Update</h2>
//      <div className='m-4 border-2 p-4 shadow-md'>
//          <form onSubmit={handleSubmit} className="space-y-6">
//         <div className="grid grid-cols-12 gap-4 font-medium text-sm mb-2 ">
//           <div className="col-span-3">FDR Number</div>
//           <div className="col-span-3">New Value</div>
//           <div className="col-span-4">Update Date</div>
          
//         </div>
//         {rows.map((row, index) => (
//           <div key={row.id} className="grid grid-cols-12 gap-4 items-center">
//             <div className="col-span-3">
//               <Input
//                 placeholder="FDR Number"
//                 value={row.fdrNo}
//                 onChange={(e) => updateField(row.id, 'fdrNo', e.target.value)}
//                 required
//               />
//             </div>
//             <div className="col-span-3">
//               <Input
//                 type="number"
//                 placeholder="New Value"
//                 value={row.newValue === 0 ? '' : row.newValue}
//                 onChange={(e) =>
//                   updateField(
//                     row.id,
//                     'newValue',
//                     Number.parseFloat(e.target.value) || 0
//                   )
//                 }
//                 required
//               />
//             </div>
//             {/* The original Popover/Calendar component was commented out, using native input type="date" */}
//             <div className="col-span-4">
//               <input
//                 type="date"
//                 className={cn(
//                   'w-full rounded border px-3 py-2 text-sm',
//                   !row.updateDate && 'text-muted-foreground'
//                 )}
//                 value={row.updateDate ?? ''}
//                 onChange={(e) =>
//                   updateField(row.id, 'updateDate', e.target.value)
//                 }
//               />
//             </div>
//             <div className="col-span-2 flex ">
//               <Button
//                 type="button"
//                 variant="ghost"
//                 size="icon"
//                 onClick={() => deleteRow(row.id)}
//               >
//                 <Trash2Icon className="h-4 w-4" />
//               </Button>
//             </div>
//           </div>
//         ))}
//         <div className="flex justify-between  ">
//           <Button
//             type="button"
//             variant="outline"
//             onClick={addRow}
//             className="flex items-center bg-transparent"
//           >
//             <PlusIcon className="h-4 w-4 mr-2" />
//             Add Row
//           </Button>
//           <div className='mr-10'>
//             <Button type="submit" disabled={isSubmitting}>
//             {isSubmitting ? 'Submitting...' : 'Submit'}
//           </Button>
//           </div>
//         </div>
//       </form>
//      </div>
//     </div>
//   )
// }

// export default FdrValueUpdate

"use client"

import type React from "react"
import { useState, useEffect } from "react" // Import useEffect
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { Trash2Icon, PlusIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { NewFdrValueUpdate, FdrGetType } from "@/utils/type" // Import FdrGetType
import { tokenAtom, useInitializeUser, userDataAtom } from "@/utils/user"
import { useAtom } from "jotai"
import { toast } from "@/hooks/use-toast"
import { createFdrUpdate } from "@/api/fdr-value-update-api"

import { CustomCombobox } from "@/utils/custom-combobox" // Import CustomCombobox
import { getFdrData } from "@/api/fdr-record-api"

const FdrValueUpdate = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom) // Accessing token from Jotai atom
  const [fdrOptions, setFdrOptions] = useState<FdrGetType[]>([]) // State for FDR options

  // Fetch FDR data when component mounts or token changes
  useEffect(() => {
    const fetchFDRs = async () => {
      if (token) {
        try {
          const data = await getFdrData(token)
          setFdrOptions(data.data ? data.data : [])
          console.log("Fetched FDR Options:", data) // Debugging log
        } catch (error) {
          console.error("Error fetching FDR data:", error)
          toast({
            title: "Error",
            description: "Failed to load FDR numbers.",
            variant: "destructive",
          })
        }
      }
    }
    fetchFDRs()
  }, [token]) // Re-fetch if token changes

  // Initialize with one empty row
  const [rows, setRows] = useState<(NewFdrValueUpdate & { id: string })[]>([
    {
      id: crypto.randomUUID(), // Client-side unique ID (string)
      fdrNo: "",
      newValue: 0,
      updateDate: format(new Date(), "yyyy-MM-dd"),
      createdBy: userData?.userId || 0,
    },
  ])

  // --- CONSOLE LOGS START ---
  console.log("Current form rows state (on render):", rows)
  // --- CONSOLE LOGS END ---

  // Add a new row
  const addRow = () => {
    const newRow = {
      id: crypto.randomUUID(), // Client-side unique ID (string)
      fdrNo: "",
      newValue: 0,
      updateDate: format(new Date(), "yyyy-MM-dd"),
      createdBy: userData?.userId || 0,
    }
    setRows((prevRows) => {
      const updatedRows = [...prevRows, newRow]
      // --- CONSOLE LOGS START ---
      console.log("Adding new row. New rows state:", updatedRows)
      // --- CONSOLE LOGS END ---
      return updatedRows
    })
  }

  // Delete a row
  const deleteRow = (id: string) => {
    if (rows.length === 1) {
      toast({
        title: "Cannot delete",
        description: "At least one row is required",
        variant: "destructive",
      })
      // --- CONSOLE LOGS START ---
      console.log("Attempted to delete last row. Deletion prevented.")
      // --- CONSOLE LOGS END ---
      return
    }
    setRows((prevRows) => {
      const updatedRows = prevRows.filter((row) => row.id !== id)
      // --- CONSOLE LOGS START ---
      console.log("Deleting row with ID:", id, "New rows state:", updatedRows)
      // --- CONSOLE LOGS END ---
      return updatedRows
    })
  }

  // Update a field in a specific row
  const updateField = (id: string, field: keyof NewFdrValueUpdate, value: any) => {
    setRows(
      rows.map((row) => {
        if (row.id === id) {
          const updatedRow = { ...row, [field]: value }
          // --- CONSOLE LOGS START ---
          console.log("Updating row ID:", id, "Field:", field, "New value:", value, "Updated row:", updatedRow)
          // --- CONSOLE LOGS END ---
          return updatedRow
        }
        return row
      }),
    )
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // --- CONSOLE LOGS START ---
    console.log("Form submission initiated. Current rows to submit:", rows)
    // --- CONSOLE LOGS END ---

    // Validate form
    const hasEmptyFields = rows.some((row) => !row.fdrNo || row.newValue <= 0)
    if (hasEmptyFields) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields",
        variant: "destructive",
      })
      // --- CONSOLE LOGS START ---
      console.log("Validation failed: Empty fields detected.")
      // --- CONSOLE LOGS END ---
      return
    }

    setIsSubmitting(true)
    // --- CONSOLE LOGS START ---
    console.log("Setting isSubmitting to true.")
    // --- CONSOLE LOGS END ---

    try {
      // Ensure token is available
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "No authentication token found. Please log in.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        // --- CONSOLE LOGS START ---
        console.error("Authentication token is missing.")
        // --- CONSOLE LOGS END ---
        return
      }
      // --- CONSOLE LOGS START ---
      console.log("Using token (first 10 chars):", token.substring(0, 10) + "...") // Log token (partial for security)
      // --- CONSOLE LOGS END ---

      // Submit each row
      for (const row of rows) {
        const { id, ...rowData } = row // Destructure to remove client-side 'id'
        // --- CONSOLE LOGS START ---
        console.log("Preparing to send row data (excluding client-side ID):", rowData)
        // --- CONSOLE LOGS END ---
        await createFdrUpdate(rowData, token)
        // --- CONSOLE LOGS START ---
        console.log("Successfully sent row data for FDR No:", rowData.fdrNo)
        // --- CONSOLE LOGS END ---
      }

      toast({
        title: "Success",
        description: "FDR values updated successfully",
      })
      // --- CONSOLE LOGS START ---
      console.log("All FDR values updated successfully. Resetting form.")
      // --- CONSOLE LOGS END ---

      // Reset form after successful submission
      setRows([
        {
          id: crypto.randomUUID(), // New client-side ID for the reset row
          fdrNo: "",
          newValue: 0,
          updateDate: format(new Date(), "yyyy-MM-dd"),
          createdBy: userData?.userId || 0,
        },
      ])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update FDR values",
        variant: "destructive",
      })
      // --- CONSOLE LOGS START ---
      console.error("Error during FDR value update:", error) // Log the error object
      // --- CONSOLE LOGS END ---
    } finally {
      setIsSubmitting(false)
      // --- CONSOLE LOGS START ---
      console.log("Setting isSubmitting to false. Submission process finished.")
      // --- CONSOLE LOGS END ---
    }
  }

  return (
    <div className="w-full p-4 ">
      <h2 className="text-2xl font-bold mb-6 ml-4 mt-6">FDR Value Update</h2>
      <div className="m-4 border-2 p-4 shadow-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-12 gap-4 font-medium text-sm mb-2 ">
            <div className="col-span-3">FDR Number</div>
            <div className="col-span-3">New Value</div>
            <div className="col-span-4">Update Date</div>
            <div className="col-span-2"></div> {/* Empty div for alignment */}
          </div>
          {rows.map((row, index) => (
            <div key={row.id} className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-3">
                {/* Replaced Input with CustomCombobox */}
                <CustomCombobox
                  items={fdrOptions.map((fdr) => ({
                    id: fdr.fdrNo, // Use fdrNo as the ID for the combobox item
                    name: fdr.fdrNo, // Use fdrNo as the display name
                  }))}
                  value={
                    row.fdrNo
                      ? {
                          id: row.fdrNo,
                          name: row.fdrNo,
                        }
                      : null
                  }
                  onChange={(selectedItem) => updateField(row.id, "fdrNo", selectedItem ? selectedItem.id : "")}
                  placeholder="Select FDR Number"
                />
              </div>
              <div className="col-span-3">
                <Input
                  type="number"
                  placeholder="New Value"
                  value={row.newValue === 0 ? "" : row.newValue}
                  onChange={(e) => updateField(row.id, "newValue", Number.parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
              <div className="col-span-4">
                <input
                  type="date"
                  className={cn("w-full rounded border px-3 py-2 text-sm", !row.updateDate && "text-muted-foreground")}
                  value={row.updateDate ?? ""}
                  onChange={(e) => updateField(row.id, "updateDate", e.target.value)}
                />
              </div>
              <div className="col-span-2 flex ">
                <Button type="button" variant="ghost" size="icon" onClick={() => deleteRow(row.id)}>
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <div className="flex justify-between ">
            <Button type="button" variant="outline" onClick={addRow} className="flex items-center bg-transparent">
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Row
            </Button>
            <div className="mr-10">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FdrValueUpdate
