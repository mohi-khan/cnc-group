'use client'

import { atom, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User } from './type'

// Atom for full user data
export const userDataAtom = atom<User | null>(null)
export const isUserLoadingAtom = atom(true)

// Hook to initialize user from localStorage
export const useInitializeUser = () => {
  const setUserData = useSetAtom(userDataAtom)
  const setIsLoading = useSetAtom(isUserLoadingAtom)
  const router = useRouter()

  useEffect(() => {
    const loadUser = () => {
      setIsLoading(true)

      const userStr = localStorage.getItem('currentUser')
      if (userStr) {
        const parsedUser = JSON.parse(userStr)

        setUserData(parsedUser)
        console.log('User loaded:', parsedUser.userId)
      } else {
        console.log('No user data in localStorage')
        setUserData(null)
      }
      setIsLoading(false)
    }

    if (typeof window !== 'undefined') {
      loadUser()
    }
  }, [setUserData, setIsLoading, router])
}
