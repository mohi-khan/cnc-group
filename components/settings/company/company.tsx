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
import {
  companySchema,
  locationSchema,
  createCompany,
  createLocation,
} from './company-api'
enum Currency {
  BDT = 'BDT',
  USD = 'USD',
  EUR = 'EUR',
}

export default function Component() {
  const [companyName, setCompanyName] = useState('')
  const [streetAddress, setStreetAddress] = useState('')
  const [streetAddress2, setStreetAddress2] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zip, setZip] = useState('')
  const [country, setCountry] = useState('')
  const [taxId, setTaxId] = useState('')
  const [companyId, setCompanyId] = useState('')
  const [currency, setCurrency] = useState<Currency>(Currency.BDT)
  const [phone, setPhone] = useState('')
  const [mobile, setMobile] = useState('')
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [emailDomain, setEmailDomain] = useState('cnc-accessories.odoo.com')
  const [locations, setLocations] = useState([''])
  const [activeTab, setActiveTab] = useState('general')
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const [errors, setErrors] = useState<z.ZodError | null>(null)

  const isLocationTabEnabled = Boolean(
    companyName.trim() && streetAddress.trim() && mobile.trim()
  )

  const isSaveButtonEnabled = Boolean(
    companyName.trim() &&
      streetAddress.trim() &&
      mobile.trim() &&
      locations.some((loc) => loc.trim() !== '')
  )

  const handleAddAddress = () => {
    setLocations([...locations, ''])
  }

  const handleAddressChange = (index: number, value: string) => {
    const newLocations = [...locations]
    newLocations[index] = value
    setLocations(newLocations)
  }

  const validateCompanyData = () => {
    try {
      companySchema.parse({
        companyName,
        address: streetAddress,
        address2: streetAddress2,
        city,
        state,
        zip,
        country,
        taxId,
        companyId,
        currency,
        phone,
        mobile,
        email,
        website,
        emailDomain,
      })
      setErrors(null)
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(error)
      }
      return false
    }
  }

  const validateLocations = () => {
    try {
      locations.forEach((location, index) => {
        locationSchema.parse({
          companyId: Number(companyId),
          branchName: location,
          address: location,
        })
      })
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(error)
      }
      return false
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    setFeedback(null)
    setErrors(null)

    if (!validateCompanyData() || !validateLocations()) {
      setIsLoading(false)
      return
    }

    try {
      const companyData = {
        companyName,
        address: streetAddress,
        address2: streetAddress2,
        city,
        state,
        zip,
        country,
        taxId,
        companyId,
        currency,
        phone,
        mobile,
        email,
        website,
        emailDomain,
      }

      const company = await createCompany(companyData) //data is storing. but it's showing error (Types of property 'currency' are incompatible).

      const locationPromises = locations
        .filter((loc) => loc.trim() !== '')
        .map((location) =>
          createLocation({
            companyId: Number(company.companyId),
            branchName: location.trim(),
            address: location.trim(),
          })
        )

      await Promise.all(locationPromises)

      setFeedback({
        type: 'success',
        message: 'Company and locations created successfully',
      })
      // Reset form
      setCompanyName('')
      setStreetAddress('')
      setStreetAddress2('')
      setCity('')
      setState('')
      setZip('')
      setCountry('')
      setTaxId('')
      setCompanyId('')
      setCurrency(Currency.BDT)
      setPhone('')
      setMobile('')
      setEmail('')
      setWebsite('')
      setEmailDomain('cnc-accessories.odoo.com')
      setLocations([''])
      setActiveTab('general')
    } catch (error) {
      console.error('Error saving data:', error)
      setFeedback({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Failed to create company and locations',
      })
    } finally {
      setIsLoading(false)
    }
  }

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
            <ul>
              {errors.errors.map((error, index) => (
                <li key={index}>{error.message}</li>
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
                      <Select
                        value={currency}
                        onValueChange={(value: Currency) => setCurrency(value)}
                      >
                        <SelectTrigger id="currency">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={Currency.BDT}>BDT</SelectItem>
                          <SelectItem value={Currency.USD}>USD</SelectItem>
                          <SelectItem value={Currency.EUR}>EUR</SelectItem>
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
                  <Label htmlFor="addAddress" className="mr-2">
                    Add Location
                  </Label>
                  {locations.map((location, index) => (
                    <Input
                      key={index}
                      value={location}
                      onChange={(e) =>
                        handleAddressChange(index, e.target.value)
                      }
                      placeholder={`Address ${index + 1}`}
                      className="mt-2"
                    />
                  ))}
                  <Button onClick={handleAddAddress} className="mt-4">
                    Add Address
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
