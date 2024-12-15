'use client'

import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Plus, Trash2, Edit, Check } from 'lucide-react'
import * as z from 'zod'
import {
  getAllNumberSeries,
  createNumberSeries,
  updateNumberSeries,
  deleteNumberSeries,
  NumberSeries as NumberSeriesType,
  getAllCompanies,
  getAllLocations,
} from '../../../api/number-series-api'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Company, Location } from '@/utils/type'

const numberSeriesSchema = z
  .object({
    id: z.number().optional(),
    companyId: z
      .union([z.string(), z.number()])
      .transform((val) => Number(val)),
    locationId: z
      .union([z.string(), z.number()])
      .transform((val) => Number(val)),
    voucherType: z.string().min(1, 'Voucher type is required').max(50),
    financialYear: z
      .union([z.string(), z.number()])
      .transform((val) => Number(val)),
    seriesFormat: z.string().min(1, 'Series format is required').max(255),
    startingNumber: z
      .union([z.string(), z.number()])
      .transform((val) => Number(val)),
    endingNumber: z
      .union([z.string(), z.number()])
      .transform((val) => Number(val)),
    createdBy: z.number().optional(),
    currentNumber: z.number().optional(),
  })
  .refine((data) => data.endingNumber >= data.startingNumber, {
    message: 'Ending number must be greater than or equal to starting number',
    path: ['endingNumber'],
  })

type NumberSeries = NumberSeriesType

const voucherTypes = [
  'Cash Voucher',
  'Bank Voucher',
  'Journal Voucher',
  'Contra Voucher',
]

