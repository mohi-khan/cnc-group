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
import { Edit, Lock } from "lucide-react";

import { companySchema, CompanyType, createCompany } from "../../../api/company-api";
import { getAllCompanies } from "@/api/common-shared-api";
import { updateCompanyApi } from "../../../api/company-api";

export default function CompanyListWithForm() {
  useInitializeUser();
  const [token] = useAtom(tokenAtom);
  const router = useRouter();
  const { toast } = useToast();

  const [companies, setCompanies] = useState<CompanyType[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyType | null>(null);

  const fetchCompanies = useCallback(async () => {
    if (!token) {
      setCompanies([]);
      return;
    }
    setLoadingList(true);
    try {
      const res = await getAllCompanies(token);
      console.log("Fetched companies:", res?.data);
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

  const handleEdit = (company: CompanyType) => {
    console.log("Editing company:", company);
    setSelectedCompany(company);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedCompany(null);
    setIsDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSelectedCompany(null);
    }
  };

  function CompanyFormInline({ 
    onCreated, 
    editData = null
  }: { 
    onCreated?: () => void;
    editData?: CompanyType | null;
  }) {
    useInitializeUser();
    const [tokenLocal] = useAtom(tokenAtom);

    const isEditMode = Boolean(editData);

    const getInitialLocations = (data: CompanyType | null): { name: string; isExisting: boolean }[] => {
      if (!data) return [{ name: "", isExisting: false }];
      
      console.log("Getting initial locations from:", data);
      
      const possibleLocationProps = [
        'locations',
        'locationId', 
        'location',
        'branches',
        'branchLocations'
      ];
      
      for (const prop of possibleLocationProps) {
        const locationData = (data as any)[prop];
        
        if (Array.isArray(locationData) && locationData.length > 0) {
          const locations = locationData.map((loc: any) => ({
            name: loc.branchName || 
                  loc.locationName || 
                  loc.name || 
                  loc.branch || 
                  loc.location || 
                  "",
            isExisting: true
          })).filter((loc: any) => loc.name);
          
          if (locations.length > 0) {
            console.log("Found locations:", locations);
            return locations;
          }
        }
      }
      
      console.log("No locations found, using empty array");
      return [{ name: "", isExisting: false }];
    };

    const [companyName, setCompanyName] = useState(editData?.companyName || "");
    const [address, setAddress] = useState(editData?.address || "");
    const [city, setCity] = useState(editData?.city || "");
    const [stateVal, setStateVal] = useState(editData?.state || "");
    const [country, setCountry] = useState(editData?.country || "");
    const [postalCode, setPostalCode] = useState(editData?.postalCode || "");
    const [phone, setPhone] = useState(editData?.phone || "");
    const [email, setEmail] = useState(editData?.email || "");
    const [website, setWebsite] = useState(editData?.website || "");
    const [taxId, setTaxId] = useState(editData?.taxId || "");
    const [currencyId, setCurrencyId] = useState(editData?.currencyId || 1);
    const [logo, setLogo] = useState(editData?.logo || "https://placeholder.com/logo.png");
    const [parentCompanyId, setParentCompanyId] = useState<number | null>(editData?.parentCompanyId || null);
    const [locationId, setLocationId] = useState<number>(editData?.locationId || 0);
    const [locations, setLocations] = useState<{ name: string; isExisting: boolean }[]>(() => getInitialLocations(editData));
    const [activeTab, setActiveTab] = useState("general");
    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState<{
      type: "success" | "error";
      message: string;
    } | null>(null);
    const [errors, setErrors] = useState<z.ZodError | null>(null);

    useEffect(() => {
      if (editData) {
        console.log("EditData changed:", editData);
        
        setCompanyName(editData.companyName || "");
        setAddress(editData.address || "");
        setCity(editData.city || "");
        setStateVal(editData.state || "");
        setCountry(editData.country || "");
        setPostalCode(editData.postalCode || "");
        setPhone(editData.phone || "");
        setEmail(editData.email || "");
        setWebsite(editData.website || "");
        setTaxId(editData.taxId || "");
        setCurrencyId(editData.currencyId || 1);
        setLogo(editData.logo || "https://placeholder.com/logo.png");
        setParentCompanyId(editData.parentCompanyId || null);
        setLocationId(editData.locationId || 0);
        
        const initialLocations = getInitialLocations(editData);
        console.log("Setting locations to:", initialLocations);
        setLocations(initialLocations);
      } else {
        setLocations([{ name: "", isExisting: false }]);
      }
    }, [editData]);

    // Fixed: Location tab is enabled based on mode
    // Edit mode: only company name and address required
    // Create mode: company name, address, and phone required
    const isLocationTabEnabled = isEditMode 
      ? Boolean(companyName.trim() && address.trim())
      : Boolean(companyName.trim() && address.trim() && phone.trim());

    const isSaveButtonEnabled = isEditMode 
      ? Boolean(companyName.trim() && address.trim())
      : Boolean(
          companyName.trim() &&
            address.trim() &&
            phone.trim() &&
            locations.some((loc) => loc.name.trim() !== "")
        );

    const handleAddLocation = () => {
      setLocations([...locations, { name: "", isExisting: false }]);
    };

    const handleLocationChange = (index: number, value: string) => {
      const newLocations = [...locations];
      newLocations[index].name = value;
      setLocations(newLocations);
    };

    const handleRemoveLocation = (index: number) => {
      if (locations.length > 1 && !locations[index].isExisting) {
        const newLocations = locations.filter((_, i) => i !== index);
        setLocations(newLocations);
      }
    };

    const validateCompanyData = () => {
      try {
        // In edit mode, make phone optional by providing a default value if empty
        const dataToValidate = {
          companyName,
          address,
          city,
          state: stateVal,
          country,
          postalCode,
          phone: isEditMode && !phone.trim() ? "/" : phone,
          email,
          website,
          taxId,
          currencyId,
          logo,
          parentCompanyId,
          locationId,
        };
        
        companySchema.parse(dataToValidate);
        setErrors(null);
        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          // Filter out phone validation errors in edit mode
          if (isEditMode) {
            const filteredErrors = error.errors.filter(
              err => !(err.path.includes('phone'))
            );
            if (filteredErrors.length === 0) {
              setErrors(null);
              return true;
            }
            setErrors({
              ...error,
              errors: filteredErrors
            } as z.ZodError);
          } else {
            setErrors(error);
          }
        } else {
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

      if (!tokenLocal) {
        toast({
          title: "Unauthorized",
          description: "You must be logged in.",
        });
        setIsLoading(false);
        router.push("/");
        return;
      }

      try {
        let response;
        
        if (isEditMode && editData?.companyId) {
          // Update existing company - send ALL locations (existing + new)
          // This prevents the backend from deleting existing locations
          const allLocations = locations
            .filter(loc => loc.name.trim() !== "")
            .map(loc => ({
              branchName: loc.name.trim(),
              address: address || loc.name.trim(),
              ...(loc.isExisting && { isExisting: true }) // Mark existing ones
            }));
          
          console.log("=== UPDATE COMPANY DEBUG ===");
          console.log("All locations being sent:", allLocations);
          console.log("Existing locations count:", locations.filter(loc => loc.isExisting).length);
          console.log("New locations count:", locations.filter(loc => !loc.isExisting).length);
          
          // Ensure logo is a string, not a Buffer object
          let logoValue = logo;
          if (typeof logo === 'object' && logo !== null) {
            logoValue = 'https://placeholder.com/logo.png';
          }
          
          // Build company data object
          const companyDataPayload = {
            companyName: companyName,
            address: address,
            city: city,
            state: stateVal,
            country: country,
            postalCode: postalCode,
            phone: phone,
            email: email,
            website: website,
            taxId: taxId,
            currencyId: currencyId,
            logo: logoValue,
            parentCompanyId: parentCompanyId,
            locationId: locationId,
          };
          
          console.log("Company data payload:", companyDataPayload);
          console.log("Address field type:", typeof companyDataPayload.address);
          console.log("=== END DEBUG ===");
          
          // Use direct fetch instead of updateCompanyApi to match createCompany pattern
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';
          console.log("API_BASE_URL:", API_BASE_URL);
          
          const fetchResponse = await fetch(
            `${API_BASE_URL}/api/company/update-company/${editData.companyId}`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `${tokenLocal}`,
              },
              body: JSON.stringify({
                companydata: companyDataPayload,
                address: allLocations, // Send ALL locations
              }),
            }
          );
          
          console.log("Fetch response status:", fetchResponse.status);
          response = await fetchResponse.json();
          console.log("Response data:", response);
          
          if (!fetchResponse.ok) {
            console.error("Update error:", response);
            throw new Error(response.message || 'Failed to update company');
          }
          
          if (response?.error?.status === 401) {
            router.push("/unauthorized-access");
            return;
          } else if (response.error || !response.data) {
            console.error("Error updating company", response.error);
            toast({
              title: "Error",
              description: response.error?.message || "Error updating company",
            });
          } else {
            toast({
              title: "Success",
              description: "Company updated successfully",
            });
            if (onCreated) onCreated();
          }
        } else {
          // Create new company
          const locationNames = locations
            .filter((loc) => loc.name.trim() !== "")
            .map(loc => loc.name.trim());
          
          console.log("Creating company with locations:", locationNames);
          console.log("Type check:", locationNames.map(loc => typeof loc));
          
          response = await createCompany(
            companyData,
            locationNames,
            tokenLocal
          );

          if (response?.error?.status === 401) {
            router.push("/unauthorized-access");
            return;
          } else if (response.error || !response.data) {
            console.error("Error creating company or location", response.error);
            toast({
              title: "Error",
              description: response.error?.message || "Error creating company or location",
            });
          } else {
            toast({
              title: "Success",
              description: "Company and Location created successfully",
            });
            if (onCreated) onCreated();
          }
        }
      } catch (err) {
        console.error("Save company exception:", err);
        toast({
          title: "Error",
          description: "An unexpected error occurred while saving company.",
        });
      } finally {
        if (!isEditMode) {
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
          setLocations([{ name: "", isExisting: false }]);
          setActiveTab("general");
        }
        setIsLoading(false);
      }
    };

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
                      <Label htmlFor="phone">Phone {!isEditMode && "*"}</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required={!isEditMode}
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
                    <Label className="mb-3 block">
                      {isEditMode ? "Locations (Existing locations are read-only)" : "Add Locations"}
                    </Label>
                    {locations.map((location, index) => (
                      <div key={index} className="flex gap-2 mt-2">
                        <div className="relative flex-1">
                          <Input
                            value={location.name}
                            onChange={(e) => handleLocationChange(index, e.target.value)}
                            placeholder={`Location ${index + 1}`}
                            className={location.isExisting ? "pr-10 bg-gray-50" : ""}
                            readOnly={location.isExisting}
                            disabled={location.isExisting}
                          />
                          {location.isExisting && (
                            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          )}
                        </div>
                        {!location.isExisting && locations.length > 1 && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveLocation(index)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button onClick={handleAddLocation} className="mt-4">
                      Add New Location
                    </Button>
                  </div>
                </div>
                <div className="text-right pt-5">
                  <Button
                    onClick={handleSave}
                    disabled={!isSaveButtonEnabled || isLoading}
                  >
                    {isLoading ? "Saving..." : isEditMode ? "Update" : "Save"}
                  </Button>
                </div>
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Company List</h1>

        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd}>Add Company</Button>
          </DialogTrigger>

          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedCompany ? "Edit Company" : "Create New Company"}
              </DialogTitle>
            </DialogHeader>

            <CompanyFormInline
              editData={selectedCompany}
              onCreated={() => {
                setIsDialogOpen(false);
                setSelectedCompany(null);
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
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loadingList ? (
              <tr>
                <td colSpan={5} className="p-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : companies.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center">
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
                  <td className="p-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(c)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// "use client";

// import React, { useCallback, useEffect, useState } from "react";
// import { z } from "zod";
// import { Card, CardContent } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Button } from "@/components/ui/button";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { useToast } from "@/hooks/use-toast";
// import { tokenAtom, useInitializeUser } from "@/utils/user";
// import { useAtom } from "jotai";
// import { useRouter } from "next/navigation";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Edit, Lock } from "lucide-react";

// import { companySchema, CompanyType, createCompany } from "../../../api/company-api";
// import { getAllCompanies } from "@/api/common-shared-api";
// import { updateCompanyApi } from "../../../api/company-api";

// export default function CompanyListWithForm() {
//   useInitializeUser();
//   const [token] = useAtom(tokenAtom);
//   const router = useRouter();
//   const { toast } = useToast();

//   const [companies, setCompanies] = useState<CompanyType[]>([]);
//   const [loadingList, setLoadingList] = useState(false);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [selectedCompany, setSelectedCompany] = useState<CompanyType | null>(null);

//   const fetchCompanies = useCallback(async () => {
//     if (!token) {
//       setCompanies([]);
//       return;
//     }
//     setLoadingList(true);
//     try {
//       const res = await getAllCompanies(token);
//       console.log("Fetched companies:", res?.data);
//       setCompanies(res?.data || []);
//     } catch (err) {
//       console.error("Failed to load companies:", err);
//       toast({
//         title: "Error",
//         description: "Failed to load companies",
//       });
//     } finally {
//       setLoadingList(false);
//     }
//   }, [token, toast]);

//   useEffect(() => {
//     fetchCompanies();
//   }, [fetchCompanies]);

//   const handleEdit = (company: CompanyType) => {
//     console.log("Editing company:", company);
//     setSelectedCompany(company);
//     setIsDialogOpen(true);
//   };

//   const handleAdd = () => {
//     setSelectedCompany(null);
//     setIsDialogOpen(true);
//   };

//   const handleDialogClose = (open: boolean) => {
//     setIsDialogOpen(open);
//     if (!open) {
//       setSelectedCompany(null);
//     }
//   };

//   function CompanyFormInline({ 
//     onCreated, 
//     editData = null
//   }: { 
//     onCreated?: () => void;
//     editData?: CompanyType | null;
//   }) {
//     useInitializeUser();
//     const [tokenLocal] = useAtom(tokenAtom);

//     const isEditMode = Boolean(editData);

//     const getInitialLocations = (data: CompanyType | null): { name: string; isExisting: boolean }[] => {
//       if (!data) return [{ name: "", isExisting: false }];
      
//       console.log("Getting initial locations from:", data);
      
//       const possibleLocationProps = [
//         'locations',
//         'locationId', 
//         'location',
//         'branches',
//         'branchLocations'
//       ];
      
//       for (const prop of possibleLocationProps) {
//         const locationData = (data as any)[prop];
        
//         if (Array.isArray(locationData) && locationData.length > 0) {
//           const locations = locationData.map((loc: any) => ({
//             name: loc.branchName || 
//                   loc.locationName || 
//                   loc.name || 
//                   loc.branch || 
//                   loc.location || 
//                   "",
//             isExisting: true
//           })).filter((loc: any) => loc.name);
          
//           if (locations.length > 0) {
//             console.log("Found locations:", locations);
//             return locations;
//           }
//         }
//       }
      
//       console.log("No locations found, using empty array");
//       return [{ name: "", isExisting: false }];
//     };

//     const [companyName, setCompanyName] = useState(editData?.companyName || "");
//     const [address, setAddress] = useState(editData?.address || "");
//     const [city, setCity] = useState(editData?.city || "");
//     const [stateVal, setStateVal] = useState(editData?.state || "");
//     const [country, setCountry] = useState(editData?.country || "");
//     const [postalCode, setPostalCode] = useState(editData?.postalCode || "");
//     const [phone, setPhone] = useState(editData?.phone || "");
//     const [email, setEmail] = useState(editData?.email || "");
//     const [website, setWebsite] = useState(editData?.website || "");
//     const [taxId, setTaxId] = useState(editData?.taxId || "");
//     const [currencyId, setCurrencyId] = useState(editData?.currencyId || 1);
//     const [logo, setLogo] = useState(editData?.logo || "https://placeholder.com/logo.png");
//     const [parentCompanyId, setParentCompanyId] = useState<number | null>(editData?.parentCompanyId || null);
//     const [locationId, setLocationId] = useState<number>(editData?.locationId || 0);
//     const [locations, setLocations] = useState<{ name: string; isExisting: boolean }[]>(() => getInitialLocations(editData));
//     const [activeTab, setActiveTab] = useState("general");
//     const [isLoading, setIsLoading] = useState(false);
//     const [feedback, setFeedback] = useState<{
//       type: "success" | "error";
//       message: string;
//     } | null>(null);
//     const [errors, setErrors] = useState<z.ZodError | null>(null);

//     useEffect(() => {
//       if (editData) {
//         console.log("EditData changed:", editData);
        
//         setCompanyName(editData.companyName || "");
//         setAddress(editData.address || "");
//         setCity(editData.city || "");
//         setStateVal(editData.state || "");
//         setCountry(editData.country || "");
//         setPostalCode(editData.postalCode || "");
//         setPhone(editData.phone || "");
//         setEmail(editData.email || "");
//         setWebsite(editData.website || "");
//         setTaxId(editData.taxId || "");
//         setCurrencyId(editData.currencyId || 1);
//         setLogo(editData.logo || "https://placeholder.com/logo.png");
//         setParentCompanyId(editData.parentCompanyId || null);
//         setLocationId(editData.locationId || 0);
        
//         const initialLocations = getInitialLocations(editData);
//         console.log("Setting locations to:", initialLocations);
//         setLocations(initialLocations);
//       } else {
//         setLocations([{ name: "", isExisting: false }]);
//       }
//     }, [editData]);

//     const isLocationTabEnabled = isEditMode || Boolean(
//       companyName.trim() && address.trim() && phone.trim()
//     );

//     const isSaveButtonEnabled = isEditMode 
//       ? Boolean(companyName.trim() && address.trim() && phone.trim())
//       : Boolean(
//           companyName.trim() &&
//             address.trim() &&
//             phone.trim() &&
//             locations.some((loc) => loc.name.trim() !== "")
//         );

//     const handleAddLocation = () => {
//       setLocations([...locations, { name: "", isExisting: false }]);
//     };

//     const handleLocationChange = (index: number, value: string) => {
//       const newLocations = [...locations];
//       newLocations[index].name = value;
//       setLocations(newLocations);
//     };

//     const handleRemoveLocation = (index: number) => {
//       if (locations.length > 1 && !locations[index].isExisting) {
//         const newLocations = locations.filter((_, i) => i !== index);
//         setLocations(newLocations);
//       }
//     };

//     const validateCompanyData = () => {
//       try {
//         companySchema.parse({
//           companyName,
//           address,
//           city,
//           state: stateVal,
//           country,
//           postalCode,
//           phone,
//           email,
//           website,
//           taxId,
//           currencyId,
//           logo,
//           parentCompanyId,
//           locationId,
//         });
//         setErrors(null);
//         return true;
//       } catch (error) {
//         if (error instanceof z.ZodError) {
//           setErrors(error);
//         } else {
//           setErrors(null);
//         }
//         return false;
//       }
//     };

//     const handleSave = async () => {
//       setIsLoading(true);
//       setFeedback(null);
//       setErrors(null);

//       if (!validateCompanyData()) {
//         setIsLoading(false);
//         return;
//       }

//       const companyData = {
//         companyName,
//         address,
//         city,
//         state: stateVal,
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
//       };

//       if (!tokenLocal) {
//         toast({
//           title: "Unauthorized",
//           description: "You must be logged in.",
//         });
//         setIsLoading(false);
//         router.push("/");
//         return;
//       }

//       try {
//         let response;
        
//         if (isEditMode && editData?.companyId) {
//           // Update existing company
//           const newLocationsOnly = locations
//             .filter(loc => !loc.isExisting && loc.name.trim() !== "")
//             .map(loc => ({
//               branchName: loc.name.trim(),
//               address: address || loc.name.trim(),
//             }));
          
//           console.log("=== UPDATE COMPANY DEBUG ===");
//           console.log("New locations only:", newLocationsOnly);
          
//           // Ensure logo is a string, not a Buffer object
//           let logoValue = logo;
//           if (typeof logo === 'object' && logo !== null) {
//             logoValue = 'https://placeholder.com/logo.png';
//           }
          
//           // Build company data object
//           const companyDataPayload = {
//             companyName: companyName,
//             address: address,
//             city: city,
//             state: stateVal,
//             country: country,
//             postalCode: postalCode,
//             phone: phone,
//             email: email,
//             website: website,
//             taxId: taxId,
//             currencyId: currencyId,
//             logo: logoValue,
//             parentCompanyId: parentCompanyId,
//             locationId: locationId,
//           };
          
//           console.log("Company data payload:", companyDataPayload);
//           console.log("Address field type:", typeof companyDataPayload.address);
//           console.log("=== END DEBUG ===");
          
//           // Use direct fetch instead of updateCompanyApi to match createCompany pattern
//           const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';
//           console.log("API_BASE_URL:", API_BASE_URL);
          
//           const fetchResponse = await fetch(
//             `${API_BASE_URL}/api/company/update-company/${editData.companyId}`,
//             {
//               method: 'PUT',
//               headers: {
//                 'Content-Type': 'application/json',
//                 Authorization: `${tokenLocal}`,
//               },
//               body: JSON.stringify({
//                 companydata: companyDataPayload,
//                 address: newLocationsOnly,
//               }),
//             }
//           );
          
//           console.log("Fetch response status:", fetchResponse.status);
//           response = await fetchResponse.json();
//           console.log("Response data:", response);
          
//           if (!fetchResponse.ok) {
//             console.error("Update error:", response);
//             throw new Error(response.message || 'Failed to update company');
//           }
          
//           if (response?.error?.status === 401) {
//             router.push("/unauthorized-access");
//             return;
//           } else if (response.error || !response.data) {
//             console.error("Error updating company", response.error);
//             toast({
//               title: "Error",
//               description: response.error?.message || "Error updating company",
//             });
//           } else {
//             toast({
//               title: "Success",
//               description: "Company updated successfully",
//             });
//             if (onCreated) onCreated();
//           }
//         } else {
//           // Create new company
//           const locationNames = locations
//             .filter((loc) => loc.name.trim() !== "")
//             .map(loc => loc.name.trim());
          
//           console.log("Creating company with locations:", locationNames);
//           console.log("Type check:", locationNames.map(loc => typeof loc));
          
//           response = await createCompany(
//             companyData,
//             locationNames,
//             tokenLocal
//           );

//           if (response?.error?.status === 401) {
//             router.push("/unauthorized-access");
//             return;
//           } else if (response.error || !response.data) {
//             console.error("Error creating company or location", response.error);
//             toast({
//               title: "Error",
//               description: response.error?.message || "Error creating company or location",
//             });
//           } else {
//             toast({
//               title: "Success",
//               description: "Company and Location created successfully",
//             });
//             if (onCreated) onCreated();
//           }
//         }
//       } catch (err) {
//         console.error("Save company exception:", err);
//         toast({
//           title: "Error",
//           description: "An unexpected error occurred while saving company.",
//         });
//       } finally {
//         if (!isEditMode) {
//           setCompanyName("");
//           setAddress("");
//           setCity("");
//           setStateVal("");
//           setCountry("");
//           setPostalCode("");
//           setPhone("");
//           setEmail("");
//           setWebsite("");
//           setTaxId("");
//           setCurrencyId(1);
//           setLogo("https://placeholder.com/logo.png");
//           setParentCompanyId(null);
//           setLocationId(0);
//           setLocations([{ name: "", isExisting: false }]);
//           setActiveTab("general");
//         }
//         setIsLoading(false);
//       }
//     };

//     return (
//       <div className="max-w-4xl mx-auto p-4">
//         <div className="mb-6">
//           <Label htmlFor="companyName">Company Name *</Label>
//           <Input
//             id="companyName"
//             placeholder="e.g. Tech Innovators Inc."
//             className="max-w-xl"
//             value={companyName}
//             onChange={(e) => setCompanyName(e.target.value)}
//             required
//           />
//         </div>

//         {feedback && (
//           <Alert
//             variant={feedback.type === "success" ? "default" : "destructive"}
//             className="mb-6"
//           >
//             <AlertTitle>
//               {feedback.type === "success" ? "Success" : "Error"}
//             </AlertTitle>
//             <AlertDescription>{feedback.message}</AlertDescription>
//           </Alert>
//         )}

//         {errors && (
//           <Alert variant="destructive" className="mb-6">
//             <AlertTitle>Validation Error</AlertTitle>
//             <AlertDescription>
//               <ul className="list-disc pl-4">
//                 {errors.errors.map((error, index) => (
//                   <li key={index} className="text-sm">
//                     {error.message}
//                   </li>
//                 ))}
//               </ul>
//             </AlertDescription>
//           </Alert>
//         )}

//         <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//           <TabsList className="w-[300px] grid grid-cols-2">
//             <TabsTrigger
//               value="general"
//               className="data-[state=active]:bg-white data-[state=active]:text-black border data-[state=active]:border-b-0 data-[state=inactive]:border-t-transparent data-[state=inactive]:border-l-transparent data-[state=active]:border-b-transparent"
//             >
//               General Information
//             </TabsTrigger>
//             <TabsTrigger
//               value="location"
//               className="data-[state=active]:bg-white data-[state=active]:text-black border data-[state=active]:border-b-transparent border-l-transparent data-[state=inactive]:border-t-transparent data-[state=inactive]:border-r-transparent"
//               disabled={!isLocationTabEnabled}
//             >
//               Location
//             </TabsTrigger>
//           </TabsList>

//           <Card className="mt-6">
//             <CardContent className="grid gap-6 pt-6">
//               <TabsContent value="general" className="mt-0">
//                 <div className="grid md:grid-cols-2 gap-6">
//                   <div className="space-y-4">
//                     <div>
//                       <Label htmlFor="address">Address *</Label>
//                       <Input
//                         id="address"
//                         placeholder="Street..."
//                         className="mt-1.5"
//                         value={address}
//                         onChange={(e) => setAddress(e.target.value)}
//                         required
//                       />
//                       <div className="grid grid-cols-2 gap-2 mt-1.5">
//                         <Input
//                           placeholder="City"
//                           value={city}
//                           onChange={(e) => setCity(e.target.value)}
//                         />
//                         <Input
//                           placeholder="State"
//                           value={stateVal}
//                           onChange={(e) => setStateVal(e.target.value)}
//                         />
//                       </div>
//                       <div className="grid grid-cols-2 gap-2 mt-1.5">
//                         <Input
//                           placeholder="Country"
//                           value={country}
//                           onChange={(e) => setCountry(e.target.value)}
//                         />
//                         <Input
//                           placeholder="Postal Code"
//                           value={postalCode}
//                           onChange={(e) => setPostalCode(e.target.value)}
//                         />
//                       </div>
//                     </div>

//                     <div className="space-y-2">
//                       <div>
//                         <Label htmlFor="taxId">Tax ID</Label>
//                         <Input
//                           id="taxId"
//                           placeholder="/ if not applicable"
//                           value={taxId}
//                           onChange={(e) => setTaxId(e.target.value)}
//                         />
//                       </div>
//                       <div>
//                         <Label htmlFor="currencyId">Currency ID</Label>
//                         <Select
//                           value={currencyId.toString()}
//                           onValueChange={(value) => setCurrencyId(Number(value))}
//                         >
//                           <SelectTrigger id="currencyId">
//                             <SelectValue placeholder="Select currency" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             <SelectItem value="1">BDT</SelectItem>
//                             <SelectItem value="2">USD</SelectItem>
//                             <SelectItem value="3">EUR</SelectItem>
//                           </SelectContent>
//                         </Select>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="space-y-2">
//                     <div>
//                       <Label htmlFor="phone">Phone *</Label>
//                       <Input
//                         id="phone"
//                         type="tel"
//                         value={phone}
//                         onChange={(e) => setPhone(e.target.value)}
                        
//                       />
//                     </div>
//                     <div>
//                       <Label htmlFor="email">Email</Label>
//                       <Input
//                         id="email"
//                         type="email"
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                       />
//                     </div>
//                     <div>
//                       <Label htmlFor="website">Website</Label>
//                       <Input
//                         id="website"
//                         placeholder="e.g. https://www.example.com"
//                         value={website}
//                         onChange={(e) => setWebsite(e.target.value)}
//                       />
//                     </div>
//                     <div>
//                       <Label htmlFor="logo">Logo URL</Label>
//                       <Input
//                         id="logo"
//                         placeholder="e.g. https://www.example.com/logo.png"
//                         value={logo}
//                         onChange={(e) => setLogo(e.target.value)}
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </TabsContent>

//               <TabsContent value="location" className="mt-0">
//                 <div className="space-y-4">
//                   <div>
//                     <Label className="mb-3 block">
//                       {isEditMode ? "Locations (Existing locations are read-only)" : "Add Locations"}
//                     </Label>
//                     {locations.map((location, index) => (
//                       <div key={index} className="flex gap-2 mt-2">
//                         <div className="relative flex-1">
//                           <Input
//                             value={location.name}
//                             onChange={(e) => handleLocationChange(index, e.target.value)}
//                             placeholder={`Location ${index + 1}`}
//                             className={location.isExisting ? "pr-10 bg-gray-50" : ""}
//                             readOnly={location.isExisting}
//                             disabled={location.isExisting}
//                           />
//                           {location.isExisting && (
//                             <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//                           )}
//                         </div>
//                         {!location.isExisting && locations.length > 1 && (
//                           <Button
//                             variant="destructive"
//                             size="sm"
//                             onClick={() => handleRemoveLocation(index)}
//                           >
//                             Remove
//                           </Button>
//                         )}
//                       </div>
//                     ))}
//                     <Button onClick={handleAddLocation} className="mt-4">
//                       Add New Location
//                     </Button>
//                   </div>
//                 </div>
//                 <div className="text-right pt-5">
//                   <Button
//                     onClick={handleSave}
//                     disabled={!isSaveButtonEnabled || isLoading}
//                   >
//                     {isLoading ? "Saving..." : isEditMode ? "Update" : "Save"}
//                   </Button>
//                 </div>
//               </TabsContent>
//             </CardContent>
//           </Card>
//         </Tabs>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 max-w-6xl mx-auto">
//       <div className="flex items-center justify-between mb-6">
//         <h1 className="text-2xl font-semibold">Company List</h1>

//         <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
//           <DialogTrigger asChild>
//             <Button onClick={handleAdd}>Add Company</Button>
//           </DialogTrigger>

//           <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//             <DialogHeader>
//               <DialogTitle>
//                 {selectedCompany ? "Edit Company" : "Create New Company"}
//               </DialogTitle>
//             </DialogHeader>

//             <CompanyFormInline
//               editData={selectedCompany}
//               onCreated={() => {
//                 setIsDialogOpen(false);
//                 setSelectedCompany(null);
//                 fetchCompanies();
//               }}
//             />
//           </DialogContent>
//         </Dialog>
//       </div>

//       <div className="bg-white rounded-md shadow-sm">
//         <table className="w-full text-left">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="p-3">Company Name</th>
//               <th className="p-3">Email</th>
//               <th className="p-3">City</th>
//               <th className="p-3">Address</th>
//               <th className="p-3">Actions</th>
//             </tr>
//           </thead>

//           <tbody>
//             {loadingList ? (
//               <tr>
//                 <td colSpan={5} className="p-4 text-center">
//                   Loading...
//                 </td>
//               </tr>
//             ) : companies.length === 0 ? (
//               <tr>
//                 <td colSpan={5} className="p-4 text-center">
//                   No companies found.
//                 </td>
//               </tr>
//             ) : (
//               companies.map((c: CompanyType) => (
//                 <tr key={c.companyId} className="border-t">
//                   <td className="p-3">{c.companyName}</td>
//                   <td className="p-3">{c.email}</td>
//                   <td className="p-3">{c.city}</td>
//                   <td className="p-3">{c.address}</td>
//                   <td className="p-3">
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       onClick={() => handleEdit(c)}
//                     >
//                       <Edit className="h-4 w-4" />
//                     </Button>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// "use client";

// import React, { useCallback, useEffect, useState } from "react";
// import { z } from "zod";
// import { Card, CardContent } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Button } from "@/components/ui/button";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { useToast } from "@/hooks/use-toast";
// import { tokenAtom, useInitializeUser } from "@/utils/user";
// import { useAtom } from "jotai";
// import { useRouter } from "next/navigation";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Edit } from "lucide-react";

// // Your API functions (make sure these paths are correct in your project)
// import { companySchema, CompanyType, createCompany } from "../../../api/company-api";
// import { getAllCompanies } from "@/api/common-shared-api";

// export default function CompanyListWithForm() {
//   // Auth initialization
//   useInitializeUser();
//   const [token] = useAtom(tokenAtom);
//   const router = useRouter();
//   const { toast } = useToast();

//   // Company list state
//   const [companies, setCompanies] = useState<CompanyType[]>([]);
//   const [loadingList, setLoadingList] = useState(false);

//   // Dialog open state
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
  
//   // Selected company for editing
//   const [selectedCompany, setSelectedCompany] = useState<CompanyType | null>(null);

//   // Fetch companies
//   const fetchCompanies = useCallback(async () => {
//     if (!token) {
//       setCompanies([]);
//       return;
//     }
//     setLoadingList(true);
//     try {
//       const res = await getAllCompanies(token);
//       console.log("Fetched companies:", res?.data); // Debug log
//       setCompanies(res?.data || []);
//     } catch (err) {
//       console.error("Failed to load companies:", err);
//       toast({
//         title: "Error",
//         description: "Failed to load companies",
//       });
//     } finally {
//       setLoadingList(false);
//     }
//   }, [token, toast]);

//   useEffect(() => {
//     fetchCompanies();
//   }, [fetchCompanies]);

//   // Handle opening edit dialog
//   const handleEdit = (company: CompanyType) => {
//     console.log("Editing company:", company); // Debug log to see the structure
//     setSelectedCompany(company);
//     setIsDialogOpen(true);
//   };

//   // Handle opening add dialog
//   const handleAdd = () => {
//     setSelectedCompany(null);
//     setIsDialogOpen(true);
//   };

//   // Handle dialog close
//   const handleDialogClose = (open: boolean) => {
//     setIsDialogOpen(open);
//     if (!open) {
//       setSelectedCompany(null);
//     }
//   };

//   // --- CompanyForm (inlined with edit support)
//   function CompanyFormInline({ 
//     onCreated, 
//     editData 
//   }: { 
//     onCreated?: () => void;
//     editData?: CompanyType | null;
//   }) {
//     useInitializeUser();
//     const [tokenLocal] = useAtom(tokenAtom);

//     // Determine if we're in edit mode
//     const isEditMode = Boolean(editData);

//     // Helper function to extract locations from editData
//     const getInitialLocations = (data: CompanyType | null): string[] => {
//       if (!data) return [""];
      
//       console.log("Getting initial locations from:", data); // Debug log
      
//       // Check different possible property names for locations
//       const possibleLocationProps = [
//         'locations',
//         'locationId', 
//         'location',
//         'branches',
//         'branchLocations'
//       ];
      
//       for (const prop of possibleLocationProps) {
//         const locationData = (data as any)[prop];
        
//         if (Array.isArray(locationData) && locationData.length > 0) {
//           // Try different property names for location/branch names
//           const locations = locationData.map((loc: any) => 
//             loc.branchName || 
//             loc.locationName || 
//             loc.name || 
//             loc.branch || 
//             loc.location || 
//             ""
//           ).filter(Boolean);
          
//           if (locations.length > 0) {
//             console.log("Found locations:", locations); // Debug log
//             return locations;
//           }
//         }
//       }
      
//       console.log("No locations found, using empty array"); // Debug log
//       return [""];
//     };

//     // Initialize state with editData if available
//     const [companyName, setCompanyName] = useState(editData?.companyName || "");
//     const [address, setAddress] = useState(editData?.address || "");
//     const [city, setCity] = useState(editData?.city || "");
//     const [stateVal, setStateVal] = useState(editData?.state || "");
//     const [country, setCountry] = useState(editData?.country || "");
//     const [postalCode, setPostalCode] = useState(editData?.postalCode || "");
//     const [phone, setPhone] = useState(editData?.phone || "");
//     const [email, setEmail] = useState(editData?.email || "");
//     const [website, setWebsite] = useState(editData?.website || "");
//     const [taxId, setTaxId] = useState(editData?.taxId || "");
//     const [currencyId, setCurrencyId] = useState(editData?.currencyId || 1);
//     const [logo, setLogo] = useState(editData?.logo || "https://placeholder.com/logo.png");
//     const [parentCompanyId, setParentCompanyId] = useState<number | null>(editData?.parentCompanyId || null);
//     const [locationId, setLocationId] = useState<number>(editData?.locationId || 0);
//     const [locations, setLocations] = useState<string[]>(() => getInitialLocations(editData));
//     const [activeTab, setActiveTab] = useState("general");
//     const [isLoading, setIsLoading] = useState(false);
//     const [feedback, setFeedback] = useState<{
//       type: "success" | "error";
//       message: string;
//     } | null>(null);
//     const [errors, setErrors] = useState<z.ZodError | null>(null);

//     // Update form when editData changes
//     useEffect(() => {
//       if (editData) {
//         console.log("EditData changed:", editData); // Debug log
        
//         setCompanyName(editData.companyName || "");
//         setAddress(editData.address || "");
//         setCity(editData.city || "");
//         setStateVal(editData.state || "");
//         setCountry(editData.country || "");
//         setPostalCode(editData.postalCode || "");
//         setPhone(editData.phone || "");
//         setEmail(editData.email || "");
//         setWebsite(editData.website || "");
//         setTaxId(editData.taxId || "");
//         setCurrencyId(editData.currencyId || 1);
//         setLogo(editData.logo || "https://placeholder.com/logo.png");
//         setParentCompanyId(editData.parentCompanyId || null);
//         setLocationId(editData.locationId || 0);
        
//         // Update locations
//         const initialLocations = getInitialLocations(editData);
//         console.log("Setting locations to:", initialLocations); // Debug log
//         setLocations(initialLocations);
//       } else {
//         // Reset to empty location when adding new company
//         setLocations([""]);
//       }
//     }, [editData]);

//     // Location tab is enabled if:
//     // 1. We're in edit mode (always enabled)
//     // 2. OR in create mode and required fields are filled
//     const isLocationTabEnabled = isEditMode || Boolean(
//       companyName.trim() && address.trim() && phone.trim()
//     );

//     const isSaveButtonEnabled = Boolean(
//       companyName.trim() &&
//         address.trim() &&
//         phone.trim() &&
//         locations.some((loc) => loc.trim() !== "")
//     );

//     const handleAddLocation = () => {
//       setLocations([...locations, ""]);
//     };

//     const handleLocationChange = (index: number, value: string) => {
//       const newLocations = [...locations];
//       newLocations[index] = value;
//       setLocations(newLocations);
//     };

//     const handleRemoveLocation = (index: number) => {
//       if (locations.length > 1) {
//         const newLocations = locations.filter((_, i) => i !== index);
//         setLocations(newLocations);
//       }
//     };

//     const validateCompanyData = () => {
//       try {
//         companySchema.parse({
//           companyName,
//           address,
//           city,
//           state: stateVal,
//           country,
//           postalCode,
//           phone,
//           email,
//           website,
//           taxId,
//           currencyId,
//           logo,
//           parentCompanyId,
//           locationId,
//         });
//         setErrors(null);
//         return true;
//       } catch (error) {
//         if (error instanceof z.ZodError) {
//           setErrors(error);
//         } else {
//           setErrors(null);
//         }
//         return false;
//       }
//     };

//     const handleSave = async () => {
//       setIsLoading(true);
//       setFeedback(null);
//       setErrors(null);

//       if (!validateCompanyData()) {
//         setIsLoading(false);
//         return;
//       }

//       const companyData = {
//         companyName,
//         address,
//         city,
//         state: stateVal,
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
//       };

//       if (!tokenLocal) {
//         toast({
//           title: "Unauthorized",
//           description: "You must be logged in to create a company.",
//         });
//         setIsLoading(false);
//         router.push("/");
//         return;
//       }

//       try {
//         const response = await createCompany(
//           companyData,
//           locations.filter((loc) => loc.trim() !== ""),
//           tokenLocal
//         );

//         if (response?.error?.status === 401) {
//           router.push("/unauthorized-access");
//           return;
//         } else if (response.error || !response.data) {
//           console.error("Error creating company or location", response.error);
//           toast({
//             title: "Error",
//             description:
//               response.error?.message || "Error creating company or location",
//           });
//         } else {
//           toast({
//             title: "Success",
//             description: editData 
//               ? "Company updated successfully" 
//               : "Company and Location created successfully",
//           });

//           if (onCreated) onCreated();
//         }
//       } catch (err) {
//         console.error("createCompany exception:", err);
//         toast({
//           title: "Error",
//           description: "An unexpected error occurred while creating company.",
//         });
//       } finally {
//         setCompanyName("");
//         setAddress("");
//         setCity("");
//         setStateVal("");
//         setCountry("");
//         setPostalCode("");
//         setPhone("");
//         setEmail("");
//         setWebsite("");
//         setTaxId("");
//         setCurrencyId(1);
//         setLogo("https://placeholder.com/logo.png");
//         setParentCompanyId(null);
//         setLocationId(0);
//         setLocations([""]);
//         setActiveTab("general");
//         setIsLoading(false);
//       }
//     };

//     useEffect(() => {
//       const checkUserData = () => {
//         const storedUserData = localStorage.getItem("currentUser");
//         const storedToken = localStorage.getItem("authToken");

//         if (!storedUserData || !storedToken) {
//           router.push("/");
//           return;
//         }
//       };

//       checkUserData();
//     }, []);

//     return (
//       <div className="max-w-4xl mx-auto p-4">
//         <div className="mb-6">
//           <Label htmlFor="companyName">Company Name *</Label>
//           <Input
//             id="companyName"
//             placeholder="e.g. Tech Innovators Inc."
//             className="max-w-xl"
//             value={companyName}
//             onChange={(e) => setCompanyName(e.target.value)}
//             required
//           />
//         </div>

//         {feedback && (
//           <Alert
//             variant={feedback.type === "success" ? "default" : "destructive"}
//             className="mb-6"
//           >
//             <AlertTitle>
//               {feedback.type === "success" ? "Success" : "Error"}
//             </AlertTitle>
//             <AlertDescription>{feedback.message}</AlertDescription>
//           </Alert>
//         )}

//         {errors && (
//           <Alert variant="destructive" className="mb-6">
//             <AlertTitle>Validation Error</AlertTitle>
//             <AlertDescription>
//               <ul className="list-disc pl-4">
//                 {errors.errors.map((error, index) => (
//                   <li key={index} className="text-sm">
//                     {error.message}
//                   </li>
//                 ))}
//               </ul>
//             </AlertDescription>
//           </Alert>
//         )}

//         <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//           <TabsList className="w-[300px] grid grid-cols-2">
//             <TabsTrigger
//               value="general"
//               className="data-[state=active]:bg-white data-[state=active]:text-black border data-[state=active]:border-b-0 data-[state=inactive]:border-t-transparent data-[state=inactive]:border-l-transparent data-[state=active]:border-b-transparent"
//             >
//               General Information
//             </TabsTrigger>
//             <TabsTrigger
//               value="location"
//               className="data-[state=active]:bg-white data-[state=active]:text-black border data-[state=active]:border-b-transparent border-l-transparent data-[state=inactive]:border-t-transparent data-[state=inactive]:border-r-transparent"
//               disabled={!isLocationTabEnabled}
//             >
//               Location
//             </TabsTrigger>
//           </TabsList>

//           <Card className="mt-6">
//             <CardContent className="grid gap-6 pt-6">
//               <TabsContent value="general" className="mt-0">
//                 <div className="grid md:grid-cols-2 gap-6">
//                   <div className="space-y-4">
//                     <div>
//                       <Label htmlFor="address">Address *</Label>
//                       <Input
//                         id="address"
//                         placeholder="Street..."
//                         className="mt-1.5"
//                         value={address}
//                         onChange={(e) => setAddress(e.target.value)}
//                         required
//                       />
//                       <div className="grid grid-cols-2 gap-2 mt-1.5">
//                         <Input
//                           placeholder="City"
//                           value={city}
//                           onChange={(e) => setCity(e.target.value)}
//                         />
//                         <Input
//                           placeholder="State"
//                           value={stateVal}
//                           onChange={(e) => setStateVal(e.target.value)}
//                         />
//                       </div>
//                       <div className="grid grid-cols-2 gap-2 mt-1.5">
//                         <Input
//                           placeholder="Country"
//                           value={country}
//                           onChange={(e) => setCountry(e.target.value)}
//                         />
//                         <Input
//                           placeholder="Postal Code"
//                           value={postalCode}
//                           onChange={(e) => setPostalCode(e.target.value)}
//                         />
//                       </div>
//                     </div>

//                     <div className="space-y-2">
//                       <div>
//                         <Label htmlFor="taxId">Tax ID</Label>
//                         <Input
//                           id="taxId"
//                           placeholder="/ if not applicable"
//                           value={taxId}
//                           onChange={(e) => setTaxId(e.target.value)}
//                         />
//                       </div>
//                       <div>
//                         <Label htmlFor="currencyId">Currency ID</Label>
//                         <Select
//                           value={currencyId.toString()}
//                           onValueChange={(value) => setCurrencyId(Number(value))}
//                         >
//                           <SelectTrigger id="currencyId">
//                             <SelectValue placeholder="Select currency" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             <SelectItem value="1">BDT</SelectItem>
//                             <SelectItem value="2">USD</SelectItem>
//                             <SelectItem value="3">EUR</SelectItem>
//                           </SelectContent>
//                         </Select>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="space-y-2">
//                     <div>
//                       <Label htmlFor="phone">Phone *</Label>
//                       <Input
//                         id="phone"
//                         type="tel"
//                         value={phone}
//                         onChange={(e) => setPhone(e.target.value)}
//                         required
//                       />
//                     </div>
//                     <div>
//                       <Label htmlFor="email">Email</Label>
//                       <Input
//                         id="email"
//                         type="email"
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                       />
//                     </div>
//                     <div>
//                       <Label htmlFor="website">Website</Label>
//                       <Input
//                         id="website"
//                         placeholder="e.g. https://www.example.com"
//                         value={website}
//                         onChange={(e) => setWebsite(e.target.value)}
//                       />
//                     </div>
//                     <div>
//                       <Label htmlFor="logo">Logo URL</Label>
//                       <Input
//                         id="logo"
//                         placeholder="e.g. https://www.example.com/logo.png"
//                         value={logo}
//                         onChange={(e) => setLogo(e.target.value)}
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </TabsContent>

//               <TabsContent value="location" className="mt-0">
//                 <div className="space-y-4">
//                   <div>
//                     <Label htmlFor="addLocation" className="mr-2">
//                       Add Location
//                     </Label>
//                     {locations.map((location, index) => (
//                       <div key={index} className="flex gap-2 mt-2">
//                         <Input
//                           value={location}
//                           onChange={(e) =>
//                             handleLocationChange(index, e.target.value)
//                           }
//                           placeholder={`Location ${index + 1}`}
//                           className="flex-1"
//                         />
//                         {locations.length > 1 && (
//                           <Button
//                             variant="destructive"
//                             size="sm"
//                             onClick={() => handleRemoveLocation(index)}
//                           >
//                             Remove
//                           </Button>
//                         )}
//                       </div>
//                     ))}
//                     <Button onClick={handleAddLocation} className="mt-4">
//                       Add Location
//                     </Button>
//                   </div>
//                 </div>
//                 <div className="text-right pt-5">
//                   <Button
//                     onClick={handleSave}
//                     disabled={!isSaveButtonEnabled || isLoading}
//                   >
//                     {isLoading ? "Saving..." : "Save"}
//                   </Button>
//                 </div>
//               </TabsContent>
//             </CardContent>
//           </Card>
//         </Tabs>
//       </div>
//     );
//   }

//   // --- Render the list and modal containing the form
//   return (
//     <div className="p-6 max-w-6xl mx-auto">
//       <div className="flex items-center justify-between mb-6">
//         <h1 className="text-2xl font-semibold">Company List</h1>

//         <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
//           <DialogTrigger asChild>
//             <Button onClick={handleAdd}>Add Company</Button>
//           </DialogTrigger>

//           <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//             <DialogHeader>
//               <DialogTitle>
//                 {selectedCompany ? "Edit Company" : "Create New Company"}
//               </DialogTitle>
//             </DialogHeader>

//             <CompanyFormInline
//               editData={selectedCompany}
//               onCreated={() => {
//                 setIsDialogOpen(false);
//                 setSelectedCompany(null);
//                 fetchCompanies();
//               }}
//             />
//           </DialogContent>
//         </Dialog>
//       </div>

//       <div className="bg-white rounded-md shadow-sm">
//         <table className="w-full text-left">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="p-3">Company Name</th>
//               <th className="p-3">Email</th>
//               <th className="p-3">City</th>
//               <th className="p-3">Address</th>
//               <th className="p-3">Actions</th>
//             </tr>
//           </thead>

//           <tbody>
//             {loadingList ? (
//               <tr>
//                 <td colSpan={5} className="p-4 text-center">
//                   Loading...
//                 </td>
//               </tr>
//             ) : companies.length === 0 ? (
//               <tr>
//                 <td colSpan={5} className="p-4 text-center">
//                   No companies found.
//                 </td>
//               </tr>
//             ) : (
//               companies.map((c: CompanyType) => (
//                 <tr key={c.companyId} className="border-t">
//                   <td className="p-3">{c.companyName}</td>
//                   <td className="p-3">{c.email}</td>
//                   <td className="p-3">{c.city}</td>
//                   <td className="p-3">{c.address}</td>
//                   <td className="p-3">
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       onClick={() => handleEdit(c)}
//                     >
//                       <Edit className="h-4 w-4" />
//                     </Button>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// "use client";

// import React, { useCallback, useEffect, useState } from "react";
// import { z } from "zod";
// import { Card, CardContent } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Button } from "@/components/ui/button";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { useToast } from "@/hooks/use-toast";
// import { tokenAtom, useInitializeUser } from "@/utils/user";
// import { useAtom } from "jotai";
// import { useRouter } from "next/navigation";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";

// // Your API functions (make sure these paths are correct in your project)
// import { companySchema, CompanyType, createCompany } from "../../../api/company-api";
// import { getAllCompanies } from "@/api/common-shared-api";

// /**
//  * Single-file component:
//  * - Company list view
//  * - "Add Company" button opens modal
//  * - Modal contains the full CompanyForm (based on the code you provided)
//  *
//  * After successful creation the modal closes and list reloads.
//  */

// export default function CompanyListWithForm() {
//   // Auth initialization (same as your form)
//   useInitializeUser();
//   const [token] = useAtom(tokenAtom);
//   const router = useRouter();
//   const { toast } = useToast();

//   // Company list state
//   const [companies, setCompanies] = useState<CompanyType[]>([]);
//   const [loadingList, setLoadingList] = useState(false);

//   // Dialog open state
//   const [isDialogOpen, setIsDialogOpen] = useState(false);

//   // Fetch companies
//   const fetchCompanies = useCallback(async () => {
//     if (!token) {
//       setCompanies([]);
//       return;
//     }
//     setLoadingList(true);
//     try {
//       const res = await getAllCompanies(token);
//       // expect res.data to be array
//       setCompanies(res?.data || []);
//     } catch (err) {
//       console.error("Failed to load companies:", err);
//       toast({
//         title: "Error",
//         description: "Failed to load companies",
//       });
//     } finally {
//       setLoadingList(false);
//     }
//   }, [token, toast]);

//   useEffect(() => {
//     fetchCompanies();
//   }, [fetchCompanies]);

//   // --- CompanyForm (inlined from your component, with added onCreated callback)
//   function CompanyFormInline({ onCreated }: { onCreated?: () => void }) {
//     //getting userData from jotai atom component
//     useInitializeUser();
//     const [tokenLocal] = useAtom(tokenAtom);

//     //state variables
//     const [companyName, setCompanyName] = useState("");
//     const [address, setAddress] = useState("");
//     const [city, setCity] = useState("");
//     const [stateVal, setStateVal] = useState("");
//     const [country, setCountry] = useState("");
//     const [postalCode, setPostalCode] = useState("");
//     const [phone, setPhone] = useState("");
//     const [email, setEmail] = useState("");
//     const [website, setWebsite] = useState("");
//     const [taxId, setTaxId] = useState("");
//     const [currencyId, setCurrencyId] = useState(1);
//     const [logo, setLogo] = useState("https://placeholder.com/logo.png");
//     const [parentCompanyId, setParentCompanyId] = useState<number | null>(null);
//     const [locationId, setLocationId] = useState<number>(0);
//     const [locations, setLocations] = useState<string[]>([""]);
//     const [activeTab, setActiveTab] = useState("general");
//     const [isLoading, setIsLoading] = useState(false);
//     const [feedback, setFeedback] = useState<{
//       type: "success" | "error";
//       message: string;
//     } | null>(null);
//     const [errors, setErrors] = useState<z.ZodError | null>(null);

//     const isLocationTabEnabled = Boolean(
//       companyName.trim() && address.trim() && phone.trim()
//     );

//     const isSaveButtonEnabled = Boolean(
//       companyName.trim() &&
//         address.trim() &&
//         phone.trim() &&
//         locations.some((loc) => loc.trim() !== "")
//     );

//     const handleAddLocation = () => {
//       setLocations([...locations, ""]);
//     };

//     const handleLocationChange = (index: number, value: string) => {
//       const newLocations = [...locations];
//       newLocations[index] = value;
//       setLocations(newLocations);
//     };

//     const validateCompanyData = () => {
//       try {
//         companySchema.parse({
//           companyName,
//           address,
//           city,
//           state: stateVal,
//           country,
//           postalCode,
//           phone,
//           email,
//           website,
//           taxId,
//           currencyId,
//           logo,
//           parentCompanyId,
//           locationId,
//         });
//         setErrors(null);
//         return true;
//       } catch (error) {
//         if (error instanceof z.ZodError) {
//           setErrors(error);
//         } else {
//           // fallback
//           setErrors(null);
//         }
//         return false;
//       }
//     };

//     const handleSave = async () => {
//       setIsLoading(true);
//       setFeedback(null);
//       setErrors(null);

//       if (!validateCompanyData()) {
//         setIsLoading(false);
//         return;
//       }

//       const companyData = {
//         companyName,
//         address,
//         city,
//         state: stateVal,
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
//       };

//       // ensure token present
//       if (!tokenLocal) {
//         toast({
//           title: "Unauthorized",
//           description: "You must be logged in to create a company.",
//         });
//         setIsLoading(false);
//         router.push("/");
//         return;
//       }

//       try {
//         const response = await createCompany(
//           companyData,
//           locations.filter((loc) => loc.trim() !== ""),
//           tokenLocal
//         );

//         if (response?.error?.status === 401) {
//           router.push("/unauthorized-access");
//           return;
//         } else if (response.error || !response.data) {
//           console.error("Error creating company or location", response.error);
//           toast({
//             title: "Error",
//             description:
//               response.error?.message || "Error creating company or location",
//           });
//         } else {
//           toast({
//             title: "Success",
//             description: "Company and Location is created successfully",
//           });

//           // call callback so parent closes modal and reloads list
//           if (onCreated) onCreated();
//         }
//       } catch (err) {
//         console.error("createCompany exception:", err);
//         toast({
//           title: "Error",
//           description: "An unexpected error occurred while creating company.",
//         });
//       } finally {
//         // For Reset form and loading state
//         setCompanyName("");
//         setAddress("");
//         setCity("");
//         setStateVal("");
//         setCountry("");
//         setPostalCode("");
//         setPhone("");
//         setEmail("");
//         setWebsite("");
//         setTaxId("");
//         setCurrencyId(1);
//         setLogo("https://placeholder.com/logo.png");
//         setParentCompanyId(null);
//         setLocationId(0);
//         setLocations([""]);
//         setActiveTab("general");
//         setIsLoading(false);
//       }
//     };

//     useEffect(() => {
//       const checkUserData = () => {
//         const storedUserData = localStorage.getItem("currentUser");
//         const storedToken = localStorage.getItem("authToken");

//         if (!storedUserData || !storedToken) {
//           router.push("/");
//           return;
//         }
//       };

//       checkUserData();
//     }, []);

//     return (
//       <div className="max-w-4xl mx-auto p-4">
//         <div className="mb-6">
//           <Label htmlFor="companyName">Company Name *</Label>
//           <Input
//             id="companyName"
//             placeholder="e.g. Tech Innovators Inc."
//             className="max-w-xl"
//             value={companyName}
//             onChange={(e) => setCompanyName(e.target.value)}
//             required
//           />
//         </div>

//         {feedback && (
//           <Alert
//             variant={feedback.type === "success" ? "default" : "destructive"}
//             className="mb-6"
//           >
//             <AlertTitle>
//               {feedback.type === "success" ? "Success" : "Error"}
//             </AlertTitle>
//             <AlertDescription>{feedback.message}</AlertDescription>
//           </Alert>
//         )}

//         {errors && (
//           <Alert variant="destructive" className="mb-6">
//             <AlertTitle>Validation Error</AlertTitle>
//             <AlertDescription>
//               <ul className="list-disc pl-4">
//                 {errors.errors.map((error, index) => (
//                   <li key={index} className="text-sm">
//                     {error.message}
//                   </li>
//                 ))}
//               </ul>
//             </AlertDescription>
//           </Alert>
//         )}

//         <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//           <TabsList className="w-[300px] grid grid-cols-2">
//             <TabsTrigger
//               value="general"
//               className="data-[state=active]:bg-white data-[state=active]:text-black border data-[state=active]:border-b-0 data-[state=inactive]:border-t-transparent data-[state=inactive]:border-l-transparent data-[state=active]:border-b-transparent"
//             >
//               General Information
//             </TabsTrigger>
//             <TabsTrigger
//               value="location"
//               className="data-[state=active]:bg-white data-[state=active]:text-black border data-[state=active]:border-b-transparent border-l-transparent data-[state=inactive]:border-t-transparent data-[state=inactive]:border-r-transparent"
//               disabled={!isLocationTabEnabled}
//             >
//               Location
//             </TabsTrigger>
//           </TabsList>

//           <Card className="mt-6">
//             <CardContent className="grid gap-6 pt-6">
//               <TabsContent value="general" className="mt-0">
//                 <div className="grid md:grid-cols-2 gap-6">
//                   <div className="space-y-4">
//                     <div>
//                       <Label htmlFor="address">Address *</Label>
//                       <Input
//                         id="address"
//                         placeholder="Street..."
//                         className="mt-1.5"
//                         value={address}
//                         onChange={(e) => setAddress(e.target.value)}
//                         required
//                       />
//                       <div className="grid grid-cols-2 gap-2 mt-1.5">
//                         <Input
//                           placeholder="City"
//                           value={city}
//                           onChange={(e) => setCity(e.target.value)}
//                         />
//                         <Input
//                           placeholder="State"
//                           value={stateVal}
//                           onChange={(e) => setStateVal(e.target.value)}
//                         />
//                       </div>
//                       <div className="grid grid-cols-2 gap-2 mt-1.5">
//                         <Input
//                           placeholder="Country"
//                           value={country}
//                           onChange={(e) => setCountry(e.target.value)}
//                         />
//                         <Input
//                           placeholder="Postal Code"
//                           value={postalCode}
//                           onChange={(e) => setPostalCode(e.target.value)}
//                         />
//                       </div>
//                     </div>

//                     <div className="space-y-2">
//                       <div>
//                         <Label htmlFor="taxId">Tax ID</Label>
//                         <Input
//                           id="taxId"
//                           placeholder="/ if not applicable"
//                           value={taxId}
//                           onChange={(e) => setTaxId(e.target.value)}
//                         />
//                       </div>
//                       <div>
//                         <Label htmlFor="currencyId">Currency ID</Label>
//                         <Select
//                           value={currencyId.toString()}
//                           onValueChange={(value) => setCurrencyId(Number(value))}
//                         >
//                           <SelectTrigger id="currencyId">
//                             <SelectValue placeholder="Select currency" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             <SelectItem value="1">BDT</SelectItem>
//                             <SelectItem value="2">USD</SelectItem>
//                             <SelectItem value="3">EUR</SelectItem>
//                           </SelectContent>
//                         </Select>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="space-y-2">
//                     <div>
//                       <Label htmlFor="phone">Phone *</Label>
//                       <Input
//                         id="phone"
//                         type="tel"
//                         value={phone}
//                         onChange={(e) => setPhone(e.target.value)}
//                         required
//                       />
//                     </div>
//                     <div>
//                       <Label htmlFor="email">Email</Label>
//                       <Input
//                         id="email"
//                         type="email"
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                       />
//                     </div>
//                     <div>
//                       <Label htmlFor="website">Website</Label>
//                       <Input
//                         id="website"
//                         placeholder="e.g. https://www.example.com"
//                         value={website}
//                         onChange={(e) => setWebsite(e.target.value)}
//                       />
//                     </div>
//                     <div>
//                       <Label htmlFor="logo">Logo URL</Label>
//                       <Input
//                         id="logo"
//                         placeholder="e.g. https://www.example.com/logo.png"
//                         value={logo}
//                         onChange={(e) => setLogo(e.target.value)}
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </TabsContent>

//               <TabsContent value="location" className="mt-0">
//                 <div className="space-y-4">
//                   <div>
//                     <Label htmlFor="addLocation" className="mr-2">
//                       Add Location
//                     </Label>
//                     {locations.map((location, index) => (
//                       <Input
//                         key={index}
//                         value={location}
//                         onChange={(e) =>
//                           handleLocationChange(index, e.target.value)
//                         }
//                         placeholder={`Location ${index + 1}`}
//                         className="mt-2"
//                       />
//                     ))}
//                     <Button onClick={handleAddLocation} className="mt-4">
//                       Add Location
//                     </Button>
//                   </div>
//                 </div>
//                 <div className="text-right pt-5">
//                   <Button
//                     onClick={handleSave}
//                     disabled={!isSaveButtonEnabled || isLoading}
//                   >
//                     {isLoading ? "Saving..." : "Save"}
//                   </Button>
//                 </div>
//               </TabsContent>
//             </CardContent>
//           </Card>
//         </Tabs>
//       </div>
//     );
//   }

//   // --- Render the list and modal containing the form
//   return (
//     <div className="p-6 max-w-6xl mx-auto">
//       <div className="flex items-center justify-between mb-6">
//         <h1 className="text-2xl font-semibold">Company List</h1>

//         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//           <DialogTrigger asChild>
//             <Button>Add Company</Button>
//           </DialogTrigger>

//           <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//             <DialogHeader>
//               <DialogTitle>Create New Company</DialogTitle>
//             </DialogHeader>

//             {/* The inlined full form. onCreated closes modal and refreshes list */}
//             <CompanyFormInline
//               onCreated={() => {
//                 setIsDialogOpen(false);
//                 // Refresh list after slight delay to allow backend write (if needed)
//                 fetchCompanies();
//               }}
//             />
//           </DialogContent>
//         </Dialog>
//       </div>

//       <div className="bg-white rounded-md shadow-sm">
//         <table className="w-full text-left">
//           <thead className="bg-gray-100">
//             <tr>
            
//               <th className="p-3">Company Name</th>
//               <th className="p-3">Email</th>
//               <th className="p-3">City</th>
//               <th className="p-3">Address</th>
//             </tr>
//           </thead>

//           <tbody>
//             {loadingList ? (
//               <tr>
//                 <td colSpan={4} className="p-4 text-center">
//                   Loading...
//                 </td>
//               </tr>
//             ) : companies.length === 0 ? (
//               <tr>
//                 <td colSpan={4} className="p-4 text-center">
//                   No companies found.
//                 </td>
//               </tr>
//             ) : (
//               companies.map((c: CompanyType) => (
//                 <tr key={c.companyId} className="border-t">
                 
//                   <td className="p-3">{c.companyName}</td>
//                   <td className="p-3">{c.email}</td>
//                   <td className="p-3">{c.city}</td>
//                   <td className="p-3">{c.address}</td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }




