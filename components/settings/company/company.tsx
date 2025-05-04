'use client'

import { useState } from 'react'
import { z } from 'zod'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { companySchema, createCompany } from '../../../api/company-api'
import { useToast } from '@/hooks/use-toast'
import { tokenAtom, useInitializeUser } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'

export default function CompanyForm() {
  //getting userData from jotai atom component
  useInitializeUser()
  const [token] = useAtom(tokenAtom)

  const router = useRouter()

  //state variables
  const [companyName, setCompanyName] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [country, setCountry] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [taxId, setTaxId] = useState('')
  const [currencyId, setCurrencyId] = useState(1)
  const [logo, setLogo] = useState('https://placeholder.com/logo.png')
  const [parentCompanyId, setParentCompanyId] = useState<number | null>(null)
  const [locationId, setLocationId] = useState<number>(0)
  const [locations, setLocations] = useState([''])
  const [activeTab, setActiveTab] = useState('general')
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const [errors, setErrors] = useState<z.ZodError | null>(null)
  const { toast } = useToast()

  const isLocationTabEnabled = Boolean(
    companyName.trim() && address.trim() && phone.trim()
  )

  const isSaveButtonEnabled = Boolean(
    companyName.trim() &&
      address.trim() &&
      phone.trim() &&
      locations.some((loc) => loc.trim() !== '')
  )

  const handleAddLocation = () => {
    setLocations([...locations, ''])
  }

  const handleLocationChange = (index: number, value: string) => {
    const newLocations = [...locations]
    newLocations[index] = value
    setLocations(newLocations)
  }

  const validateCompanyData = () => {
    try {
      companySchema.parse({
        companyName,
        address,
        city,
        state,
        country,
        postalCode,
        phone,
        email,
        website,
        taxId,
        currencyId,
        logo,
        parentCompanyId,
        locationId,
      })
      setErrors(null)
      return true
    } catch (error) {
      throw 'zod validation error'
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    setFeedback(null)
    setErrors(null)

    if (!validateCompanyData()) {
      setIsLoading(false)
      return
    }

    const companyData = {
      companyName,
      address,
      city,
      state,
      country,
      postalCode,
      phone,
      email,
      website,
      taxId,
      currencyId,
      logo,
      parentCompanyId,
      locationId,
    }
    console.log("🚀 ~ handleSave ~ companyData:", companyData)

    const response = await createCompany(
      companyData,
      locations.filter((loc) => loc.trim() !== ''),
      token
    )
    if(!token) return;
    console.log("🚀 ~ handleSave ~ companyData:", response)
    if(response?.error?.status === 401) {
      router.push('/unauthorized-access')
      console.log('Unauthorized access')
      return
    }
    else if (response.error || !response.data) {
      console.error('Error creating company or location', response.error)
      toast({
        title: 'Error',
        description:
          response.error?.message || 'Error creating company or location',
      })
    } else {
      console.log('Company and Location is created successfully')
      toast({
        title: 'Success',
        description: 'Company and Location is created successfully',
      })
    }

    // For Reset form and loading state
    setCompanyName('')
    setAddress('')
    setCity('')
    setState('')
    setCountry('')
    setPostalCode('')
    setPhone('')
    setEmail('')
    setWebsite('')
    setTaxId('')
    setCurrencyId(1)
    setLogo('https://placeholder.com/logo.png')
    setParentCompanyId(null)
    setLocationId(0)
    setLocations([''])
    setActiveTab('general')
    setIsLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <Label htmlFor="companyName">Company Name *</Label>
        <Input
          id="companyName"
          placeholder="e.g. Tech Innovators Inc."
          className="max-w-xl"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
        />
      </div>

      {feedback && (
        <Alert
          variant={feedback.type === 'success' ? 'default' : 'destructive'}
          className="mb-6"
        >
          <AlertTitle>
            {feedback.type === 'success' ? 'Success' : 'Error'}
          </AlertTitle>
          <AlertDescription>{feedback.message}</AlertDescription>
        </Alert>
      )}

      {errors && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Validation Error</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-4">
              {errors.errors.map((error, index) => (
                <li key={index} className="text-sm">
                  {error.message}
                </li>
              ))}
            </ul>
          </AlertDescription>
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
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      placeholder="Street..."
                      className="mt-1.5"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                    />
                    <div className="grid grid-cols-2 gap-2 mt-1.5">
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
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-1.5">
                      <Input
                        placeholder="Country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                      />
                      <Input
                        placeholder="Postal Code"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                      />
                    </div>
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
                      <Label htmlFor="currencyId">Currency ID</Label>
                      <Select
                        value={currencyId.toString()}
                        onValueChange={(value) => setCurrencyId(Number(value))}
                      >
                        <SelectTrigger id="currencyId">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">BDT</SelectItem>
                          <SelectItem value="2">USD</SelectItem>
                          <SelectItem value="3">EUR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
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
                      placeholder="e.g. https://www.example.com"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="logo">Logo URL</Label>
                    <Input
                      id="logo"
                      placeholder="e.g. https://www.example.com/logo.png"
                      value={logo}
                      onChange={(e) => setLogo(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="location" className="mt-0">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="addLocation" className="mr-2">
                    Add Location
                  </Label>
                  {locations.map((location, index) => (
                    <Input
                      key={index}
                      value={location}
                      onChange={(e) =>
                        handleLocationChange(index, e.target.value)
                      }
                      placeholder={`Location ${index + 1}`}
                      className="mt-2"
                    />
                  ))}
                  <Button onClick={handleAddLocation} className="mt-4">
                    Add Location
                  </Button>
                </div>
              </div>
              <div className="text-right pt-5">
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
