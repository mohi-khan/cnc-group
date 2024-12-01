// 'use client'

// import { signIn, SignInRequest, SignInRequestSchema } from '@/api/signin'
// import { Alert, AlertDescription } from '@/components/ui/alert'
// import { Button } from '@/components/ui/button'
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card'
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from '@/components/ui/form'
// import { Input } from '@/components/ui/input'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { EyeIcon, EyeOffIcon, LockIcon } from 'lucide-react'
// import Image from 'next/image'
// import Link from 'next/link'
// import { useRouter } from 'next/navigation'
// import { useState } from 'react'
// import { useForm } from 'react-hook-form'

// export default function SignIn() {
//   const [showPassword, setShowPassword] = useState(false)
//   const [error, setError] = useState('')
//   const router = useRouter()

//   const form = useForm<SignInRequest>({
//     resolver: zodResolver(SignInRequestSchema),
//     defaultValues: {
//       username: '',
//       password: '',
//     },
//   })

//   const onSubmit = async (values: SignInRequest) => {
//     setError('')

//     const response = await signIn({
//       username: values.username,
//       password: values.password,
//     })

//     if (response.error) {
//       setError(response.error.message)
//       return
//     }

//     localStorage.setItem('token', response.data?.token ?? '')
//     router.replace('/dashboard')
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
//       <Card className="w-full max-w-md">
//         <CardHeader className="space-y-1">
//           <div className="flex justify-center mb-4">
//             <Image
//               src="/logo.webp"
//               alt="Company Logo"
//               width={80}
//               height={80}
//               className=""
//             />
//           </div>
//           <CardTitle className="text-2xl font-bold text-center">
//             Sign in to your account
//           </CardTitle>
//           <CardDescription className="text-center">
//             Enter your username and password to access your account
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//               <FormField
//                 control={form.control}
//                 name="username"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Username</FormLabel>
//                     <FormControl>
//                       <Input {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="password"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Password</FormLabel>
//                     <FormControl>
//                       <div className="relative">
//                         <Input
//                           {...field}
//                           type={showPassword ? 'text' : 'password'}
//                         />
//                         <Button
//                           type="button"
//                           variant="ghost"
//                           size="icon"
//                           className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
//                           onClick={() => setShowPassword(!showPassword)}
//                         >
//                           {showPassword ? (
//                             <EyeOffIcon className="h-4 w-4" />
//                           ) : (
//                             <EyeIcon className="h-4 w-4" />
//                           )}
//                         </Button>
//                       </div>
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {error && (
//                 <Alert variant="destructive">
//                   <AlertDescription>{error}</AlertDescription>
//                 </Alert>
//               )}

//               <Button type="submit" className="w-full">
//                 <LockIcon className="mr-2 h-4 w-4" /> Sign In
//               </Button>
//             </form>
//           </Form>
//         </CardContent>
//         <CardFooter className="flex flex-col space-y-2">
//           <Link
//             href="/forgot-password"
//             className="text-sm text-center text-primary hover:underline"
//           >
//             Forgot your password?
//           </Link>
//         </CardFooter>
//       </Card>
//     </div>
//   )
// }

'use client'

import { useState } from 'react'
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
import { EyeIcon, EyeOffIcon, LockIcon } from 'lucide-react'
import { signin } from './signin-api'

export default function SignIn() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (!username || !password) {
      setError('Please fill in all fields.')
      setIsLoading(false)
      return
    }

    try {
      const response = await signin({ username, password })

      if (response.success && response.data?.token) {
        // Log the current user information

        // Store token if remember me is checked
        if (rememberMe) {
          localStorage.setItem('authToken', response.data.token)
        }

        // Store user information in localStorage
        const { userId, userCompanies, userLocations, voucherTypes } =
          response.data.user
        const userInfo = { userId, userCompanies, userLocations, voucherTypes }
        localStorage.setItem('currentUser', JSON.stringify(userInfo))
        console.log('Current user info stored:', userInfo)

        // Redirect to dashboard
        router.push('/dashboard')
      } else {
        setError(response.message || 'Login failed. Please try again.')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('An unexpected error occurred. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
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
          <CardTitle className="text-2xl font-bold text-center">
            Sign in to your account
          </CardTitle>
          <CardDescription className="text-center">
            Enter your username and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
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
                  type={showPassword ? 'text' : 'password'}
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
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember-me"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label
                htmlFor="remember-me"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Remember me
              </Label>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              <LockIcon className="mr-2 h-4 w-4" />
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Link
            href="/forgot-password"
            className="text-sm text-center text-primary hover:underline"
          >
            Forgot your password?
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
