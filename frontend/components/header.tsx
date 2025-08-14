'use client'

import React from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  LogOut, 
  User, 
  ArrowLeft,
  Home
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  title?: string
  subtitle?: string
  showBackButton?: boolean
  backUrl?: string
  showHomeButton?: boolean
  actionButton?: React.ReactNode
}

export function Header({ 
  title, 
  subtitle, 
  showBackButton = false, 
  backUrl = '/dashboard',
  showHomeButton = false,
  actionButton
}: HeaderProps) {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
  }

  const handleBack = () => {
    router.push(backUrl)
  }

  const handleHome = () => {
    router.push('/dashboard')
  }



  return (
    <div className="flex justify-between items-center mb-8">
      <div className="flex items-center gap-4">
        {showBackButton && (
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        )}
        
        {showHomeButton && (
          <Button variant="outline" onClick={handleHome}>
            <Home className="w-4 h-4 mr-2" />
            Trang chủ
          </Button>
        )}

        <div>
          {title && (
            <h1 className="text-3xl font-bold text-gray-900">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-gray-600 mt-2">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      
      {/* User Info and Logout */}
      <div className="flex items-center gap-4">
        {actionButton}
        
        <Card className="p-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-900">{user?.name}</p>
              <p className="text-gray-500">{user?.employeeNo}</p>
            </div>
          </div>
        </Card>
        
        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Đăng xuất
        </Button>
      </div>
    </div>
  )
}
