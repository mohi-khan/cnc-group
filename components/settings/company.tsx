'use client'

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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function Component() {
    // Form state
    const [companyName, setCompanyName] = useState('')
    const [streetAddress, setStreetAddress] = useState('')
    const [streetAddress2, setStreetAddress2] = useState('')
    const [city, setCity] = useState('')
    const [state, setState] = useState('')
    const [zip, setZip] = useState('')
    const [country, setCountry] = useState('')
    const [taxId, setTaxId] = useState('')
    const [companyId, setCompanyId] = useState('')
    const [currency, setCurrency] = useState('BDT')
    const [phone, setPhone] = useState('')
    const [mobile, setMobile] = useState('')
    const [email, setEmail] = useState('')
    const [website, setWebsite] = useState('')
    const [emailDomain, setEmailDomain] = useState('cnc-accessories.odoo.com')
    const [locations, setLocations] = useState([''])
    const [activeTab, setActiveTab] = useState('general')
    const [isLoading, setIsLoading] = useState(false)
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null)

    // Computed values
    const isLocationTabEnabled = Boolean(
        companyName.trim() && 
        streetAddress.trim() && 
        mobile.trim()
    )

    const isSaveButtonEnabled = Boolean(
        companyName.trim() && 
        streetAddress.trim() && 
        mobile.trim() && 
        locations.some(loc => loc.trim() !== '')
    )

    const handleAddAddress = () => {
        setLocations([...locations, ''])
    }

    const handleAddressChange = (index: number, value: string) => {
        const newLocations = [...locations]
        newLocations[index] = value
        setLocations(newLocations)
    }

    const createCompany = async () => {
    const companyData = {
        companyName: companyName.trim(),
        address: streetAddress.trim(),
        address2: streetAddress2.trim(),
        city: city.trim(),
        state: state.trim(),
        zip: zip.trim(),
        country: country.trim(),
        taxId: taxId.trim(),
        companyId: companyId.trim(),
        currency: currency,
        phone: phone.trim(),
        mobile: mobile.trim(),
        email: email.trim(),
        website: website.trim(),
        emailDomain: emailDomain.trim(),
    };

    console.log("Data to send for company:", companyData); // Log the data before sending

    const response = await fetch('http://localhost:4000/api/company/createCompany', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyData),
    });

    console.log("Company API Response Status:", response.status); // Log the response status

    const data = await response.json();

    console.log("Company API Response Data:", data); // Log the response data

    if (!response.ok) {
        throw new Error(data.message || 'Failed to create company');
    }

    return data;
};

const createLocations = async (companyId: number) => {
    const locationPromises = locations
        .filter(loc => loc.trim() !== '')
        .map(async (location) => {
            const locationData = {
                companyId,
                branchName: location.trim(),
                address: location.trim(),
            };

            console.log("Data to send for location:", locationData); // Log the data before sending

            const response = await fetch('http://localhost:4000/api/location/createLocation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(locationData),
            });

            console.log("Location API Response Status:", response.status); // Log the response status

            const data = await response.json();

            console.log("Location API Response Data:", data); // Log the response data

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create location');
            }

            return data;
        });

    return Promise.all(locationPromises);
};

