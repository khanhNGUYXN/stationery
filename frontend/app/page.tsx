'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function HomePage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  // Register form state
  const [registerData, setRegisterData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: ''
  })
  const [isRegisterLoading, setIsRegisterLoading] = useState(false)
  
  const router = useRouter()
  const { toast } = useToast()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login(username, password)
      toast({
        title: 'Đăng nhập thành công',
        description: 'Chào mừng đến với Hệ thống Quản lý Văn phòng phẩm',
      })
      // Redirect is handled in useAuth hook
    } catch (error) {
      toast({
        title: 'Đăng nhập thất bại',
        description: 'Tên đăng nhập hoặc mật khẩu không đúng',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsRegisterLoading(true)

    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Đăng ký thất bại')
      }

      const userData = await response.json()
      toast({
        title: 'Đăng ký thành công',
        description: `Tài khoản ${userData.username} đã được tạo thành công!`,
      })
      
      // Reset form
      setRegisterData({
        fullName: '',
        email: '',
        username: '',
        password: ''
      })
    } catch (error: any) {
      toast({
        title: 'Đăng ký thất bại',
        description: error.message || 'Có lỗi xảy ra khi đăng ký',
        variant: 'destructive',
      })
    } finally {
      setIsRegisterLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              🧠 Stationery Management
            </CardTitle>
            <CardDescription className="text-center">
              HMT Technologies - Hệ thống quản lý văn phòng phẩm
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Đăng nhập</TabsTrigger>
                <TabsTrigger value="register">Đăng ký</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Tên đăng nhập</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Nhập tên đăng nhập"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Mật khẩu</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Nhập mật khẩu"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                  </Button>
                </form>
                
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Tài khoản demo:</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Employee:</strong> employee / password</div>
                    <div><strong>Manager:</strong> manager / password</div>
                    <div><strong>Super Admin:</strong> admin / password</div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="register" className="space-y-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Họ và tên</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Nhập họ và tên"
                      value={registerData.fullName}
                      onChange={(e) => setRegisterData({...registerData, fullName: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@hmt.com"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="regUsername">Tên đăng nhập</Label>
                    <Input
                      id="regUsername"
                      type="text"
                      placeholder="Tên đăng nhập (3-20 ký tự)"
                      value={registerData.username}
                      onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="regPassword">Mật khẩu</Label>
                    <Input
                      id="regPassword"
                      type="password"
                      placeholder="Mật khẩu (tối thiểu 6 ký tự)"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isRegisterLoading}>
                    {isRegisterLoading ? 'Đang đăng ký...' : 'Đăng ký'}
                  </Button>
                </form>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Lưu ý:</strong> Tài khoản mới sẽ được tạo với quyền <strong>Employee</strong>. 
                    Super Admin có thể thay đổi quyền sau khi đăng ký.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
