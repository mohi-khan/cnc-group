'use client'

import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Plus, Trash2, Edit, Check } from 'lucide-react'
import * as z from 'zod'

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
} from "@/components/ui/select"
import { useToast } from '@/hooks/use-toast'

const numberSeriesSchema = z.object({
  id: z.number().optional(),
  companyId: z.number().int().positive(),
  locationId: z.number().int().positive(),
  voucherType: z.string().min(1, "Voucher type is required").max(50),
  financialYear: z.string().min(1, "Financial year is required").max(10),
  seriesFormat: z.string().min(1, "Series format is required").max(255),
  startingNumber: z.number().int().positive("Starting number must be positive"),
  endingNumber: z.number().int().positive("Ending number must be positive"),
}).refine((data) => data.endingNumber >= data.startingNumber, {
  message: "Ending number must be greater than or equal to starting number",
  path: ["endingNumber"],
});

type NumberSeries = z.infer<typeof numberSeriesSchema>

const companies = [
  { id: 1, name: 'Company A' },
  { id: 2, name: 'Company B' },
];

const locations = [
  { id: 1, name: 'Location X' },
  { id: 2, name: 'Location Y' },
];

const voucherTypes = [
  'Invoice',
  'Receipt',
  'Credit Note',
  'Debit Note',
  'Purchase Order',
];

export function NumberSeries() {
  const [series, setSeries] = React.useState<NumberSeries[]>([])
  const [editingId, setEditingId] = React.useState<number | null>(null)
  const { toast } = useToast()

  const form = useForm<NumberSeries>({
    resolver: zodResolver(numberSeriesSchema),
    defaultValues: {
      companyId: 1,
      locationId: 1,
      voucherType: "",
      financialYear: "",
      seriesFormat: "",
      startingNumber: 1,
      endingNumber: 9999,
    },
  })

  const editForm = useForm<NumberSeries>({
    resolver: zodResolver(numberSeriesSchema),
  })

  React.useEffect(() => {
    // Simulating fetching data from an API
    const fetchedSeries = [
      {
        id: 1,
        companyId: 1,
        locationId: 1,
        voucherType: 'Invoice',
        financialYear: '2024',
        seriesFormat: 'INV-{0000}',
        startingNumber: 1,
        endingNumber: 1000,
      },
      {
        id: 2,
        companyId: 2,
        locationId: 2,
        voucherType: 'Receipt',
        financialYear: '2024',
        seriesFormat: 'REC-{000}',
        startingNumber: 1,
        endingNumber: 1000,
      },
    ]
    setSeries(fetchedSeries)
  }, [])

  const onSubmit = (values: NumberSeries) => {
    if (values.endingNumber < values.startingNumber) {
      toast({
        title: "Error",
        description: "Ending number must be greater than or equal to starting number",
        variant: "destructive",
      });
      return;
    }
    setSeries([...series, { ...values, id: Date.now() }]);
    form.reset();
    toast({
      title: "Success",
      description: "Number series added successfully",
    });
  };

  const handleDelete = (id: number) => {
    setSeries(series.filter((s) => s.id !== id));
    toast({
      title: "Success",
      description: "Number series deleted successfully",
    });
  };

  const handleEdit = (e: React.MouseEvent, record: NumberSeries) => {
    e.preventDefault();
    setEditingId(record.id);
    editForm.reset(record);
  };

  const handleUpdate = (e: React.MouseEvent) => {
    e.preventDefault();
    const values = editForm.getValues();
    if (values.endingNumber < values.startingNumber) {
      toast({
        title: "Error",
        description: "Ending number must be greater than or equal to starting number",
        variant: "destructive",
      });
      return;
    }
    setSeries(series.map(s => s.id === editingId ? { ...values, id: editingId } : s));
    setEditingId(null);
    toast({
      title: "Success",
      description: "Number series updated successfully",
    });
  };

  const renderTableCell = (id: number, name: keyof NumberSeries) => {
    if (id === editingId) {
      if (name === 'companyId' || name === 'locationId') {
        const options = name === 'companyId' ? companies : locations;
        return (
          <FormField
            control={editForm.control}
            name={name}
            render={({ field }) => (
              <FormItem>
                <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {options.map((option) => (
                      <SelectItem key={option.id} value={option.id.toString()}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      }
      if (name === 'voucherType') {
        return (
          <FormField
            control={editForm.control}
            name={name}
            render={({ field }) => (
              <FormItem>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
        );
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
                    const value = name === 'startingNumber' || name === 'endingNumber'
                      ? parseInt(e.target.value)
                      : e.target.value;
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }
    if (name === 'companyId') {
      return companies.find(c => c.id === series.find(s => s.id === id)?.[name])?.name;
    }
    if (name === 'locationId') {
      return locations.find(l => l.id === series.find(s => s.id === id)?.[name])?.name;
    }
    return series.find(s => s.id === id)?.[name];
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
                {series.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{renderTableCell(record.id, 'companyId')}</TableCell>
                    <TableCell>{renderTableCell(record.id, 'locationId')}</TableCell>
                    <TableCell>{renderTableCell(record.id, 'voucherType')}</TableCell>
                    <TableCell>{renderTableCell(record.id, 'financialYear')}</TableCell>
                    <TableCell>{renderTableCell(record.id, 'seriesFormat')}</TableCell>
                    <TableCell>{renderTableCell(record.id, 'startingNumber')}</TableCell>
                    <TableCell>{renderTableCell(record.id, 'endingNumber')}</TableCell>
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
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select company" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {companies.map((company) => (
                                <SelectItem key={company.id} value={company.id.toString()}>
                                  {company.name}
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
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select location" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {locations.map((location) => (
                                <SelectItem key={location.id} value={location.id.toString()}>
                                  {location.name}
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                            <Input placeholder="Financial Year" {...field} />
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
                            <Input type="number" placeholder="Starting Number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
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
                            <Input type="number" placeholder="Ending Number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
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

export default NumberSeries;