const handleSave = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
        console.log("Saving company and locations..."); // Debug log
        const company = await createCompany();
        console.log("Company created successfully with ID:", company.id); // Log the created company ID
        await createLocations(company.id);
        console.log("Locations created successfully"); // Debug log for successful locations
        setFeedback({
            type: 'success',
            message: 'Company and locations created successfully',
        });
        // Reset form
        setCompanyName('');
        setStreetAddress('');
        setStreetAddress2('');
        setCity('');
        setState('');
        setZip('');
        setCountry('');
        setTaxId('');
        setCompanyId('');
        setCurrency('BDT');
        setPhone('');
        setMobile('');
        setEmail('');
        setWebsite('');
        setEmailDomain('cnc-accessories.odoo.com');
        setLocations(['']);
        setActiveTab('general');
    } catch (error) {
        console.error("Error saving data:", error); // Log detailed error
        setFeedback({
            type: 'error',
            message: error instanceof Error ? error.message : 'Failed to create company and locations',
        });
    } finally {
        setIsLoading(false);
    }
};


    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="mb-6">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                    id="companyName"
                    placeholder="e.g. My Company"
                    className="max-w-xl"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                />
            </div>

            {feedback && (
                <Alert variant={feedback.type === 'success' ? 'default' : 'destructive'} className="mb-6">
                    <AlertTitle>{feedback.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
                    <AlertDescription>{feedback.message}</AlertDescription>
                </Alert>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-[300px] grid grid-cols-2">
                    <TabsTrigger
                        value="general"
                        className="data-[state=active]:bg-white data-[state=active]:text-black border data-[state=active]:border-b-0 data-[state=inactive]:border-t-transparent data-[state=inactive]:border-l-transparent data-[state=active]:border-b-transparent"
                    >
                        General Information
                    </TabsTrigger>
                    <TabsTrigger
                        value="location"
                        className="data-[state=active]:bg-white data-[state=active]:text-black border data-[state=active]:border-b-transparent border-l-transparent data-[state=inactive]:border-t-transparent data-[state=inactive]:border-r-transparent"
                        disabled={!isLocationTabEnabled}
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
                                        <Label htmlFor="street">Address *</Label>
                                        <Input 
                                            id="street" 
                                            placeholder="Street..." 
                                            className="mt-1.5" 
                                            value={streetAddress}
                                            onChange={(e) => setStreetAddress(e.target.value)}
                                            required
                                        />
                                        <Input 
                                            placeholder="Street 2..." 
                                            className="mt-1.5" 
                                            value={streetAddress2}
                                            onChange={(e) => setStreetAddress2(e.target.value)}
                                        />
                                        <div className="grid grid-cols-3 gap-2 mt-1.5">
                                            <Input 
                                                placeholder="City" 
                                                value={city}
                                                onChange={(e) => setCity(e.target.value)}
                                            />
                                            <Input 
                                                placeholder="State" 
                                                value={state}
                                                onChange={(e) => setState(e.target.value)}
                                            />
                                            <Input 
                                                placeholder="ZIP" 
                                                value={zip}
                                                onChange={(e) => setZip(e.target.value)}
                                            />
                                        </div>
                                        <Input 
                                            placeholder="Country" 
                                            className="mt-1.5" 
                                            value={country}
                                            onChange={(e) => setCountry(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div>
                                            <Label htmlFor="taxId">Tax ID</Label>
                                            <Input 
                                                id="taxId" 
                                                placeholder="/ if not applicable" 
                                                value={taxId}
                                                onChange={(e) => setTaxId(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="companyId">Company ID</Label>
                                            <Input 
                                                id="companyId" 
                                                value={companyId}
                                                onChange={(e) => setCompanyId(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="currency">Currency</Label>
                                            <Select value={currency} onValueChange={(value) => setCurrency(value)}>
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
                                        <Input 
                                            id="phone" 
                                            type="tel" 
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="mobile">Mobile *</Label>
                                        <Input 
                                            id="mobile" 
                                            type="tel" 
                                            value={mobile}
                                            onChange={(e) => setMobile(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="email">Email</Label>
                                        <Input 
                                            id="email" 
                                            type="email" 
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="website">Website</Label>
                                        <Input 
                                            id="website" 
                                            placeholder="e.g. https://www.odoo.com" 
                                            value={website}
                                            onChange={(e) => setWebsite(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="emailDomain">Email Domain</Label>
                                        <Input 
                                            id="emailDomain" 
                                            value={emailDomain}
                                            onChange={(e) => setEmailDomain(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="location" className="mt-0">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="addAddress" className='mr-2'>Add Location</Label>
                                    {locations.map((location, index) => (
                                        <Input
                                            key={index}
                                            value={location}
                                            onChange={(e) => handleAddressChange(index, e.target.value)}
                                            placeholder={`Address ${index + 1}`}
                                            className="mt-2"
                                        />
                                    ))}
                                    <Button 
                                        onClick={handleAddAddress} 
                                        className="mt-4"
                                    >
                                        Add Address
                                    </Button>
                                </div>
                            </div>
                            <div className='text-right pt-5'>
                                <Button 
                                    onClick={handleSave} 
                                    disabled={!isSaveButtonEnabled || isLoading}
                                >
                                    {isLoading ? 'Saving...' : 'Save'}
                                </Button>
                            </div>
                        </TabsContent>
                    </CardContent>
                </Card>
            </Tabs>
        </div>
    )
}