'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

interface User {
  id: number
  employeeNo: string
  name: string
  role: string
  email: string
  grade: string
  location: string
  username: string
}

interface LoginResponse {
  token: string
  refreshToken: string
  employee: User
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = Cookies.get('token') || localStorage.getItem('token')
    const userData = Cookies.get('user')
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error('Error parsing user data:', error)
        logout()
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string): Promise<void> => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Login failed')
      }

      const data: LoginResponse = await response.json()
      
      // Store tokens and user data
      Cookies.set('token', data.token, { expires: 7 })
      Cookies.set('refreshToken', data.refreshToken, { expires: 30 })
      Cookies.set('user', JSON.stringify(data.employee), { expires: 7 })
      
      // Also store token in localStorage for API calls
      localStorage.setItem('token', data.token)
      
      setUser(data.employee)
      
      // Redirect to dashboard after successful login
      router.push('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = () => {
    Cookies.remove('token')
    Cookies.remove('refreshToken')
    Cookies.remove('user')
    localStorage.removeItem('token')
    setUser(null)
    router.push('/')
  }

  const getToken = (): string | undefined => {
    return Cookies.get('token') || localStorage.getItem('token') || undefined
  }

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
    Cookies.set('user', JSON.stringify(updatedUser), { expires: 7 })
  }

  return {
    user,
    isLoading,
    login,
    logout,
    getToken,
    updateUser,
    isAuthenticated: !!user,
  }
}
