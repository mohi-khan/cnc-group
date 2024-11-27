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

const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return password.length >= minLength && hasUpperCase && hasLowerCase && hasSpecialChar;
};

export default function SignUp() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [role, setRole] = useState('')
    const [selectedLocations, setSelectedLocations] = useState<string[]>([])
    const [selectedVouchers, setSelectedVouchers] = useState<string[]>([])
    const [error, setError] = useState('')
    const [companies, setCompanies] = useState<string[]>([])
    const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])
    const router = useRouter()

    const handleLocationChange = (location: string) => {
        setSelectedLocations((prev) =>
            prev.includes(location) ? prev.filter((c) => c !== location) : [...prev, location]
        )
    }
    const handleVoucherChange = (voucher: string) => {
        setSelectedVouchers((prev) =>
            prev.includes(voucher) ? prev.filter((c) => c !== voucher) : [...prev, voucher]
        )
    }

    const handleCompanyChange = (company: string) => {
        setSelectedCompanies((prev) =>
            prev.includes(company) ? prev.filter((c) => c !== company) : [...prev, company]
        )
    }

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await fetch('http://localhost:4000/api/company/companies/all')
                const data = await response.json()
                setCompanies(data.map((company: any) => company.companyName))
            } catch (error) {
                console.error('Error fetching companies:', error)
                setError('Failed to fetch companies')
            }
        }

        fetchCompanies()
    }, [])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!username || !password || !confirmPassword || !role) {
            setError('Please fill in all required fields.')
            return
        }

        if (!validatePassword(password)) {
            setError('Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one special character.')
            return
        }

        if (password !== confirmPassword) {
            setError('Password & Confirm Password do not match.')
            return
        }

        console.log('Creating account with:', { username, password, role, selectedLocations, selectedVouchers, selectedCompanies })
        router.push('/dashboard')
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8 my-16">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center mb-4">
                        <Image
                            src="/"
                            alt="Company Logo"
                            width={64}
                            height={64}
                            className="rounded-full border"
                        />
                    </div>
                    <CardTitle className="text-2xl font-bold text-center">Create a New Account</CardTitle>
                    <CardDescription className="text-center">
                        Fill in your details to create a new account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder=""
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
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
                                className="input p-2 border w-full"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                required
                            >
                                <option value="" disabled>Select option</option>
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
                                    <div key={company} className="flex items-center gap-2">
                                        <Checkbox
                                            checked={selectedCompanies.includes(company)}
                                            onCheckedChange={() => handleCompanyChange(company)}
                                        />
                                        <Label>{company}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2 py-3">
                            <div className='flex gap-3 items-center justify-between'>
                                <Label>Location</Label>
                                {/* <SmallButton>New</SmallButton> */}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {['Location A', 'Location B', 'Location C', 'Location D'].map((location) => (
                                    <div key={location} className="flex items-center gap-2">
                                        <Checkbox
                                            checked={selectedCompanies.includes(location)}
                                            onCheckedChange={() => handleLocationChange(location)}
                                        />
                                        <Label>{location}</Label>
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
                                            checked={selectedCompanies.includes(voucher)}
                                            onCheckedChange={() => handleVoucherChange(voucher)}
                                        />
                                        <Label>{voucher}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {error && (
                            <Alert variant="destructive" className='text-red-500 border-hidden'>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
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


