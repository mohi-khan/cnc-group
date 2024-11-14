"use client"

import { useState } from 'react'
import {
    Card,
    CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

export default function Component() {
    const [isOpen, setIsOpen] = useState(false)
    const [address, setAddress] = useState('')
    const [locations, setLocations] = useState<string[]>([])

    const handleConfirm = () => {
        if (address.trim()) {
            setLocations([...locations, address])
            setIsOpen(false)
            setAddress('')
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="mb-6">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                    id="companyName"
                    placeholder="e.g. My Company"
                    className="max-w-xl"
                />
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="w-[300px] grid grid-cols-2">
                    <TabsTrigger
                        value="general"
                        className="data-[state=active]:bg-slate-200 data-[state=active]:text-black border-2 border-t-transparent"
                    >
                        General Information
                    </TabsTrigger>
                    <TabsTrigger
                        value="location"
                        className="data-[state=active]:bg-slate-200 data-[state=active]:text-black border-2 border-b-transparent border-l-transparent"
                    >
                        Location
                    </TabsTrigger>
                </TabsList>

                <Card className="mt-6">
                    <CardContent className="grid gap-6 pt-6">
                        <TabsContent value="general" className="mt-0">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <Label>Address</Label>
                                        <Input placeholder="Street..." className="mt-1.5" />
                                        <Input placeholder="Street 2..." className="mt-1.5" />
                                        <div className="grid grid-cols-3 gap-2 mt-1.5">
                                            <Input placeholder="City" />
                                            <Input placeholder="State" />
                                            <Input placeholder="ZIP" />
                                        </div>
                                        <Input placeholder="Country" className="mt-1.5" />
                                    </div>

                                    <div className="space-y-2">
                                        <div>
                                            <Label htmlFor="taxId">Tax ID</Label>
                                            <Input id="taxId" placeholder="/ if not applicable" />
                                        </div>
                                        <div>
                                            <Label htmlFor="companyId">Company ID</Label>
                                            <Input id="companyId" />
                                        </div>
                                        <div>
                                            <Label htmlFor="currency">Currency</Label>
                                            <Select defaultValue="BDT">
                                                <SelectTrigger id="currency">
                                                    <SelectValue placeholder="Select currency" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="BDT">BDT</SelectItem>
                                                    <SelectItem value="USD">USD</SelectItem>
                                                    <SelectItem value="EUR">EUR</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div>
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input id="phone" type="tel" />
                                    </div>
                                    <div>
                                        <Label htmlFor="mobile">Mobile</Label>
                                        <Input id="mobile" type="tel" />
                                    </div>
                                    <div>
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" type="email" />
                                    </div>
                                    <div>
                                        <Label htmlFor="website">Website</Label>
                                        <Input id="website" placeholder="e.g. https://www.odoo.com" />
                                    </div>
                                    <div>
                                        <Label htmlFor="emailDomain">Email Domain</Label>
                                        <Input id="emailDomain" defaultValue="cnc-accessories.odoo.com" />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="location" className="mt-0">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="addAddress" className='mr-2'>Add Location</Label>
                                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                                        <DialogTrigger asChild>
                                            <Button id="addAddress" variant="outline" className="w-52">
                                                Add Address
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px]">
                                            <DialogHeader>
                                                <DialogTitle>Add New Address</DialogTitle>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="address" className="text-right">
                                                        Address
                                                    </Label>
                                                    <Input
                                                        id="address"
                                                        value={address}
                                                        onChange={(e) => setAddress(e.target.value)}
                                                        className="col-span-3"
                                                    />
                                                </div>
                                            </div>
                                            <Button onClick={handleConfirm}>Confirm</Button>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                                <div>
                                    <Label>Locations</Label>
                                    {locations.length > 0 ? (
                                        <ul className="mt-2 space-y-2">
                                            {locations.map((loc, index) => (
                                                <li key={index} className="bg-gray-100 p-2 rounded">
                                                    {loc}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-500 mt-2">No locations added yet.</p>
                                    )}
                                </div>
                            </div>
                        </TabsContent>
                    </CardContent>
                </Card>
            </Tabs>
        </div>
    )
}