'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import Cookies from 'js-cookie';
import { AuthGuard } from '@/components/auth-guard';
import { NotificationPopup } from '@/components/ui/notification-popup';
import { ProfileModal } from '@/components/profile-modal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  FileText, 
  Users, 
  Settings,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  LogOut,
  User
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    totalStationeries: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    actionText?: string;
    onAction?: () => void;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'EMPLOYEE': return 'Nhân viên';
      case 'MANAGER': return 'Quản lý';
      case 'SUPER_ADMIN': return 'Quản trị viên';
      default: return role;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return 'Vừa xong';
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else if (diffInDays < 7) {
      return `${diffInDays} ngày trước`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return {
          icon: Plus,
          color: 'bg-blue-100 text-blue-600',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          label: 'Chờ phê duyệt'
        };
      case 'APPROVED':
        return {
          icon: CheckCircle,
          color: 'bg-green-100 text-green-600',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          label: 'Đã phê duyệt'
        };
      case 'REJECTED':
        return {
          icon: AlertCircle,
          color: 'bg-red-100 text-red-600',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          label: 'Từ chối'
        };
      case 'CANCELED':
        return {
          icon: AlertCircle,
          color: 'bg-yellow-100 text-yellow-600',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          label: 'Đã hủy'
        };
      default:
        return {
          icon: AlertCircle,
          color: 'bg-gray-100 text-gray-600',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          label: status
        };
    }
  };

  const getQuickActions = (role: string) => {
    const baseActions = [
      {
        title: 'Văn phòng phẩm',
        description: 'Xem danh sách sản phẩm',
        icon: Package,
        href: '/stationery',
        color: 'bg-blue-500'
      },
      {
        title: 'Yêu cầu của tôi',
        description: 'Quản lý yêu cầu cá nhân',
        icon: FileText,
        href: '/requests/my',
        color: 'bg-green-500'
      }
    ];

    if (role === 'MANAGER' || role === 'SUPER_ADMIN') {
      baseActions.push({
        title: 'Phê duyệt yêu cầu',
        description: 'Duyệt yêu cầu từ nhân viên',
        icon: CheckCircle,
        href: '/requests/approval',
        color: 'bg-purple-500'
      });
    }



    if (role === 'SUPER_ADMIN') {
      baseActions.push({
        title: 'Quản lý người dùng',
        description: 'Quản lý tài khoản và quyền hạn',
        icon: Users,
        href: '/users',
        color: 'bg-indigo-500'
      });
      

    }

    return baseActions;
  };

  const quickActions = getQuickActions(user?.role || '');

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token') || Cookies.get('token');
        if (!token) {
          setNotification({
            isOpen: true,
            type: 'error',
            title: 'Phiên đăng nhập hết hạn',
            message: 'Vui lòng đăng nhập lại để tiếp tục.',
            actionText: 'Đăng nhập',
            onAction: () => router.push('/')
          });
          return;
        }

        // Fetch requests stats - Manager and Super Admin see all requests, others see their own
        const isManagerOrAdmin = user?.role === 'MANAGER' || user?.role === 'SUPER_ADMIN';
        const requestsUrl = isManagerOrAdmin 
          ? 'http://localhost:8080/api/requests?all=true&size=1000'
          : 'http://localhost:8080/api/requests?mine=true&size=1000';
          
        const requestsResponse = await fetch(requestsUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (requestsResponse.ok) {
          const requestsData = await requestsResponse.json();
          const totalRequests = requestsData.totalElements;
          const pendingRequests = requestsData.content.filter((req: any) => req.status === 'SUBMITTED').length;
          const approvedRequests = requestsData.content.filter((req: any) => req.status === 'APPROVED').length;

          // Fetch stationeries count
          const stationeriesResponse = await fetch('http://localhost:8080/api/stationeries?size=1', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          let totalStationeries = 0;
          if (stationeriesResponse.ok) {
            const stationeriesData = await stationeriesResponse.json();
            totalStationeries = stationeriesData.totalElements;
          }

          setStats({
            totalRequests,
            pendingRequests,
            approvedRequests,
            totalStationeries
          });

          // Fetch recent activities (latest 5 requests)
          const recentActivitiesData = requestsData.content
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5)
            .map((request: any) => ({
              id: request.id,
              type: 'request',
              title: `Yêu cầu: ${request.items?.[0]?.stationeryName || 'Nhiều sản phẩm'}`,
              status: request.status,
              createdAt: request.createdAt,
              requesterName: request.requesterName
            }));

          setRecentActivities(recentActivitiesData);
        }
      } catch (error) {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Lỗi tải dữ liệu',
          message: 'Không thể tải thống kê dashboard. Vui lòng thử lại.',
          actionText: 'Thử lại',
          onAction: () => window.location.reload()
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const handleLogout = () => {
    logout();
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header with Logout */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Chào mừng, {user?.name}!
              </h1>
              <p className="text-gray-600 mt-2">
                Vai trò: {getRoleDisplayName(user?.role || '')} • {user?.location}
              </p>
            </div>
            
            {/* User Info and Logout */}
            <div className="flex items-center gap-4">
              <Card className="p-3 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setShowProfileModal(true)}>
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

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Yêu cầu của tôi</p>
                    <p className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.totalRequests}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Chờ phê duyệt</p>
                    <p className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.pendingRequests}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Đã phê duyệt</p>
                    <p className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.approvedRequests}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Sản phẩm</p>
                    <p className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.totalStationeries}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Thao tác nhanh</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <Card 
                  key={index} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => router.push(action.href)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className={`p-3 rounded-lg ${action.color} bg-opacity-10`}>
                        <action.icon className={`w-6 h-6 ${action.color.replace('bg-', 'text-')}`} />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-semibold text-gray-900">{action.title}</h3>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Hoạt động gần đây</CardTitle>
              <CardDescription>
                Các yêu cầu và hoạt động mới nhất
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Chưa có hoạt động nào</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivities.map((activity: any) => {
                    const statusInfo = getStatusInfo(activity.status);
                    const StatusIcon = statusInfo.icon;
                    
                    return (
                      <div key={activity.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className={`p-2 rounded-lg ${statusInfo.color}`}>
                          <StatusIcon className="w-4 h-4" />
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="font-medium">{activity.title}</p>
                          <p className="text-sm text-gray-600">
                            {activity.requesterName} • {formatTimeAgo(activity.createdAt)}
                          </p>
                        </div>
                        <div className="ml-auto">
                          <span className={`px-2 py-1 ${statusInfo.bgColor} ${statusInfo.textColor} text-xs rounded-full`}>
                            {statusInfo.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notification Popup */}
        <NotificationPopup
          isOpen={notification.isOpen}
          onClose={() => setNotification({ ...notification, isOpen: false })}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          actionText={notification.actionText}
          onAction={notification.onAction}
        />

        {/* Profile Modal */}
        <ProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          user={user}
          onUpdate={() => {
            // No need to reload, user data is updated via useAuth hook
          }}
        />
      </div>
    </AuthGuard>
  );
}
