import { useState } from 'react'

const [user, setUser] = useState([])
export const userData = () => {
  const userStr = localStorage.getItem('currentUser')
  if (userStr) {
    const userData = JSON.parse(userStr)
    setUser(userData?.userId)
    console.log(
      'Current userId from localStorage in everywhere:',
      userData.userId
    )
  } else {
    console.log('No user data found in localStorage')
  }
}
