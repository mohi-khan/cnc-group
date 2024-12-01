'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff } from 'lucide-react'
import {
  signUp,
  SignUpData,
  getAllCompanies,
  CompanyData,
  getAllLocations,
  LocationData,
  getAllRoles,
  RoleData,
} from './create-user-api'

enum VoucherTypes {
  Payment = 'Payment Voucher',
  Receipt = 'Receipt Voucher',
  Bank = 'Bank Voucher',
  Journal = 'Journal Voucher',
  Contra = 'Contra Voucher',
}

export default function SignUp() {
  const [userFormData, setUserFormData] = useState<SignUpData>({
    username: '',
    password: '',
    confirmPassword: '',
    active: true,
    roleId: 2,
    voucherTypes: [],
    companyid: [],
    locationid: [],
  })
  // const [userCompaniesFormData, setUserCompaniesFormData] = useState<UserCompanyData>({
  //     userId: 1,
  //     companyId: [],
  // })
  // const [userLocationsFormData, setUserLocationsFormData] = useState<UserLocationData>({
  //     userId: 1,
  //     locationId: [],
  // })
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [companies, setCompanies] = useState<CompanyData[]>([])
  const [locations, setLocations] = useState<LocationData[]>([])
  const [roles, setRoles] = useState<RoleData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const router = useRouter()

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setUserFormData((prev) => ({
      ...prev,
      [name]: name === 'roleId' ? parseInt(value, 10) : value,
    }))
  }
  ///For Validating Pasword on Inline //////
  const validatePassword = (password: string) => {
    const errors: string[] = []
    if (!/[A-Z]/.test(password))
      errors.push('Must include at least one uppercase letter.')
    if (!/[a-z]/.test(password))
      errors.push('Must include at least one lowercase letter.')
    if (!/\d/.test(password)) errors.push('Must include at least one number.')
    if (!/[\W_]/.test(password))
      errors.push('Must include at least one special character.')
    if (password.length < 8) errors.push('Must be at least 8 characters long.')
    return errors
  }

  const handlePasswordChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setUserFormData((prev) => ({ ...prev, [name]: value }))

    if (name === 'password') {
      const errors = validatePassword(value)
      setPasswordErrors(errors)
    }
  }
  ///For Validating Pasword on Inline //////
  const handleCheckboxChange = (
    type: 'companies' | 'locations' | 'voucherTypes',
    item: number | VoucherTypes
  ) => {
    if (type === 'companies') {
      setUserFormData((prev) => ({
        ...prev,
        companyid: prev.companyid.includes(item as number)
          ? prev.companyid.filter((i) => i !== item)
          : [...prev.companyid, item as number],
      }))
    } else if (type === 'locations') {
      setUserFormData((prev) => ({
        ...prev,
        locationid: prev.locationid.includes(item as number)
          ? prev.locationid.filter((i) => i !== item)
          : [...prev.locationid, item as number],
      }))
    } else {
      setUserFormData((prev) => ({
        ...prev,
        voucherTypes: prev.voucherTypes.includes(item as VoucherTypes)
          ? prev.voucherTypes.filter((i) => i !== item)
          : [...prev.voucherTypes, item as VoucherTypes],
      }))
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError('')
      try {
        const [fetchedCompanies, fetchedLocations, fetchedRoles] =
          await Promise.all([
            getAllCompanies(),
            getAllLocations(),
            getAllRoles(),
          ])
        setCompanies(fetchedCompanies)
        setLocations(fetchedLocations)
        setRoles(fetchedRoles)
      } catch (error) {
        console.error('Error fetching data:', error)
        setError(
          'Failed to fetch data. Please refresh the page or try again later.'
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFeedback(null)
    setIsLoading(true)

    try {
      console.log('Submitting form data:', userFormData)

      // Step 1: Register the user
      const signUpResult = await signUp(userFormData)
      if (!signUpResult.success) {
        const errorMessages = signUpResult.errors
          ? signUpResult.errors
              .map((err) => `${err.field}: ${err.message}`)
              .join('\n')
          : 'Sign up failed'
        console.error('Validation errors:', errorMessages)
        throw new Error(errorMessages)
      }

      const newUserId = signUpResult.userId // Assuming the API returns the new user's ID
      console.log(newUserId)

      // Step 2: Create user-location associations
      // if (userFormData.locationid.length > 0) {
      //     const userLocationData = {
      //         userId: newUserId,
      //         locationId: userFormData.locationid
      //     }
      //     console.log('Creating user locations with data:', userLocationData);
      //     await createUserLocation(userLocationData)
      // }

      // // Step 3: Create user-company associations
      // if (userFormData.companyid.length > 0) {
      //     const userCompanyData = {
      //         userId: newUserId,
      //         companyId: userFormData.companyid
      //     }
      //     console.log('Creating user companies with data:', userCompanyData);
      //     await createUserCompany(userCompanyData)
      // }

      setFeedback({
        type: 'success',
        message:
          'User registered successfully with associated locations and companies.',
      })

      // Reset form
      setUserFormData({
        username: '',
        password: '',
        confirmPassword: '',
        active: true,
        roleId: 2,
        voucherTypes: [],
        companyid: [],
        locationid: [],
      })

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (error) {
      console.error('Error during sign up process:', error)
      setFeedback({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'An error occurred during the sign up process. Please try again.',
      })
    } finally {
      setIsLoading(false)
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
            <Image src="/logo.webp" alt="Company Logo" width={80} height={80} />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Create a New Account
          </CardTitle>
          <CardDescription className="text-center">
            Fill in your details to create a new account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {feedback && (
            <Alert
              variant={feedback.type === 'success' ? 'default' : 'destructive'}
              className="mb-4"
            >
              <AlertDescription>{feedback.message}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                value={userFormData.username}
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
                  type={showPassword ? 'text' : 'password'}
                  value={userFormData.password}
                  onChange={handlePasswordChange}
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
              <ul className="text-xs text-red-500 space-y-1 mt-2">
                {passwordErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={userFormData.confirmPassword}
                  onChange={handleChange}
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
              <Label htmlFor="roleId">Select Role</Label>
              <select
                id="roleId"
                name="roleId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={userFormData.roleId}
                onChange={handleChange}
                required
              >
                <option value="">Select a role</option>
                {roles.map((role) => (
                  <option key={role.roleId} value={role.roleId}>
                    {role.roleName}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <div className="flex gap-3 items-center justify-between">
                <Label>Company</Label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {companies.map((company) => (
                  <div
                    key={company.companyId}
                    className="flex items-center gap-2"
                  >
                    <Checkbox
                      checked={userFormData.companyid.includes(
                        company.companyId
                      )}
                      onCheckedChange={() =>
                        handleCheckboxChange('companies', company.companyId)
                      }
                    />
                    <Label>{company.companyName}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2 py-3">
              <div className="flex gap-3 items-center justify-between">
                <Label>Location</Label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {locations.map((location) => (
                  <div
                    key={location.locationId}
                    className="flex items-center gap-2"
                  >
                    <Checkbox
                      checked={userFormData.locationid.includes(
                        location.locationId
                      )}
                      onCheckedChange={() =>
                        handleCheckboxChange('locations', location.locationId)
                      }
                    />
                    <Label>{location.address}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex gap-3 items-center">
                <Label>Voucher Types</Label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(VoucherTypes).map((voucher) => (
                  <div key={voucher} className="flex items-center gap-2">
                    <Checkbox
                      checked={userFormData.voucherTypes.includes(voucher)}
                      onCheckedChange={() =>
                        handleCheckboxChange('voucherTypes', voucher)
                      }
                    />
                    <Label>{voucher}</Label>
                  </div>
                ))}
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit'}
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
