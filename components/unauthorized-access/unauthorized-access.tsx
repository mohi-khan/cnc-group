// import Link from 'next/link'
// import { Button } from '@/components/ui/button'

// export default function UnauthorizedAccess() {
//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
//       <h1 className="text-6xl font-bold mb-4 text-center">
//         Unauthorized Access
//       </h1>
//       <p className="text-2xl mb-8 text-center">
//         You are not authorized to access this page
//       </p>
//       <Button asChild>
//         <Link href="/dashboard">Return to Dashboard</Link>
//       </Button>
//     </div>
//   )
// }

'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function UnauthorizedAccess() {
  useEffect(() => {
    const timer = setTimeout(() => {
      // Clear token or session (if you store auth info in localStorage)
      localStorage.removeItem('token')
      localStorage.removeItem('user')

      // Redirect to login page
      window.location.href = '/'
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <h1 className="text-6xl font-bold mb-4 text-center">
        Unauthorized Access
      </h1>
      <p className="text-2xl mb-8 text-center">
        You are not authorized to access this page
      </p>

      <Button asChild>
        <Link href="/dashboard">Return to Dashboard</Link>
      </Button>

      <p className="mt-6 text-lg text-center text-gray-500">
        Logging out… Redirecting to login page.
      </p>
    </div>
  )
}
