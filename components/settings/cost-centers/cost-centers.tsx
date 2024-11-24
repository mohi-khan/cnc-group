'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { PlusIcon } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { costCenterSchema, createCostCenters, getAllCostCenters, CostCenter } from './cost-centers-api'

export default function CostCenterManagement() {
    const [costCenters, setCostCenters] = useState<CostCenter[]>([])
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [selectedCostCenter, setSelectedCostCenter] = useState<CostCenter | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null)

    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        fetchCostCenters();
    }, []);

    const fetchCostCenters = async () => {
        setIsLoading(true);
        try {
            const data = await getAllCostCenters();
            setCostCenters(data);
        } catch (error) {
            console.error("Error fetching cost centers:", error);
            setFeedback({
                type: 'error',
                message: error instanceof Error ? error.message : 'Failed to fetch cost centers',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeactivate = (id: string) => {
        setCostCenters(costCenters.map(center =>
            center.id === id ? { ...center, active: !center.active } : center
        ))
    }

    const handleEdit = (center: CostCenter) => {
        setSelectedCostCenter(center)
        setIsEditDialogOpen(true)
    }

    const CostCenterForm = () => {
        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            setIsLoading(true)
            setFeedback(null)

            try {
                const formData = new FormData(formRef.current!);
                const newCostCenter = {
                    costCenterName: formData.get('name') as string,
                    costCenterDescription: formData.get('description') as string,
                    currencyCode: formData.get('currencyCode') as 'BDT' | 'USD' | 'EUR' | 'GBP',
                    budget: '0', // Initialize as string to match API
                    active: true,
                    companyNames: [],
                    actual: 0
                };

                if (isEditDialogOpen) {
                    // ... (edit logic remains the same)
                } else {
                    const result = await createCostCenters([newCostCenter]);
                    await fetchCostCenters();
                    setIsAddDialogOpen(false);
                }

                setSelectedCostCenter(null);
                setFeedback({
                    type: 'success',
                    message: `Cost center ${isEditDialogOpen ? 'updated' : 'created'} successfully`,
                });
            } catch (error) {
                console.error("Error saving cost center:", error);
                setFeedback({
                    type: 'error',
                    message: error instanceof Error ? error.message : 'Failed to save cost center',
                });
            } finally {
                setIsLoading(false);
            }
        };

        return (
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="cost-center-name" className="text-right">
                        Cost Center Name
                    </Label>
                    <Input
                        id="cost-center-name"
                        name="name"
                        defaultValue={selectedCostCenter?.name}
                        className="col-span-3"
                        required
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="cost-center-description" className="text-right">
                        Description
                    </Label>
                    <Input
                        id="cost-center-description"
                        name="description"
                        defaultValue={selectedCostCenter?.description}
                        className="col-span-3"
                        required
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="currency-code" className="text-right">
                        Currency Code
                    </Label>
                    <Select name="currencyCode" defaultValue={selectedCostCenter?.currencyCode || 'BDT'}>
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select currency code" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="BDT">BDT</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => isEditDialogOpen ? setIsEditDialogOpen(false) : setIsAddDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Saving...' : isEditDialogOpen ? 'Update' : 'Add'} Cost Center
                    </Button>
                </div>
            </form>
        )
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Cost Centers</h1>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                    <PlusIcon className="mr-2 h-4 w-4" /> Add Cost Center
                </Button>
            </div>

            {feedback && (
                <Alert variant={feedback.type === 'success' ? 'default' : 'destructive'} className="mb-6">
                    <AlertTitle>{feedback.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
                    <AlertDescription>{feedback.message}</AlertDescription>
                </Alert>
            )}

            {isLoading ? (
                <div>Loading cost centers...</div>
            ) : (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Id</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Currency Code</TableHead>
                                <TableHead>Active</TableHead>
                                <TableHead>Company Names</TableHead>
                                <TableHead>Budget</TableHead>
                                <TableHead>Actual</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {costCenters.map((center) => (
                                <TableRow key={center.costCenterId}>
                                    <TableCell>{center.costCenterId}</TableCell>
                                    <TableCell>{center.costCenterName}</TableCell>
                                    <TableCell>{center.costCenterDescription}</TableCell>
                                    <TableCell>{center.currencyCode}</TableCell>
                                    <TableCell>{center.active ? 'Yes' : 'No'}</TableCell>
                                    <TableCell>{center.companyNames?.join(', ')}</TableCell>
                                    <TableCell>{Number(center.budget).toLocaleString()}</TableCell>
                                    <TableCell>{center.actual?.toLocaleString()}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleEdit(center)}
                                            className="mr-2"
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDeactivate(center.costCenterId)}
                                        >
                                            {center.active ? 'Deactivate' : 'Activate'}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add New Cost Center</DialogTitle>
                    </DialogHeader>
                    <CostCenterForm />
                </DialogContent>
            </Dialog>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Cost Center</DialogTitle>
                    </DialogHeader>
                    <CostCenterForm />
                </DialogContent>
            </Dialog>
        </div>
    )
}

