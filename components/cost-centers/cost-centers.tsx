'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusIcon } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type CostCenter = {
    id: string
    name: string
    type: 'Free' | 'Tax'
    active: boolean
    analysisTags: string[]
}

export default function CostCenterManagement() {
    const [costCenters, setCostCenters] = useState<CostCenter[]>([])
    const [open, setOpen] = useState(false)
    const [id, setId] = useState('')
    const [name, setName] = useState('')
    const [type, setType] = useState<'Free' | 'Tax'>('Free')
    const [active, setActive] = useState(true)
    const [analysisTags, setAnalysisTags] = useState<string[]>([])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const newCostCenter: CostCenter = { id, name, type, active, analysisTags }
        setCostCenters([...costCenters, newCostCenter])
        setOpen(false)
        resetForm()
    }

    const resetForm = () => {
        setId('')
        setName('')
        setType('Free')
        setActive(true)
        setAnalysisTags([])
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Cost Centers</h1>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusIcon className="mr-2 h-4 w-4" /> Add Cost Center
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add New Cost Center</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="cost-center-id">Cost Center ID</Label>
                                <Input
                                    id="cost-center-id"
                                    value={id}
                                    onChange={(e) => setId(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cost-center-name">Cost Center Name</Label>
                                <Input
                                    id="cost-center-name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <RadioGroup value={type} onValueChange={(value: 'Free' | 'Tax') => setType(value)}>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Free" id="free" />
                                        <Label htmlFor="free">Free</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Tax" id="tax" />
                                        <Label htmlFor="tax">Tax</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="active"
                                    checked={active}
                                    onCheckedChange={setActive}
                                />
                                <Label htmlFor="active">Active</Label>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="analysis-tags">Analysis Tags</Label>
                                <Select onValueChange={(value) => setAnalysisTags([...analysisTags, value])}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select tags..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="tag1">Tag 1</SelectItem>
                                        <SelectItem value="tag2">Tag 2</SelectItem>
                                        <SelectItem value="tag3">Tag 3</SelectItem>
                                        <SelectItem value="tag4">Tag 4</SelectItem>
                                        <SelectItem value="tag5">Tag 5</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit">Add Cost Center</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Active</TableHead>
                        <TableHead>Analysis Tags</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {costCenters.map((center) => (
                        <TableRow key={center.id}>
                            <TableCell>{center.id}</TableCell>
                            <TableCell>{center.name}</TableCell>
                            <TableCell>{center.type}</TableCell>
                            <TableCell>{center.active ? 'Yes' : 'No'}</TableCell>
                            <TableCell>{center.analysisTags.join(', ')}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}