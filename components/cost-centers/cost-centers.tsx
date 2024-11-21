// 'use client'

// import React, { useState, useRef } from 'react'
// import { Button } from "@/components/ui/button"
// import { PlusIcon, Edit2Icon, XIcon } from 'lucide-react'
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
// import { Switch } from "@/components/ui/switch"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// type CostCenter = {
//     id: string
//     name: string
//     type: 'Free' | 'Tax'
//     active: boolean
//     analysisTags: string[]
// }

// const dummyData: CostCenter[] = [
//     { id: 'CC001', name: 'Marketing', type: 'Free', active: true, analysisTags: ['tag1', 'tag3'] },
//     { id: 'CC002', name: 'Sales', type: 'Tax', active: true, analysisTags: ['tag2', 'tag4'] },
//     { id: 'CC003', name: 'IT', type: 'Free', active: false, analysisTags: ['tag1', 'tag5'] },
//     { id: 'CC004', name: 'HR', type: 'Tax', active: true, analysisTags: ['tag3', 'tag4'] },
//     { id: 'CC005', name: 'Finance', type: 'Free', active: true, analysisTags: ['tag2', 'tag5'] },
// ]

// export default function CostCenterManagement() {
//     const [costCenters, setCostCenters] = useState<CostCenter[]>(dummyData)
//     const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
//     const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
//     const [selectedCostCenter, setSelectedCostCenter] = useState<CostCenter | null>(null)
//     const [newTag, setNewTag] = useState('')

//     const formRef = useRef<HTMLFormElement>(null);

//     const handleSubmit = (e: React.FormEvent) => {
//         e.preventDefault()
//         if (selectedCostCenter) {
//             if (isEditDialogOpen) {
//                 setCostCenters(costCenters.map(center =>
//                     center.id === selectedCostCenter.id ? selectedCostCenter : center
//                 ))
//                 setIsEditDialogOpen(false)
//             } else {
//                 setCostCenters([...costCenters, { ...selectedCostCenter, id: Date.now().toString() }])
//                 setIsAddDialogOpen(false)
//             }
//             setSelectedCostCenter(null)
//         }
//     }

//     const resetForm = () => {
//         setSelectedCostCenter({
//             id: '',
//             name: '',
//             type: 'Free',
//             active: true,
//             analysisTags: []
//         })
//         setNewTag('')
//     }

//     const handleDeactivate = (id: string) => {
//         setCostCenters(costCenters.map(center =>
//             center.id === id ? { ...center, active: !center.active } : center
//         ))
//     }

//     const handleEdit = (center: CostCenter) => {
//         setSelectedCostCenter(center)
//         setIsEditDialogOpen(true)
//     }

//     const handleAddTag = () => {
//         const newTagInput = formRef.current?.querySelector('#analysis-tags') as HTMLInputElement;
//         const newTag = newTagInput?.value.trim();
//         if (newTag && selectedCostCenter && !selectedCostCenter.analysisTags.includes(newTag)) {
//             setSelectedCostCenter(prev => ({
//                 ...prev!,
//                 analysisTags: [...prev!.analysisTags, newTag]
//             }))
//             newTagInput.value = '';
//         }
//     }

//     const handleRemoveTag = (tag: string) => {
//         if (selectedCostCenter) {
//             setSelectedCostCenter({
//                 ...selectedCostCenter,
//                 analysisTags: selectedCostCenter.analysisTags.filter(t => t !== tag)
//             })
//         }
//     }

//     const CostCenterForm = () => {

//         const handleSubmit = (e: React.FormEvent) => {
//             e.preventDefault();
//             const formData = new FormData(formRef.current!);
//             const newCostCenter: CostCenter = {
//                 id: formData.get('id') as string,
//                 name: formData.get('name') as string,
//                 type: formData.get('type') as 'Free' | 'Tax', // Extract type directly
//                 active: formData.get('active') === 'on',
//                 analysisTags: selectedCostCenter?.analysisTags || []
//             };            

//             if (isEditDialogOpen) {
//                 setCostCenters(costCenters.map(center =>
//                     center.id === newCostCenter.id ? newCostCenter : center
//                 ));
//                 setIsEditDialogOpen(false);
//             } else {
//                 setCostCenters([...costCenters, { ...newCostCenter, id: Date.now().toString() }]);
//                 setIsAddDialogOpen(false);
//             }
//             setSelectedCostCenter(null);
//         };

