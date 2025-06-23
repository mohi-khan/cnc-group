import React from 'react'
import { Button } from '../ui/button'
import Link from 'next/link'

const ContactToAdmin = () => {
  return (
    <div>
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
        <h1 className="text-6xl font-bold mb-4 text-center">
          Contact Administration
        </h1>
        <p className="text-2xl mb-8 text-center">
          Please contact your system administrator to reset your password
        </p>
       
        <Button asChild>
          <Link href="/">Back to Login</Link>
        </Button>
      </div>
    </div>
  )
}

export default ContactToAdmin