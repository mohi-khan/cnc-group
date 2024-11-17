'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { PlusIcon, Edit2Icon, PowerIcon } from 'lucide-react'
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

const dummyData: CostCenter[] = [
    { id: 'CC001', name: 'Marketing', type: 'Free', active: true, analysisTags: ['tag1', 'tag3'] },
    { id: 'CC002', name: 'Sales', type: 'Tax', active: true, analysisTags: ['tag2', 'tag4'] },
    { id: 'CC003', name: 'IT', type: 'Free', active: false, analysisTags: ['tag1', 'tag5'] },
    { id: 'CC004', name: 'HR', type: 'Tax', active: true, analysisTags: ['tag3', 'tag4'] },
    { id: 'CC005', name: 'Finance', type: 'Free', active: true, analysisTags: ['tag2', 'tag5'] },
]

export default function CostCenterManagement() {
    const [costCenters, setCostCenters] = useState<CostCenter[]>(dummyData)
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

    const handleDeactivate = (id: string) => {
        setCostCenters(costCenters.map(center => 
            center.id === id ? { ...center, active: !center.active } : center
        ))
    }

    const handleEdit = (center: CostCenter) => {
        setId(center.id)
        setName(center.name)
        setType(center.type)
        setActive(center.active)
        setAnalysisTags(center.analysisTags)
        setOpen(true)
    }

    return (
        <div className="p-10">
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
                                <RadioGroup value={type} onValueChange={(value) => setType(value as 'Free' | 'Tax')}>
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
                                    onCheckedChange={(checked) => setActive(checked)}
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
            <div className="overflow-x-auto">
                <div className="min-w-full">
                    <div className="grid grid-cols-12 gap-4 font-semibold border-b pb-2">
                        <div className="col-span-1">ID</div>
                        <div className="col-span-3">Name</div>
                        <div className="col-span-1 text-right">Type</div>
                        <div className="col-span-1 text-right">Active</div>
                        <div className="col-span-3 text-right">Analysis Tags</div>
                        <div className="col-span-3 text-right">Actions</div>
                    </div>
                    {costCenters.map((center) => (
                        <div key={center.id} className="grid grid-cols-12 gap-4 py-2 border-b items-center">
                            <div className="col-span-1">{center.id}</div>
                            <div className="col-span-3">{center.name}</div>
                            <div className="col-span-1 text-right">{center.type}</div>
                            <div className="col-span-1 text-right">{center.active ? 'Yes' : 'No'}</div>
                            <div className="col-span-3 text-right">{center.analysisTags.join(', ')}</div>
                            <div className="col-span-3 flex justify-end space-x-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeactivate(center.id)}
                                >
                                    <PowerIcon className="h-4 w-4 mr-2" />
                                    {center.active ? 'Deactivate' : 'Activate'}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEdit(center)}
                                >
                                    <Edit2Icon className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}