//         return (
//             <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
//                 <div className="grid grid-cols-4 items-center gap-4">
//                     <Label htmlFor="cost-center-id" className="text-right">
//                         Cost Center ID
//                     </Label>
//                     <Input
//                         id="cost-center-id"
//                         name="id"
//                         defaultValue={selectedCostCenter?.id}
//                         className="col-span-3"
//                         required
//                     />
//                 </div>
//                 <div className="grid grid-cols-4 items-center gap-4">
//                     <Label htmlFor="cost-center-name" className="text-right">
//                         Cost Center Name
//                     </Label>
//                     <Input
//                         id="cost-center-name"
//                         name="name"
//                         defaultValue={selectedCostCenter?.name}
//                         className="col-span-3"
//                         required
//                     />
//                 </div>
//                 <div className="grid grid-cols-4 items-center gap-4">
//                     <Label className="text-right">Type</Label>
//                     <RadioGroup
//                         defaultValue={selectedCostCenter?.type || 'Free'}
//                         name="type" // Ensure this matches the expected field name in your form
//                         className="col-span-3"
//                     >
//                         <div className="flex items-center space-x-2">
//                             <RadioGroupItem value="Free" id="free" />
//                             <Label htmlFor="free">Free</Label>
//                         </div>
//                         <div className="flex items-center space-x-2">
//                             <RadioGroupItem value="Tax" id="tax" />
//                             <Label htmlFor="tax">Tax</Label>
//                         </div>
//                     </RadioGroup>
//                 </div>

//                 <div className="grid grid-cols-4 items-center gap-4">
//                     <Label htmlFor="active" className="text-right">
//                         Active
//                     </Label>
//                     <Switch
//                         id="active"
//                         name="active"
//                         defaultChecked={selectedCostCenter?.active}
//                         className=""
//                     />
//                 </div>
//                 <div className="grid grid-cols-4 items-center gap-4">
//                     <Label htmlFor="analysis-tags" className="text-right">
//                         Analysis Tags
//                     </Label>
//                     <div className="col-span-3 space-y-2">
//                         <div className="flex space-x-2">
//                             <Input
//                                 id="analysis-tags"
//                                 name="newTag"
//                                 placeholder="Enter a tag"
//                             />
//                             <Button type="button" onClick={handleAddTag}>Add</Button>
//                         </div>
//                         <div className="flex flex-wrap gap-2">
//                             {selectedCostCenter?.analysisTags.map((tag, index) => (
//                                 <div key={index} className="flex items-center bg-secondary text-secondary-foreground px-2 py-1 rounded">
//                                     {tag}
//                                     <Button
//                                         type="button"
//                                         variant="ghost"
//                                         size="sm"
//                                         className="ml-2 h-4 w-4 p-0"
//                                         onClick={() => handleRemoveTag(tag)}
//                                     >
//                                         <XIcon className="h-3 w-3" />
//                                     </Button>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 </div>
//                 <div className="flex justify-end space-x-2">
//                     <Button variant="outline" onClick={() => isEditDialogOpen ? setIsEditDialogOpen(false) : setIsAddDialogOpen(false)}>
//                         Cancel
//                     </Button>
//                     <Button type="submit">{isEditDialogOpen ? 'Update' : 'Add'} Cost Center</Button>
//                 </div>
//             </form>
//         )
//     }

