"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff } from 'lucide-react'
import { signUp, SignUpData, getAllCompanies, CompanyData, getAllLocations, LocationData } from './create-user-api'

export default function SignUp() {
    const [formData, setFormData] = useState<SignUpData>({
        username: '',
        password: '',
        role: 'Admin',
        companies: [],
        locations: [],
        vouchers: []
    })
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [error, setError] = useState('')
    const [companies, setCompanies] = useState<CompanyData[]>([])
    const [locations, setLocations] = useState<LocationData[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleCheckboxChange = (type: 'companies' | 'locations' | 'vouchers', item: string) => {
        setFormData(prev => ({
            ...prev,
            [type]: prev[type].includes(item)
                ? prev[type].filter(i => i !== item)
                : [...prev[type], item]
        }))
    }

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            setError('')
            try {
                const [fetchedCompanies, fetchedLocations] = await Promise.all([
                    getAllCompanies(),
                    getAllLocations()
                ])
                setCompanies(fetchedCompanies)
                setLocations(fetchedLocations)
            } catch (error) {
                console.error('Error fetching data:', error)
                setError('Failed to fetch data. Please refresh the page or try again later.')
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (formData.password !== confirmPassword) {
            setError('Password & Confirm Password do not match.')
            return
        }

        try {
            const result = await signUp(formData)
            if (result.success) {
                router.push('/dashboard')
            } else {
                setError(result.errors.map((err: any) => err.message).join(', '))
            }
        } catch (error) {
            setError('An error occurred during sign up.')
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <p>Loading...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8 my-16">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center mb-4">
                        <Image
                            src="/logo.webp"
                            alt="Company Logo"
                            width={80}
                            height={80}
                            className=""
                        />
                    </div>
                    <CardTitle className="text-2xl font-bold text-center">Create a New Account</CardTitle>
                    <CardDescription className="text-center">
                        Fill in your details to create a new account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                name="username"
                                type="text"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-gray-500" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-gray-500" />
                                    )}
                                </Button>
                            </div>
                            <p className="text-xs text-gray-400">
                                Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one special character.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm Password</Label>
                            <div className="relative">
                                <Input
                                    id="confirm-password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4 text-gray-500" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-gray-500" />
                                    )}
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">Select Role</Label>
                            <select
                                id="role"
                                name="role"
                                className="input p-2 border w-full"
                                value={formData.role}
                                onChange={handleChange}
                                required
                            >
                                <option value="Admin">Admin</option>
                                <option value="Entry Operation">Entry Operation</option>
                                <option value="Supervisor">Supervisor</option>
                                <option value="Management">Management</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <div className='flex gap-3 items-center justify-between'>
                                <Label>Company</Label>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {companies.map((company) => (
                                    <div key={company.companyName} className="flex items-center gap-2">
                                        <Checkbox
                                            checked={formData.companies.includes(company.companyName)}
                                            onCheckedChange={() => handleCheckboxChange('companies', company.companyName)}
                                        />
                                        <Label>{company.companyName}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2 py-3">
                            <div className='flex gap-3 items-center justify-between'>
                                <Label>Location</Label>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {locations.map((location) => (
                                    <div key={location.locationId} className="flex items-center gap-2">
                                        <Checkbox
                                            checked={formData.locations.includes(location.address)}
                                            onCheckedChange={() => handleCheckboxChange('locations', location.address)}
                                        />
                                        <Label>{location.address}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className='flex gap-3 items-center'>
                                <Label>Voucher</Label>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {['Voucher A', 'Voucher B', 'Voucher C', 'Voucher D'].map((voucher) => (
                                    <div key={voucher} className="flex items-center gap-2">
                                        <Checkbox
                                            checked={formData.vouchers.includes(voucher)}
                                            onCheckedChange={() => handleCheckboxChange('vouchers', voucher)}
                                        />
                                        <Label>{voucher}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Button type="submit" className="w-full">
                            Submit
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                    <div className="text-sm text-center">
                        Already have an account?{' '}
                        <Link href="/" className="text-primary hover:underline">
                            Sign In
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}