export function NumberSeries() {
  const [series, setSeries] = React.useState<NumberSeries[]>([])
  const [companies, setCompanies] = React.useState<Company[]>([])
  const [locations, setLocations] = React.useState<Location[]>([])
  const [editingId, setEditingId] = React.useState<number | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isError, setIsError] = React.useState(false)
  const { toast } = useToast()

  const form = useForm<NumberSeries>({
    resolver: zodResolver(numberSeriesSchema),
    defaultValues: {
      companyId: undefined,
      locationId: undefined,
      voucherType: '',
      financialYear: undefined,
      seriesFormat: '',
      startingNumber: 1,
      endingNumber: 9,
      createdBy: 60,
      currentNumber: 1,
    },
  })

  const editForm = useForm<NumberSeries>({
    resolver: zodResolver(numberSeriesSchema),
  })

  React.useEffect(() => {
    fetchNumberSeries()
    fetchCompanies()
    fetchAllLocations()
  }, [])

  const fetchNumberSeries = async () => {
    setIsLoading(true)
    setIsError(false)
    const response = await getAllNumberSeries()
    console.log('Fetched number series:', response.data)
    if (response.error || !response.data) {
      console.error('Error fetching number series:', response.error)
      toast({
        title: 'Error',
        description: response.error?.message || 'Failed to show number series',
      })
      setIsError(true)
    } else {
      setSeries(response.data)
    }
    setIsLoading(false)
  }

  const fetchCompanies = async () => {
    const data = await getAllCompanies()
    console.log('Fetched companies:', data.data)
    if (data.error || !data.data) {
      console.error('Error getting companies:', data.error)
      toast({
        title: 'Error',
        description: data.error?.message || 'Failed to get companies',
      })
    } else {
      setCompanies(data.data)
    }
  }

  async function fetchAllLocations() {
    const response = await getAllLocations()
    console.log('Fetched locations:', response.data)

    if (response.error || !response.data) {
      console.error('Error getting locations:', response.error)
      toast({
        title: 'Error',
        description: response.error?.message || 'Failed to get locations',
      })
    } else {
      setLocations(response.data.data)
    }
  }

  const onSubmit = async (values: NumberSeriesType) => {
    console.log('Form values before formatting:', values)
    // Ensure all numeric fields are properly converted to numbers
    const formattedValues = {
      ...values,
      financialYear: Number(values.financialYear),
      startingNumber: Number(values.startingNumber),
      endingNumber: Number(values.endingNumber),
      companyId: Number(values.companyId),
      locationId: Number(values.locationId),
      createdBy: 60, // Add createdBy with a fixed value of 60
      currentNumber: Number(values.startingNumber),
    }
    console.log('Values being sent to the backend:', formattedValues);
    console.log('Formatted values to be submitted:', formattedValues)

    if (formattedValues.endingNumber < formattedValues.startingNumber) {
      toast({
        title: 'Error',
        description:
          'Ending number must be greater than or equal to starting number',
        variant: 'destructive',
      })
      return
    }

    try {
      const response = await createNumberSeries(formattedValues)
      console.log('API response:', response)
      if (response.error) {
        throw new Error(
          response.error.message || 'Failed to create number series'
        )
      }
      fetchNumberSeries()
      form.reset()
      toast({
        title: 'Success',
        description: 'Number series added successfully',
      })
    } catch (error) {
      console.error('Error creating number series:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to create number series',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteNumberSeries(id)
      fetchNumberSeries()
      toast({
        title: 'Success',
        description: 'Number series deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting number series:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete number series',
        variant: 'destructive',
      })
    }
  }

  const handleEdit = (e: React.MouseEvent, record: NumberSeries) => {
    e.preventDefault()
    setEditingId(record.id)
    editForm.reset(record)
  }

  const handleUpdate = async (e: React.MouseEvent) => {
    e.preventDefault()
    const values = editForm.getValues()
    console.log('Update values:', values)
    if (values.endingNumber < values.startingNumber) {
      toast({
        title: 'Error',
        description:
          'Ending number must be greater than or equal to starting number',
        variant: 'destructive',
      })
      return
    }
    try {
      const response = await updateNumberSeries(values)
      console.log('Update response:', response)
      if (response.error) {
        throw new Error(
          response.error.message || 'Failed to update number series'
        )
      }
      fetchNumberSeries()
      setEditingId(null)
      toast({
        title: 'Success',
        description: 'Number series updated successfully',
      })
    } catch (error) {
      console.error('Error updating number series:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to update number series',
        variant: 'destructive',
      })
    }
  }

  const renderTableCell = (record: NumberSeries, name: keyof NumberSeries) => {
    if (record.id === editingId) {
      if (name === 'companyId' || name === 'locationId') {
        const options = name === 'companyId' ? companies : locations
        return (
          <FormField
            control={editForm.control}
            name={name}
            render={({ field }) => (
              <FormItem>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          name === 'companyId'
                            ? 'Select Company'
                            : 'Select Location'
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {options.map((option) => (
                      <SelectItem
                        key={option.companyId}
                        value={option.id.toString()}
                      >
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )
      }
      if (name === 'voucherType') {
        return (
          <FormField
            control={editForm.control}
            name={name}
            render={({ field }) => (
              <FormItem>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {voucherTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )
      }
      return (
        <FormField
          control={editForm.control}
          name={name}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) => {
                    const value =
                      name === 'startingNumber' ||
                      name === 'endingNumber' ||
                      name === 'financialYear'
                        ? parseInt(e.target.value)
                        : e.target.value
                    field.onChange(value)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )
    }
    if (name === 'companyId') {
      return companies.find((c) => c.companyId === record[name])?.companyName
    }
    if (name === 'locationId') {
      return (
        locations.find((l) => l.locationId === record[name])?.address || 'N/A'
      )
    }
    return record[name]
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Number Series</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Voucher Type</TableHead>
                  <TableHead>Financial Year</TableHead>
                  <TableHead>Series Format</TableHead>
                  <TableHead>Starting Number</TableHead>
                  <TableHead>Ending Number</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                )}
                {isError && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      Error fetching number series
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading &&
                  !isError &&
                  series.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        {renderTableCell(record, 'companyId')}
                      </TableCell>
                      <TableCell>
                        {renderTableCell(record, 'locationId')}
                      </TableCell>
                      <TableCell>
                        {renderTableCell(record, 'voucherType')}
                      </TableCell>
                      <TableCell>
                        {renderTableCell(record, 'financialYear')}
                      </TableCell>
                      <TableCell>
                        {renderTableCell(record, 'seriesFormat')}
                      </TableCell>
                      <TableCell>
                        {renderTableCell(record, 'startingNumber')}
                      </TableCell>
                      <TableCell>
                        {renderTableCell(record, 'endingNumber')}
                      </TableCell>
                      <TableCell className="flex gap-3 justify-end">
                        {editingId === record.id ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => handleUpdate(e)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => handleEdit(e, record)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(record.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                <TableRow>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name="companyId"
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(parseInt(value))
                            }
                            value={field.value?.toString()}
                            defaultValue={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Company" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {companies.map((company) => (
                                <SelectItem
                                  key={company.companyId}
                                  value={company.companyId.toString()}
                                >
                                  {company.companyName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name="locationId"
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(parseInt(value))
                            }
                            value={field.value?.toString()}
                            defaultValue={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Location" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {locations.map((location) => (
                                <SelectItem
                                  key={location.locationId}
                                  value={location.locationId?.toString()}
                                >
                                  {location.address}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name="voucherType"
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select voucher type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {voucherTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name="financialYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Financial Year"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name="seriesFormat"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Series Format" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name="startingNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Starting Number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name="endingNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Ending Number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="submit"
                      variant="default"
                      className="bg-black hover:bg-black/90"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default NumberSeries