//     return (
//         <div className="container mx-auto py-10">
//             <div className="flex justify-between items-center mb-6">
//                 <h1 className="text-2xl font-bold">Cost Centers</h1>
//                 <Button onClick={() => { resetForm(); setIsAddDialogOpen(true); }}>
//                     <PlusIcon className="mr-2 h-4 w-4" /> Add Cost Center
//                 </Button>
//             </div>
//             <div className="overflow-x-auto">
//                 <Table>
//                     <TableHeader>
//                         <TableRow>
//                             <TableHead>ID</TableHead>
//                             <TableHead>Name</TableHead>
//                             <TableHead>Type</TableHead>
//                             <TableHead>Active</TableHead>
//                             <TableHead>Analysis Tags</TableHead>
//                             <TableHead className="text-right">Actions</TableHead>
//                         </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                         {costCenters.map((center) => (
//                             <TableRow key={center.id}>
//                                 <TableCell>{center.id}</TableCell>
//                                 <TableCell>{center.name}</TableCell>
//                                 <TableCell>{center.type}</TableCell>
//                                 <TableCell>{center.active ? 'Yes' : 'No'}</TableCell>
//                                 <TableCell>{center.analysisTags.join(', ')}</TableCell>
//                                 <TableCell className="text-right">
//                                     <Button
//                                         size="sm"
//                                         variant="outline"
//                                         onClick={() => handleEdit(center)}
//                                         className="mr-2"
//                                     >
//                                         Edit
//                                     </Button>
//                                     <Button
//                                         size="sm"
//                                         variant="outline"
//                                         onClick={() => handleDeactivate(center.id)}
//                                     >
//                                         {center.active ? 'Deactivate' : 'Activate'}
//                                     </Button>
//                                 </TableCell>
//                             </TableRow>
//                         ))}
//                     </TableBody>
//                 </Table>
//             </div>

//             <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
//                 <DialogContent className="sm:max-w-[425px]">
//                     <DialogHeader>
//                         <DialogTitle>Add New Cost Center</DialogTitle>
//                     </DialogHeader>
//                     <CostCenterForm />
//                 </DialogContent>
//             </Dialog>

//             <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
//                 <DialogContent className="sm:max-w-[425px]">
//                     <DialogHeader>
//                         <DialogTitle>Edit Cost Center</DialogTitle>
//                     </DialogHeader>
//                     <CostCenterForm />
//                 </DialogContent>
//             </Dialog>
//         </div>
//     )
// }

'use client'

import React, { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { PlusIcon } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type CostCenter = {
    id: string
    name: string
    description: string
    currencyCode: string
    active: boolean
    companyNames: string[]
    budget: number
    actual: number
}

const dummyData: CostCenter[] = [
    { id: 'CC001', name: 'Marketing', description: 'Marketing department', currencyCode: 'BDT', active: true, companyNames: ['Company A', 'Company B'], budget: 100000, actual: 95000 },
    { id: 'CC002', name: 'Sales', description: 'Sales department', currencyCode: 'BDT', active: true, companyNames: ['Company A'], budget: 150000, actual: 140000 },
    { id: 'CC003', name: 'IT', description: 'IT department', currencyCode: 'BDT', active: false, companyNames: ['Company B', 'Company C'], budget: 200000, actual: 180000 },
]

export default function CostCenterManagement() {
    const [costCenters, setCostCenters] = useState<CostCenter[]>(dummyData)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [selectedCostCenter, setSelectedCostCenter] = useState<CostCenter | null>(null)

    const formRef = useRef<HTMLFormElement>(null);

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
        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            const formData = new FormData(formRef.current!);
            const newCostCenter: CostCenter = {
                id: formData.get('id') as string || Date.now().toString(),
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                currencyCode: formData.get('currencyCode') as string,
                active: true,
                companyNames: [],
                budget: 0,
                actual: 0
            };

            if (isEditDialogOpen) {
                setCostCenters(costCenters.map(center =>
                    center.id === newCostCenter.id ? { ...center, ...newCostCenter } : center
                ));
                setIsEditDialogOpen(false);
            } else {
                setCostCenters([...costCenters, newCostCenter]);
                setIsAddDialogOpen(false);
            }
            setSelectedCostCenter(null);
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
                    <Button type="submit">{isEditDialogOpen ? 'Update' : 'Add'} Cost Center</Button>
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
                            <TableRow key={center.id}>
                                <TableCell>{center.id}</TableCell>
                                <TableCell>{center.name}</TableCell>
                                <TableCell>{center.description}</TableCell>
                                <TableCell>{center.currencyCode}</TableCell>
                                <TableCell>{center.active ? 'Yes' : 'No'}</TableCell>
                                <TableCell>{center.companyNames.join(', ')}</TableCell>
                                <TableCell>{center.budget.toLocaleString()}</TableCell>
                                <TableCell>{center.actual.toLocaleString()}</TableCell>
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
                                        onClick={() => handleDeactivate(center.id)}
                                    >
                                        {center.active ? 'Deactivate' : 'Activate'}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

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

