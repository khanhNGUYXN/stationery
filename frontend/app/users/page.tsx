'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Header } from '@/components/header'
import { AuthGuard } from '@/components/auth-guard'
import Cookies from 'js-cookie'

interface User {
  id: number
  employeeNo: string
  name: string
  email: string
  approvalStatus: string
  username: string
  role: string
  location: string
  superiorEmployeeNo: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingUser, setUpdatingUser] = useState<number | null>(null)
  const [approvingUser, setApprovingUser] = useState<number | null>(null)
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const { toast } = useToast()
  const { user } = useAuth()

  // Filter users based on selected filters
  const filteredUsers = users.filter(user => {
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.isActive && user.approvalStatus === 'APPROVED') ||
      (statusFilter === 'disabled' && !user.isActive) ||
      (statusFilter === 'waiting' && user.approvalStatus === 'PENDING')
    return matchesRole && matchesStatus
  })

  // Calculate statistics based on filtered users
  const totalUsers = filteredUsers.length
  const activeUsers = filteredUsers.filter(user => user.isActive && user.approvalStatus === 'APPROVED').length
  const inactiveUsers = filteredUsers.filter(user => !user.isActive).length
  const waitingUsers = filteredUsers.filter(user => user.approvalStatus === 'PENDING').length

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token') || Cookies.get('token')
      if (!token) {
        throw new Error('No authentication token')
      }

      const response = await fetch('http://localhost:8080/api/auth/users?size=100', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      
      const data = await response.json()
      setUsers(data.content || [])
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách người dùng',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: number, newRole: string) => {
    setUpdatingUser(userId)
    try {
      const token = localStorage.getItem('token') || Cookies.get('token')
      if (!token) {
        throw new Error('No authentication token')
      }

      const response = await fetch(`http://localhost:8080/api/auth/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) {
        throw new Error('Failed to update user role')
      }

      toast({
        title: 'Thành công',
        description: 'Cập nhật quyền người dùng thành công',
      })

      // Refresh users list
      fetchUsers()
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật quyền người dùng',
        variant: 'destructive',
      })
    } finally {
      setUpdatingUser(null)
    }
  }

  const updateUserStatus = async (userId: number, isActive: boolean) => {
    setUpdatingUser(userId)
    try {
      const token = localStorage.getItem('token') || Cookies.get('token')
      if (!token) {
        throw new Error('No authentication token')
      }

      const response = await fetch(`http://localhost:8080/api/auth/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      })

      if (!response.ok) {
        throw new Error('Failed to update user status')
      }

      toast({
        title: 'Thành công',
        description: `Người dùng đã được ${isActive ? 'kích hoạt' : 'vô hiệu hóa'}`,
      })

      // Refresh users list
      fetchUsers()
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật trạng thái người dùng',
        variant: 'destructive',
      })
    } finally {
      setUpdatingUser(null)
    }
  }

  const approveUser = async (userId: number) => {
    setApprovingUser(userId)
    try {
      const token = localStorage.getItem('token') || Cookies.get('token')
      if (!token) {
        throw new Error('No authentication token')
      }

      const response = await fetch(`http://localhost:8080/api/auth/users/${userId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to approve user')
      }

      toast({
        title: 'Thành công',
        description: 'Người dùng đã được phê duyệt',
      })

      // Refresh users list
      fetchUsers()
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể phê duyệt người dùng',
        variant: 'destructive',
      })
    } finally {
      setApprovingUser(null)
    }
  }

  const rejectUser = async (userId: number) => {
    setApprovingUser(userId)
    try {
      const token = localStorage.getItem('token') || Cookies.get('token')
      if (!token) {
        throw new Error('No authentication token')
      }

      const response = await fetch(`http://localhost:8080/api/auth/users/${userId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to reject user')
      }

      toast({
        title: 'Thành công',
        description: 'Người dùng đã bị từ chối',
      })

      // Refresh users list
      fetchUsers()
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể từ chối người dùng',
        variant: 'destructive',
      })
    } finally {
      setApprovingUser(null)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-red-100 text-red-800'
      case 'MANAGER':
        return 'bg-blue-100 text-blue-800'
      case 'EMPLOYEE':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getApprovalStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Đang tải...</div>
        </div>
      </div>
    )
  }

  // Check if user has SUPER_ADMIN role
  if (!user || user.role !== 'SUPER_ADMIN') {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-lg text-red-600">Bạn không có quyền truy cập trang này</p>
            <p className="text-sm text-gray-600">Yêu cầu quyền Super Admin</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="container mx-auto p-6">
        <Header 
          title="Quản lý người dùng"
          subtitle="Quản lý tài khoản và quyền hạn của người dùng trong hệ thống"
          showHomeButton={true}
        />

        {/* Filter Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Bộ lọc</CardTitle>
            <CardDescription>Lọc người dùng theo quyền hạn và trạng thái</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Quyền hạn</label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn quyền hạn" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả quyền hạn</SelectItem>
                    <SelectItem value="EMPLOYEE">Employee</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Trạng thái</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="active">Đang hoạt động</SelectItem>
                    <SelectItem value="disabled">Bị vô hiệu hóa</SelectItem>
                    <SelectItem value="waiting">Chờ phê duyệt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setRoleFilter('all')
                    setStatusFilter('all')
                  }}
                  disabled={roleFilter === 'all' && statusFilter === 'all'}
                  className="w-full"
                >
                  Xóa bộ lọc
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tổng số tài khoản</p>
                  <p className="text-2xl font-bold">{totalUsers}</p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Đang hoạt động</p>
                  <p className="text-2xl font-bold text-green-600">{activeUsers}</p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Bị vô hiệu hóa</p>
                  <p className="text-2xl font-bold text-red-600">{inactiveUsers}</p>
                </div>
                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Chờ phê duyệt</p>
                  <p className="text-2xl font-bold text-yellow-600">{waitingUsers}</p>
                </div>
                <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="h-4 w-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {user.name}
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {user.role}
                    </Badge>
                    <Badge className={getApprovalStatusBadgeColor(user.approvalStatus)}>
                      {user.approvalStatus}
                    </Badge>
                    {!user.isActive && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                        Vô hiệu hóa
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {user.employeeNo} • {user.email}
                  </CardDescription>
                </div>
                <div className="text-sm text-muted-foreground">
                  Tạo: {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium">Tên đăng nhập</label>
                  <p className="text-sm text-muted-foreground">{user.username}</p>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium">Quyền hạn</label>
                  <Select
                    value={user.role}
                    onValueChange={(value) => updateUserRole(user.id, value)}
                    disabled={updatingUser === user.id}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EMPLOYEE">Employee</SelectItem>
                      <SelectItem value="MANAGER">Manager</SelectItem>
                      <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Button
                    variant={user.isActive ? "destructive" : "default"}
                    size="sm"
                    onClick={() => updateUserStatus(user.id, !user.isActive)}
                    disabled={updatingUser === user.id}
                  >
                    {updatingUser === user.id ? 'Đang cập nhật...' : 
                     user.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                {user.approvalStatus === 'PENDING' && (
                  <>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => approveUser(user.id)}
                      disabled={approvingUser === user.id}
                    >
                      {approvingUser === user.id ? 'Đang duyệt...' : 'Phê duyệt'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => rejectUser(user.id)}
                      disabled={approvingUser === user.id}
                    >
                      {approvingUser === user.id ? 'Đang từ chối...' : 'Từ chối'}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">
              {users.length === 0 ? 'Không có người dùng nào' : 'Không có người dùng nào phù hợp với bộ lọc'}
            </p>
          </CardContent>
        </Card>
      )}
      </div>
    </AuthGuard>
  )
}
