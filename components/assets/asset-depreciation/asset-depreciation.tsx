"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createAssetDepreciationSchema } from "@/utils/type"
import { createAssetDepreciation, getAllCompanies, previewAssetDepreciation } from "@/api/asset-depreciation-api"
import { toast } from "@/hooks/use-toast"
import { CustomCombobox } from "@/utils/custom-combobox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/utils/format"

// Use the imported schema instead of defining a new one
type FormValues = z.infer<typeof createAssetDepreciationSchema>

export default function AssetDepreciation() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [companies, setCompanies] = useState<any[]>([])
  const [previewData, setPreviewData] = useState<any[] | null>(null)
  const [formData, setFormData] = useState<FormValues | null>(null)

  // Initialize the form with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(createAssetDepreciationSchema),
    defaultValues: {
      company_id: undefined, // Changed from empty string to undefined for number type
      depreciation_date: "",
    },
  })

  // Handle preview request
  const onPreview = async (data: FormValues) => {
    setIsLoading(true)
    setPreviewData(null) // Clear any existing preview data

    try {
      console.log("Calling preview API with data:", data)

      // Make sure we're calling the preview API, not the create API
      const response = await previewAssetDepreciation({
        company_id: data.company_id,
        depreciation_date: data.depreciation_date,
      })

    //   console.log("Preview API response:", response.data.data.schedules)

      if (response.error || !response.data) {
        throw new Error(response.error?.message || "Failed to preview depreciation schedule")
      }

      // Extract the schedules array from the response based on the structure you provided
      const schedules = response.data.data.schedules || []
      console.log("Setting preview data:", schedules)

      setPreviewData(schedules)
      setFormData(data) // Store the form data for later submission

      toast({
        title: "Preview Generated",
        description: "Review the depreciation schedule below before submitting",
      })
    } catch (error) {
      console.error("Error previewing asset depreciation:", error)
      toast({
        title: "Error",
        description: "Failed to preview asset depreciation schedule",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle final submission to database
  const onSubmit = async () => {
    if (!formData) return

    setIsSubmitting(true)
    try {
      const response = await createAssetDepreciation({
        company_id: formData.company_id,
        depreciation_date: formData.depreciation_date,
      })

      if (response.error) {
        throw new Error(response.error.message || "Failed to create depreciation schedule")
      }

      toast({
        title: "Success",
        description: "Asset depreciation schedule created successfully",
      })

      // Reset the form and preview data after successful submission
      form.reset()
      setPreviewData(null)
      setFormData(null)
    } catch (error) {
      console.error("Error creating asset depreciation:", error)
      toast({
        title: "Error",
        description: "Failed to create asset depreciation schedule",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function fetchAllCompanies() {
    try {
      const fetchedCompanies = await getAllCompanies()

      if (fetchedCompanies.error || !fetchedCompanies.data) {
        console.error("Error getting companies:", fetchedCompanies.error)
        toast({
          title: "Error",
          description: fetchedCompanies.error?.message || "Failed to get companies",
          variant: "destructive",
        })
      } else {
        setCompanies(fetchedCompanies.data)
      }
    } catch (error) {
      console.error("Error fetching companies:", error)
      toast({
        title: "Error",
        description: "Failed to fetch companies",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchAllCompanies()
    // Empty dependency array ensures this only runs once on component mount
  }, [])

  // Function to format date for display
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-8 w-full max-w-4xl mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>Asset Depreciation</CardTitle>
          <CardDescription>Create a new asset depreciation schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                form.handleSubmit(onPreview)(e)
              }}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="company_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <CustomCombobox
                        items={companies.map((company) => {
                          return {
                            id: company.companyId?.toString() || company.id?.toString() || "",
                            name: company.companyName || company.name || "Unnamed Company",
                          }
                        })}
                        value={
                          field.value
                            ? {
                                id: field.value.toString(),
                                name:
                                  companies.find((c) => (c.companyId || c.id) === field.value)?.companyName ||
                                  companies.find((c) => (c.companyId || c.id) === field.value)?.name ||
                                  "",
                              }
                            : null
                        }
                        onChange={(value) => field.onChange(value ? Number.parseInt(value.id, 10) : undefined)}
                        placeholder="Select company"
                      />
                    </FormControl>
                    <FormDescription>Select the company for this depreciation schedule</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="depreciation_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Depreciation Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="w-full" />
                    </FormControl>
                    <FormDescription>Select the date for the depreciation schedule</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Change the button to explicitly call onPreview instead of submitting the form */}
              <Button type="button" className="w-full" disabled={isLoading} onClick={form.handleSubmit(onPreview)}>
                {isLoading ? "Generating Preview..." : "Run Depreciation Schedule"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Preview Data Table */}
      {previewData && previewData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Depreciation Schedule Preview</CardTitle>
            <CardDescription>Review the calculated depreciation schedule before submitting</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset ID</TableHead>
                    <TableHead>Depreciation Method</TableHead>
                    <TableHead>Depreciation Date</TableHead>
                    <TableHead className="text-right">Depreciation Amount</TableHead>
                    <TableHead className="text-right">Accumulated Depreciation</TableHead>
                    <TableHead className="text-right">Remaining Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.asset_id}</TableCell>
                      <TableCell>{item.depriciation_method || "N/A"}</TableCell>
                      <TableCell>{formatDate(item.depreciation_date)}</TableCell>
                      <TableCell className="text-right">
                        {typeof formatCurrency === "function"
                          ? formatCurrency(Number.parseFloat(item.depreciation_amount))
                          : `$${Number.parseFloat(item.depreciation_amount).toFixed(2)}`}
                      </TableCell>
                      <TableCell className="text-right">
                        {typeof formatCurrency === "function"
                          ? formatCurrency(Number.parseFloat(item.accumulated_depreciation))
                          : `$${Number.parseFloat(item.accumulated_depreciation).toFixed(2)}`}
                      </TableCell>
                      <TableCell className="text-right">
                        {typeof formatCurrency === "function"
                          ? formatCurrency(Number.parseFloat(item.remaining_value))
                          : `$${Number.parseFloat(item.remaining_value).toFixed(2)}`}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={onSubmit} disabled={isSubmitting} className="w-full md:w-auto">
                {isSubmitting ? "Saving..." : "Save Depreciation"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No data message */}
      {previewData && previewData.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-6">
              <p className="text-muted-foreground">No depreciation schedules to generate for the selected criteria.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
