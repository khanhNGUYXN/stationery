'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NotificationPopup } from '@/components/ui/notification-popup';
import { Header } from '@/components/header';
import { AuthGuard } from '@/components/auth-guard';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  Filter,
  Search,
  FileText,
  User,
  Calendar,
  DollarSign,
  AlertCircle
} from 'lucide-react';

interface Request {
  id: number;
  requestNumber: string;
  requesterName: string;
  requesterEmail: string;
  stationeryName: string;
  stationeryCode: string;
  quantity: number;
  totalCost: number;
  status: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'CANCELED' | 'WITHDRAWN';
  toDate: string;
  reason: string;
  createdAt: string;
  submittedAt?: string;
  approverName?: string;
  approvedAt?: string;
  rejectionReason?: string;
  requesterRole: string;
  requesterDepartment: string;
  items?: any[];
}

export default function ApprovalPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<Request[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
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

  // Fetch real data from API
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem('token') || Cookies.get('token');
        if (!token) {
          setNotification({
            isOpen: true,
            type: 'error',
            title: 'Lỗi đăng nhập',
            message: 'Không tìm thấy token đăng nhập. Vui lòng đăng nhập lại.',
            actionText: 'Đăng nhập',
            onAction: () => router.push('/')
          });
          return;
        }

        const response = await fetch('http://localhost:8080/api/requests?all=true', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Transform API response to match our interface
        const transformedRequests: Request[] = data.content.map((item: any) => ({
          id: item.id,
          requestNumber: item.requestNumber,
          requesterName: item.requester?.name || 'Unknown',
          requesterEmail: item.requester?.email || '',
          stationeryName: item.items && item.items.length > 0 ? 
            item.items.length === 1 ? item.items[0].stationeryName : 
            `${item.items.length} sản phẩm` : 'Unknown',
          stationeryCode: item.items && item.items.length > 0 ? 
            item.items.length === 1 ? item.items[0].stationeryCode : 
            `${item.itemCount} items` : '',
          quantity: item.items ? item.items.reduce((sum: number, item: any) => sum + item.quantity, 0) : 0,
          totalCost: item.totalAmount || 0,
          status: item.status,
          toDate: item.toDate,
          reason: item.reason || '',
          createdAt: item.createdAt,
          submittedAt: item.createdAt, // Assuming same as created
          approverName: item.approver?.name,
          approvedAt: item.approvedAt,
          rejectionReason: item.rejectionReason,
          requesterRole: item.requester?.role || 'EMPLOYEE',
          requesterDepartment: item.requester?.department || 'Unknown',
          items: item.items || []
        }));

        setRequests(transformedRequests);
        setFilteredRequests(transformedRequests);
      } catch (error) {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Lỗi tải dữ liệu',
          message: 'Không thể tải danh sách yêu cầu. Vui lòng thử lại.',
          actionText: 'Thử lại',
          onAction: () => window.location.reload()
        });
        // Fallback to mock data if API fails
        const mockData: Request[] = [
          {
            id: 1,
            requestNumber: 'REQ001',
            requesterName: 'Nguyễn Văn A',
            requesterEmail: 'nguyenvana@hmt.com',
            stationeryName: 'Bút bi xanh',
            stationeryCode: 'PEN001',
            quantity: 10,
            totalCost: 25000,
            status: 'SUBMITTED',
            toDate: '2024-01-15',
            reason: 'Cần bút cho dự án mới, team đang thiếu dụng cụ viết',
            createdAt: '2024-01-10',
            submittedAt: '2024-01-10',
            requesterRole: 'EMPLOYEE',
            requesterDepartment: 'Development'
          }
        ];
        setRequests(mockData);
        setFilteredRequests(mockData.filter(r => r.status === 'SUBMITTED'));
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const statuses = [
    { value: 'SUBMITTED', label: 'Chờ phê duyệt', color: 'bg-blue-100 text-blue-800' },
    { value: 'APPROVED', label: 'Đã phê duyệt', color: 'bg-green-100 text-green-800' },
    { value: 'REJECTED', label: 'Từ chối', color: 'bg-red-100 text-red-800' },
    { value: 'CANCELED', label: 'Đã hủy', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'WITHDRAWN', label: 'Rút lại', color: 'bg-purple-100 text-purple-800' }
  ];

  useEffect(() => {
    let filtered = requests;

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(request => request.status === selectedStatus);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.stationeryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.stationeryCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  }, [selectedStatus, searchTerm, requests]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUBMITTED': return <Clock className="w-4 h-4" />;
      case 'APPROVED': return <CheckCircle className="w-4 h-4" />;
      case 'REJECTED': return <XCircle className="w-4 h-4" />;
      case 'CANCELED': return <AlertCircle className="w-4 h-4" />;
      case 'WITHDRAWN': return <AlertCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const handleApprove = async (requestId: number) => {
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

        const response = await fetch(`http://localhost:8080/api/requests/${requestId}/approve`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Phê duyệt thất bại');
        }

        const approvedRequest = await response.json();
        
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Phê duyệt thành công!',
          message: `Yêu cầu ${approvedRequest.requestNumber} đã được phê duyệt thành công.`,
          actionText: 'Đóng',
          onAction: () => setNotification({ ...notification, isOpen: false })
        });
        
        // Update local state
        setRequests(prev => prev.map(req => 
          req.id === requestId 
            ? { 
                ...req, 
                status: 'APPROVED', 
                approvedAt: approvedRequest.approvedAt || new Date().toISOString(), 
                approverName: approvedRequest.approver?.name || 'Current User' 
              }
            : req
        ));
      } catch (error) {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Phê duyệt thất bại',
          message: `Lỗi phê duyệt: ${error instanceof Error ? error.message : 'Không xác định'}`,
          actionText: 'Thử lại',
          onAction: () => setNotification({ ...notification, isOpen: false })
        });
      }
  };

  const handleReject = async (requestId: number) => {
    if (!rejectionReason.trim()) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: 'Thiếu thông tin',
        message: 'Vui lòng nhập lý do từ chối trước khi thực hiện.'
      });
      return;
    }

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

        const response = await fetch(`http://localhost:8080/api/requests/${requestId}/reject?reason=${encodeURIComponent(rejectionReason)}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Từ chối thất bại');
        }

        const rejectedRequest = await response.json();
        
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Từ chối thành công!',
          message: `Yêu cầu ${rejectedRequest.requestNumber} đã được từ chối với lý do: "${rejectionReason}"`,
          actionText: 'Đóng',
          onAction: () => setNotification({ ...notification, isOpen: false })
        });
        
        // Update local state
        setRequests(prev => prev.map(req => 
          req.id === requestId 
            ? { ...req, status: 'REJECTED', rejectionReason }
            : req
        ));
        
        setRejectionReason('');
        setShowDetailModal(false);
      } catch (error) {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Từ chối thất bại',
          message: `Lỗi từ chối: ${error instanceof Error ? error.message : 'Không xác định'}`,
          actionText: 'Thử lại',
          onAction: () => setNotification({ ...notification, isOpen: false })
        });
      }
  };

  const handleViewDetail = (request: Request) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải danh sách yêu cầu...</p>
                   </div>
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
     </div>
   );
 }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <Header 
            title="Phê duyệt yêu cầu"
            subtitle="Duyệt và quản lý yêu cầu văn phòng phẩm từ nhân viên"
            showHomeButton={true}
          />

          {/* Filters */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Bộ lọc & Tìm kiếm
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tìm kiếm
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Tìm theo mã yêu cầu, tên nhân viên, sản phẩm..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label="Lọc theo trạng thái yêu cầu"
                  >
                    <option value="all">Tất cả</option>
                    <option value="SUBMITTED">Chờ phê duyệt</option>
                    <option value="APPROVED">Đã phê duyệt</option>
                    <option value="REJECTED">Từ chối</option>
                    <option value="CANCELED">Đã hủy</option>
                    <option value="WITHDRAWN">Rút lại</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Count and Stats */}
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <p className="text-gray-600">
                Tìm thấy <span className="font-semibold">{filteredRequests.length}</span> yêu cầu
              </p>
              
              {/* Stats */}
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Chờ phê duyệt: {requests.filter(r => r.status === 'SUBMITTED').length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Đã phê duyệt: {requests.filter(r => r.status === 'APPROVED').length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Từ chối: {requests.filter(r => r.status === 'REJECTED').length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span>Đã hủy: {requests.filter(r => r.status === 'CANCELED').length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span>Rút lại: {requests.filter(r => r.status === 'WITHDRAWN').length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Canceled Requests Section */}
          {selectedStatus === 'all' && requests.filter(r => r.status === 'CANCELED').length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                <h2 className="text-lg font-semibold text-gray-900">Yêu cầu đã hủy</h2>
                <Badge className="bg-orange-100 text-orange-800">
                  {requests.filter(r => r.status === 'CANCELED').length}
                </Badge>
              </div>
              
              <div className="space-y-3">
                {requests.filter(r => r.status === 'CANCELED').slice(0, 3).map((request) => (
                  <Card key={request.id} className="border-orange-200 bg-orange-50">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{request.requestNumber}</h4>
                            <Badge className="bg-orange-100 text-orange-800 text-xs">
                              Đã hủy
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>{request.requesterName}</strong> • {request.stationeryName} • {formatCurrency(request.totalCost)}
                          </p>
                          {request.rejectionReason && (
                            <div className="p-2 bg-white border border-orange-200 rounded text-xs">
                              <strong>Lý do hủy:</strong> {request.rejectionReason}
                            </div>
                          )}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetail(request)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Chi tiết
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {requests.filter(r => r.status === 'CANCELED').length > 3 && (
                  <div className="text-center">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedStatus('CANCELED')}
                    >
                      Xem tất cả {requests.filter(r => r.status === 'CANCELED').length} yêu cầu đã hủy
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Requests List */}
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold">{request.requestNumber}</h3>
                        <Badge className={statuses.find(s => s.value === request.status)?.color}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1">{statuses.find(s => s.value === request.status)?.label}</span>
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Người yêu cầu</p>
                          <p className="font-medium">{request.requesterName}</p>
                          <p className="text-sm text-gray-500">{request.requesterEmail}</p>
                          <p className="text-xs text-gray-400">{request.requesterDepartment}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Sản phẩm</p>
                          <p className="font-medium">{request.stationeryName}</p>
                          <p className="text-sm text-gray-500">{request.stationeryCode}</p>
                          <p className="text-sm text-gray-500">SL: {request.quantity} • {formatCurrency(request.totalCost)}</p>
                          
                          {request.items && request.items.length > 1 && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                              <p className="font-medium mb-1">Chi tiết sản phẩm:</p>
                              {request.items.map((item: any, index: number) => (
                                <div key={index} className="flex justify-between">
                                  <span>{item.stationeryName} ({item.quantity})</span>
                                  <span>{formatCurrency(item.totalCost)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Thời gian</p>
                          <p className="font-medium">Cần đến: {formatDate(request.toDate)}</p>
                          <p className="text-sm text-gray-500">Tạo: {formatDate(request.createdAt)}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-500">Lý do yêu cầu</p>
                        <p className="text-gray-700">{request.reason}</p>
                      </div>

                      {request.rejectionReason && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-600">
                            <strong>Lý do từ chối:</strong> {request.rejectionReason}
                          </p>
                        </div>
                      )}

                      {request.status === 'CANCELED' && request.rejectionReason && (
                        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <p className="text-sm text-orange-600">
                            <strong>Lý do hủy:</strong> {request.rejectionReason}
                          </p>
                        </div>
                      )}

                      {request.approverName && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-600">
                            <strong>Phê duyệt bởi:</strong> {request.approverName} 
                            {request.approvedAt && ` vào ${formatDate(request.approvedAt)}`}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetail(request)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Chi tiết
                      </Button>
                      
                      {request.status === 'SUBMITTED' && (
                        <>
                          <Button 
                            size="sm"
                            onClick={() => handleApprove(request.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Phê duyệt
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowDetailModal(true);
                            }}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Từ chối
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredRequests.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Không có yêu cầu nào
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || selectedStatus !== 'all' 
                    ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                    : 'Hiện tại không có yêu cầu nào'
                  }
                </p>
                {searchTerm || selectedStatus !== 'all' ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedStatus('all');
                    }}
                  >
                    Xóa bộ lọc
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedRequest && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowDetailModal(false)}
          >
            <div 
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold">Chi tiết yêu cầu {selectedRequest.requestNumber}</h2>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowDetailModal(false)}
                  >
                    ✕
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Người yêu cầu</p>
                      <p className="font-medium">{selectedRequest.requesterName}</p>
                      <p className="text-sm text-gray-500">{selectedRequest.requesterEmail}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phòng ban</p>
                      <p className="font-medium">{selectedRequest.requesterDepartment}</p>
                      <p className="text-sm text-gray-500">{selectedRequest.requesterRole}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Sản phẩm</p>
                      <p className="font-medium">{selectedRequest.stationeryName}</p>
                      <p className="text-sm text-gray-500">{selectedRequest.stationeryCode}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Số lượng & Chi phí</p>
                      <p className="font-medium">{selectedRequest.quantity} cái</p>
                      <p className="font-medium">{formatCurrency(selectedRequest.totalCost)}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Ngày cần đến</p>
                    <p className="font-medium">{formatDate(selectedRequest.toDate)}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Lý do yêu cầu</p>
                    <p className="text-gray-700">{selectedRequest.reason}</p>
                  </div>

                  {selectedRequest.status === 'SUBMITTED' && (
                    <div className="border-t pt-4">
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Lý do từ chối (nếu có)
                        </label>
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={3}
                          placeholder="Nhập lý do từ chối (bắt buộc)"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleApprove(selectedRequest.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Phê duyệt
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => handleReject(selectedRequest.id)}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Từ chối
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => setShowDetailModal(false)}
                        >
                          Hủy
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
