"use client";

import React, { useCallback, useEffect, useState } from "react";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { tokenAtom, useInitializeUser } from "@/utils/user";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Your API functions (make sure these paths are correct in your project)
import { companySchema, CompanyType, createCompany } from "../../../api/company-api";
import { getAllCompanies } from "@/api/common-shared-api";

/**
 * Single-file component:
 * - Company list view
 * - "Add Company" button opens modal
 * - Modal contains the full CompanyForm (based on the code you provided)
 *
 * After successful creation the modal closes and list reloads.
 */

export default function CompanyListWithForm() {
  // Auth initialization (same as your form)
  useInitializeUser();
  const [token] = useAtom(tokenAtom);
  const router = useRouter();
  const { toast } = useToast();

  // Company list state
  const [companies, setCompanies] = useState<CompanyType[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  // Dialog open state
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch companies
  const fetchCompanies = useCallback(async () => {
    if (!token) {
      setCompanies([]);
      return;
    }
    setLoadingList(true);
    try {
      const res = await getAllCompanies(token);
      // expect res.data to be array
      setCompanies(res?.data || []);
    } catch (err) {
      console.error("Failed to load companies:", err);
      toast({
        title: "Error",
        description: "Failed to load companies",
      });
    } finally {
      setLoadingList(false);
    }
  }, [token, toast]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // --- CompanyForm (inlined from your component, with added onCreated callback)
  function CompanyFormInline({ onCreated }: { onCreated?: () => void }) {
    //getting userData from jotai atom component
    useInitializeUser();
    const [tokenLocal] = useAtom(tokenAtom);

    //state variables
    const [companyName, setCompanyName] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [stateVal, setStateVal] = useState("");
    const [country, setCountry] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [website, setWebsite] = useState("");
    const [taxId, setTaxId] = useState("");
    const [currencyId, setCurrencyId] = useState(1);
    const [logo, setLogo] = useState("https://placeholder.com/logo.png");
    const [parentCompanyId, setParentCompanyId] = useState<number | null>(null);
    const [locationId, setLocationId] = useState<number>(0);
    const [locations, setLocations] = useState<string[]>([""]);
    const [activeTab, setActiveTab] = useState("general");
    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState<{
      type: "success" | "error";
      message: string;
    } | null>(null);
    const [errors, setErrors] = useState<z.ZodError | null>(null);

    const isLocationTabEnabled = Boolean(
      companyName.trim() && address.trim() && phone.trim()
    );

    const isSaveButtonEnabled = Boolean(
      companyName.trim() &&
        address.trim() &&
        phone.trim() &&
        locations.some((loc) => loc.trim() !== "")
    );

    const handleAddLocation = () => {
      setLocations([...locations, ""]);
    };

    const handleLocationChange = (index: number, value: string) => {
      const newLocations = [...locations];
      newLocations[index] = value;
      setLocations(newLocations);
    };

    const validateCompanyData = () => {
      try {
        companySchema.parse({
          companyName,
          address,
          city,
          state: stateVal,
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
        });
        setErrors(null);
        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          setErrors(error);
        } else {
          // fallback
          setErrors(null);
        }
        return false;
      }
    };

    const handleSave = async () => {
      setIsLoading(true);
      setFeedback(null);
      setErrors(null);

      if (!validateCompanyData()) {
        setIsLoading(false);
        return;
      }

      const companyData = {
        companyName,
        address,
        city,
        state: stateVal,
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
      };

      // ensure token present
      if (!tokenLocal) {
        toast({
          title: "Unauthorized",
          description: "You must be logged in to create a company.",
        });
        setIsLoading(false);
        router.push("/");
        return;
      }

      try {
        const response = await createCompany(
          companyData,
          locations.filter((loc) => loc.trim() !== ""),
          tokenLocal
        );

        if (response?.error?.status === 401) {
          router.push("/unauthorized-access");
          return;
        } else if (response.error || !response.data) {
          console.error("Error creating company or location", response.error);
          toast({
            title: "Error",
            description:
              response.error?.message || "Error creating company or location",
          });
        } else {
          toast({
            title: "Success",
            description: "Company and Location is created successfully",
          });

          // call callback so parent closes modal and reloads list
          if (onCreated) onCreated();
        }
      } catch (err) {
        console.error("createCompany exception:", err);
        toast({
          title: "Error",
          description: "An unexpected error occurred while creating company.",
        });
      } finally {
        // For Reset form and loading state
        setCompanyName("");
        setAddress("");
        setCity("");
        setStateVal("");
        setCountry("");
        setPostalCode("");
        setPhone("");
        setEmail("");
        setWebsite("");
        setTaxId("");
        setCurrencyId(1);
        setLogo("https://placeholder.com/logo.png");
        setParentCompanyId(null);
        setLocationId(0);
        setLocations([""]);
        setActiveTab("general");
        setIsLoading(false);
      }
    };

    useEffect(() => {
      const checkUserData = () => {
        const storedUserData = localStorage.getItem("currentUser");
        const storedToken = localStorage.getItem("authToken");

        if (!storedUserData || !storedToken) {
          router.push("/");
          return;
        }
      };

      checkUserData();
    }, []);

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
            variant={feedback.type === "success" ? "default" : "destructive"}
            className="mb-6"
          >
            <AlertTitle>
              {feedback.type === "success" ? "Success" : "Error"}
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
                          value={stateVal}
                          onChange={(e) => setStateVal(e.target.value)}
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
                    {isLoading ? "Saving..." : "Save"}
                  </Button>
                </div>
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    );
  }

  // --- Render the list and modal containing the form
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Company List</h1>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Company</Button>
          </DialogTrigger>

          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Company</DialogTitle>
            </DialogHeader>

            {/* The inlined full form. onCreated closes modal and refreshes list */}
            <CompanyFormInline
              onCreated={() => {
                setIsDialogOpen(false);
                // Refresh list after slight delay to allow backend write (if needed)
                fetchCompanies();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-md shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
            
              <th className="p-3">Company Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">City</th>
              <th className="p-3">Address</th>
            </tr>
          </thead>

          <tbody>
            {loadingList ? (
              <tr>
                <td colSpan={4} className="p-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : companies.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center">
                  No companies found.
                </td>
              </tr>
            ) : (
              companies.map((c: CompanyType) => (
                <tr key={c.companyId} className="border-t">
                 
                  <td className="p-3">{c.companyName}</td>
                  <td className="p-3">{c.email}</td>
                  <td className="p-3">{c.city}</td>
                  <td className="p-3">{c.address}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}




// 'use client'

// import { useEffect, useState } from 'react'
// import { z } from 'zod'
// import { Card, CardContent } from '@/components/ui/card'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select'
// import { Button } from '@/components/ui/button'
// import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
// import { companySchema, createCompany } from '../../../api/company-api'
// import { useToast } from '@/hooks/use-toast'
// import { tokenAtom, useInitializeUser } from '@/utils/user'
// import { useAtom } from 'jotai'
// import { useRouter } from 'next/navigation'

// export default function CompanyForm() {
//   //getting userData from jotai atom component
//   useInitializeUser()
//   const [token] = useAtom(tokenAtom)

//   const router = useRouter()

//   //state variables
//   const [companyName, setCompanyName] = useState('')
//   const [address, setAddress] = useState('')
//   const [city, setCity] = useState('')
//   const [state, setState] = useState('')
//   const [country, setCountry] = useState('')
//   const [postalCode, setPostalCode] = useState('')
//   const [phone, setPhone] = useState('')
//   const [email, setEmail] = useState('')
//   const [website, setWebsite] = useState('')
//   const [taxId, setTaxId] = useState('')
//   const [currencyId, setCurrencyId] = useState(1)
//   const [logo, setLogo] = useState('https://placeholder.com/logo.png')
//   const [parentCompanyId, setParentCompanyId] = useState<number | null>(null)
//   const [locationId, setLocationId] = useState<number>(0)
//   const [locations, setLocations] = useState([''])
//   const [activeTab, setActiveTab] = useState('general')
//   const [isLoading, setIsLoading] = useState(false)
//   const [feedback, setFeedback] = useState<{
//     type: 'success' | 'error'
//     message: string
//   } | null>(null)
//   const [errors, setErrors] = useState<z.ZodError | null>(null)
//   const { toast } = useToast()

//   const isLocationTabEnabled = Boolean(
//     companyName.trim() && address.trim() && phone.trim()
//   )

//   const isSaveButtonEnabled = Boolean(
//     companyName.trim() &&
//       address.trim() &&
//       phone.trim() &&
//       locations.some((loc) => loc.trim() !== '')
//   )

//   const handleAddLocation = () => {
//     setLocations([...locations, ''])
//   }

//   const handleLocationChange = (index: number, value: string) => {
//     const newLocations = [...locations]
//     newLocations[index] = value
//     setLocations(newLocations)
//   }

//   const validateCompanyData = () => {
//     try {
//       companySchema.parse({
//         companyName,
//         address,
//         city,
//         state,
//         country,
//         postalCode,
//         phone,
//         email,
//         website,
//         taxId,
//         currencyId,
//         logo,
//         parentCompanyId,
//         locationId,
//       })
//       setErrors(null)
//       return true
//     } catch (error) {
//       throw 'zod validation error'
//     }
//   }

//   const handleSave = async () => {
//     setIsLoading(true)
//     setFeedback(null)
//     setErrors(null)

//     if (!validateCompanyData()) {
//       setIsLoading(false)
//       return
//     }

//     const companyData = {
//       companyName,
//       address,
//       city,
//       state,
//       country,
//       postalCode,
//       phone,
//       email,
//       website,
//       taxId,
//       currencyId,
//       logo,
//       parentCompanyId,
//       locationId,
//     }
    

//     const response = await createCompany(
//       companyData,
//       locations.filter((loc) => loc.trim() !== ''),
//       token
//     )
//     if(!token) return;
    
//     if(response?.error?.status === 401) {
//       router.push('/unauthorized-access')
      
//       return
//     }
//     else if (response.error || !response.data) {
//       console.error('Error creating company or location', response.error)
//       toast({
//         title: 'Error',
//         description:
//           response.error?.message || 'Error creating company or location',
//       })
//     } else {
      
//       toast({
//         title: 'Success',
//         description: 'Company and Location is created successfully',
//       })
//     }

//     // For Reset form and loading state
//     setCompanyName('')
//     setAddress('')
//     setCity('')
//     setState('')
//     setCountry('')
//     setPostalCode('')
//     setPhone('')
//     setEmail('')
//     setWebsite('')
//     setTaxId('')
//     setCurrencyId(1)
//     setLogo('https://placeholder.com/logo.png')
//     setParentCompanyId(null)
//     setLocationId(0)
//     setLocations([''])
//     setActiveTab('general')
//     setIsLoading(false)
//   }
//   useEffect(() => {
//     const checkUserData = () => {
//       const storedUserData = localStorage.getItem('currentUser')
//       const storedToken = localStorage.getItem('authToken')

//       if (!storedUserData || !storedToken) {
        
//         router.push('/')
//         return
//       }
      
//     }

// checkUserData()
//   }, [router])
    

//   return (
//     <div className="max-w-4xl mx-auto p-4">
//       <div className="mb-6">
//         <Label htmlFor="companyName">Company Name *</Label>
//         <Input
//           id="companyName"
//           placeholder="e.g. Tech Innovators Inc."
//           className="max-w-xl"
//           value={companyName}
//           onChange={(e) => setCompanyName(e.target.value)}
//           required
//         />
//       </div>

//       {feedback && (
//         <Alert
//           variant={feedback.type === 'success' ? 'default' : 'destructive'}
//           className="mb-6"
//         >
//           <AlertTitle>
//             {feedback.type === 'success' ? 'Success' : 'Error'}
//           </AlertTitle>
//           <AlertDescription>{feedback.message}</AlertDescription>
//         </Alert>
//       )}

//       {errors && (
//         <Alert variant="destructive" className="mb-6">
//           <AlertTitle>Validation Error</AlertTitle>
//           <AlertDescription>
//             <ul className="list-disc pl-4">
//               {errors.errors.map((error, index) => (
//                 <li key={index} className="text-sm">
//                   {error.message}
//                 </li>
//               ))}
//             </ul>
//           </AlertDescription>
//         </Alert>
//       )}

//       <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//         <TabsList className="w-[300px] grid grid-cols-2">
//           <TabsTrigger
//             value="general"
//             className="data-[state=active]:bg-white data-[state=active]:text-black border data-[state=active]:border-b-0 data-[state=inactive]:border-t-transparent data-[state=inactive]:border-l-transparent data-[state=active]:border-b-transparent"
//           >
//             General Information
//           </TabsTrigger>
//           <TabsTrigger
//             value="location"
//             className="data-[state=active]:bg-white data-[state=active]:text-black border data-[state=active]:border-b-transparent border-l-transparent data-[state=inactive]:border-t-transparent data-[state=inactive]:border-r-transparent"
//             disabled={!isLocationTabEnabled}
//           >
//             Location
//           </TabsTrigger>
//         </TabsList>

//         <Card className="mt-6">
//           <CardContent className="grid gap-6 pt-6">
//             <TabsContent value="general" className="mt-0">
//               <div className="grid md:grid-cols-2 gap-6">
//                 <div className="space-y-4">
//                   <div>
//                     <Label htmlFor="address">Address *</Label>
//                     <Input
//                       id="address"
//                       placeholder="Street..."
//                       className="mt-1.5"
//                       value={address}
//                       onChange={(e) => setAddress(e.target.value)}
//                       required
//                     />
//                     <div className="grid grid-cols-2 gap-2 mt-1.5">
//                       <Input
//                         placeholder="City"
//                         value={city}
//                         onChange={(e) => setCity(e.target.value)}
//                       />
//                       <Input
//                         placeholder="State"
//                         value={state}
//                         onChange={(e) => setState(e.target.value)}
//                       />
//                     </div>
//                     <div className="grid grid-cols-2 gap-2 mt-1.5">
//                       <Input
//                         placeholder="Country"
//                         value={country}
//                         onChange={(e) => setCountry(e.target.value)}
//                       />
//                       <Input
//                         placeholder="Postal Code"
//                         value={postalCode}
//                         onChange={(e) => setPostalCode(e.target.value)}
//                       />
//                     </div>
//                   </div>

//                   <div className="space-y-2">
//                     <div>
//                       <Label htmlFor="taxId">Tax ID</Label>
//                       <Input
//                         id="taxId"
//                         placeholder="/ if not applicable"
//                         value={taxId}
//                         onChange={(e) => setTaxId(e.target.value)}
//                       />
//                     </div>
//                     <div>
//                       <Label htmlFor="currencyId">Currency ID</Label>
//                       <Select
//                         value={currencyId.toString()}
//                         onValueChange={(value) => setCurrencyId(Number(value))}
//                       >
//                         <SelectTrigger id="currencyId">
//                           <SelectValue placeholder="Select currency" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="1">BDT</SelectItem>
//                           <SelectItem value="2">USD</SelectItem>
//                           <SelectItem value="3">EUR</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <div>
//                     <Label htmlFor="phone">Phone *</Label>
//                     <Input
//                       id="phone"
//                       type="tel"
//                       value={phone}
//                       onChange={(e) => setPhone(e.target.value)}
//                       required
//                     />
//                   </div>
//                   <div>
//                     <Label htmlFor="email">Email</Label>
//                     <Input
//                       id="email"
//                       type="email"
//                       value={email}
//                       onChange={(e) => setEmail(e.target.value)}
//                     />
//                   </div>
//                   <div>
//                     <Label htmlFor="website">Website</Label>
//                     <Input
//                       id="website"
//                       placeholder="e.g. https://www.example.com"
//                       value={website}
//                       onChange={(e) => setWebsite(e.target.value)}
//                     />
//                   </div>
//                   <div>
//                     <Label htmlFor="logo">Logo URL</Label>
//                     <Input
//                       id="logo"
//                       placeholder="e.g. https://www.example.com/logo.png"
//                       value={logo}
//                       onChange={(e) => setLogo(e.target.value)}
//                     />
//                   </div>
//                 </div>
//               </div>
//             </TabsContent>

//             <TabsContent value="location" className="mt-0">
//               <div className="space-y-4">
//                 <div>
//                   <Label htmlFor="addLocation" className="mr-2">
//                     Add Location
//                   </Label>
//                   {locations.map((location, index) => (
//                     <Input
//                       key={index}
//                       value={location}
//                       onChange={(e) =>
//                         handleLocationChange(index, e.target.value)
//                       }
//                       placeholder={`Location ${index + 1}`}
//                       className="mt-2"
//                     />
//                   ))}
//                   <Button onClick={handleAddLocation} className="mt-4">
//                     Add Location
//                   </Button>
//                 </div>
//               </div>
//               <div className="text-right pt-5">
//                 <Button
//                   onClick={handleSave}
//                   disabled={!isSaveButtonEnabled || isLoading}
//                 >
//                   {isLoading ? 'Saving...' : 'Save'}
//                 </Button>
//               </div>
//             </TabsContent>
//           </CardContent>
//         </Card>
//       </Tabs>
//     </div>
//   )
// }


