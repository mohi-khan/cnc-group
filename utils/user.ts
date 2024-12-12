import { useState } from 'react'

export const userData = () => {
  const [user, setUser] = useState([])

  const userStr = localStorage.getItem('currentUser')
  if (userStr) {
    const userData = JSON.parse(userStr)
    setUser(userData)
    console.log(
      'Current userId from localStorage in everywhere:',
      userData.userId
    )
  } else {
    console.log('No user data found in localStorage')
  }
}
