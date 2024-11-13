// "use client";
// import {
//     Card,
//     CardContent,
// } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import {
//     Tabs,
//     TabsContent,
//     TabsList,
//     TabsTrigger,
// } from "@/components/ui/tabs"

// export default function Component() {
//     return (
//         <div className="max-w-4xl mx-auto p-4">
//             <div className="mb-6">
//                 <Label htmlFor="companyName">Company Name</Label>
//                 <Input
//                     id="companyName"
//                     placeholder="e.g. My Company"
//                     className="max-w-xl"
//                 />
//             </div>

//             <Tabs defaultValue="general" className="w-full">
//                 <TabsList className="w-[300px]">
//                     <TabsTrigger value="general" className="flex-1">General Information</TabsTrigger>
//                     <TabsTrigger value="location" className="flex-1">Location</TabsTrigger>
//                 </TabsList>

//                 <Card className="mt-6">
//                     <CardContent className="grid gap-6 pt-6">
//                         <TabsContent value="general" className="mt-0">
//                             <div className="grid md:grid-cols-2 gap-6">
//                                 <div className="space-y-4">
//                                     <div>
//                                         <Label>Address</Label>
//                                         <Input placeholder="Street..." className="mt-1.5" />
//                                         <Input placeholder="Street 2..." className="mt-1.5" />
//                                         <div className="grid grid-cols-3 gap-2 mt-1.5">
//                                             <Input placeholder="City" />
//                                             <Input placeholder="State" />
//                                             <Input placeholder="ZIP" />
//                                         </div>
//                                         <Input placeholder="Country" className="mt-1.5" />
//                                     </div>

//                                     <div className="space-y-2">
//                                         <div>
//                                             <Label htmlFor="taxId">Tax ID</Label>
//                                             <Input id="taxId" placeholder="/ if not applicable" />
//                                         </div>
//                                         <div>
//                                             <Label htmlFor="companyId">Company ID</Label>
//                                             <Input id="companyId" />
//                                         </div>
//                                         <div>
//                                             <Label htmlFor="currency">Currency</Label>
//                                             <select
//                                                 id="currency"
//                                                 defaultValue="BDT"
//                                                 className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
//                                             >
//                                                 <option value="BDT">BDT</option>
//                                                 <option value="USD">USD</option>
//                                                 <option value="EUR">EUR</option>
//                                             </select>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 <div className="space-y-2">
//                                     <div>
//                                         <Label htmlFor="phone">Phone</Label>
//                                         <Input id="phone" type="tel" />
//                                     </div>
//                                     <div>
//                                         <Label htmlFor="mobile">Mobile</Label>
//                                         <Input id="mobile" type="tel" />
//                                     </div>
//                                     <div>
//                                         <Label htmlFor="email">Email</Label>
//                                         <Input id="email" type="email" />
//                                     </div>
//                                     <div>
//                                         <Label htmlFor="website">Website</Label>
//                                         <Input id="website" placeholder="e.g. https://www.odoo.com" />
//                                     </div>
//                                     <div>
//                                         <Label htmlFor="emailDomain">Email Domain</Label>
//                                         <Input id="emailDomain" defaultValue="cnc-accessories.odoo.com" />
//                                     </div>
//                                     <div>
//                                         <Label htmlFor="color">Color</Label>
//                                         <Input id="color" type="color" className="h-10 px-1 py-1" />
//                                     </div>
//                                 </div>
//                             </div>
//                         </TabsContent>

//                         <TabsContent value="location" className="mt-0">
//                             <div className="grid md:grid-cols-2 gap-6">
//                                 <div className="space-y-4">
//                                     <div>
//                                         <Label htmlFor="locationName">Location Name</Label>
//                                         <Input id="locationName" placeholder="e.g. Headquarters" />
//                                     </div>
//                                     <div>
//                                         <Label htmlFor="locationType">Location Type</Label>
//                                         <select
//                                             id="locationType"
//                                             className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
//                                         >
//                                             <option value="">Select location type</option>
//                                             <option value="office">Office</option>
//                                             <option value="warehouse">Warehouse</option>
//                                             <option value="retail">Retail Store</option>
//                                         </select>
//                                     </div>
//                                     <div>
//                                         <Label htmlFor="locationAddress">Address</Label>
//                                         <Input id="locationAddress" placeholder="Street..." />
//                                         <Input placeholder="Street 2..." className="mt-1.5" />
//                                         <div className="grid grid-cols-3 gap-2 mt-1.5">
//                                             <Input placeholder="City" />
//                                             <Input placeholder="State" />
//                                             <Input placeholder="ZIP" />
//                                         </div>
//                                         <Input placeholder="Country" className="mt-1.5" />
//                                     </div>
//                                 </div>
//                                 <div className="space-y-4">
//                                     <div>
//                                         <Label htmlFor="locationPhone">Phone</Label>
//                                         <Input id="locationPhone" type="tel" />
//                                     </div>
//                                     <div>
//                                         <Label htmlFor="locationEmail">Email</Label>
//                                         <Input id="locationEmail" type="email" />
//                                     </div>
//                                     <div>
//                                         <Label htmlFor="locationManager">Location Manager</Label>
//                                         <Input id="locationManager" />
//                                     </div>
//                                 </div>
//                             </div>
//                         </TabsContent>
//                     </CardContent>
//                 </Card>
//             </Tabs>
//         </div>
//     )
// }
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

export default function Component() {
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
                        className="data-[state=active]:bg-slate-200 data-[state=active]:text-black border-2 border-t-transparent   "
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
                                    <div>
                                        <Label htmlFor="color">Color</Label>
                                        <Input id="color" type="color" className="h-10 px-1 py-1" />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="location" className="mt-0">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="locationName">Location Name</Label>
                                        <Input id="locationName" placeholder="e.g. Headquarters" />
                                    </div>
                                    <div>
                                        <Label htmlFor="locationType">Location Type</Label>
                                        <Select>
                                            <SelectTrigger id="locationType">
                                                <SelectValue placeholder="Select location type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="office">Office</SelectItem>
                                                <SelectItem value="warehouse">Warehouse</SelectItem>
                                                <SelectItem value="retail">Retail Store</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="locationAddress">Address</Label>
                                        <Input id="locationAddress" placeholder="Street..." />
                                        <Input placeholder="Street 2..." className="mt-1.5" />
                                        <div className="grid grid-cols-3 gap-2 mt-1.5">
                                            <Input placeholder="City" />
                                            <Input placeholder="State" />
                                            <Input placeholder="ZIP" />
                                        </div>
                                        <Input placeholder="Country" className="mt-1.5" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="locationPhone">Phone</Label>
                                        <Input id="locationPhone" type="tel" />
                                    </div>
                                    <div>
                                        <Label htmlFor="locationEmail">Email</Label>
                                        <Input id="locationEmail" type="email" />
                                    </div>
                                    <div>
                                        <Label htmlFor="locationManager">Location Manager</Label>
                                        <Input id="locationManager" />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </CardContent>
                </Card>
            </Tabs>
        </div>
    )
}