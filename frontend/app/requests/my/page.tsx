'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Plus,
  Filter,
  Search
} from 'lucide-react';

interface Request {
  id: number;
  requestNumber: string;
  stationeryName: string;
  stationeryCode: string;
  quantity: number;
  totalCost: number;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'CANCELED' | 'WITHDRAWN';
  toDate: string;
  reason: string;
  createdAt: string;
  approvedAt?: string;
  rejectionReason?: string;
  approverName?: string;
  items?: any[];
}

export default function MyRequestsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [requests, setRequests] = useState<Request[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  // Fetch real data from API
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem('token') || Cookies.get('token');
        if (!token) {
          toast({
            title: "Lỗi",
            description: "Không tìm thấy token đăng nhập",
            variant: "destructive",
          });
          return;
        }

        const response = await fetch('http://localhost:8080/api/requests?mine=true', {
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
          approvedAt: item.approvedAt,
          approverName: item.approver?.name,
          rejectionReason: item.rejectionReason,
          items: item.items || []
        }));

        setRequests(transformedRequests);
        setFilteredRequests(transformedRequests);
      } catch (error) {
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách yêu cầu",
          variant: "destructive",
        });
        // Fallback to mock data if API fails
        const mockData: Request[] = [
          {
            id: 1,
            requestNumber: 'REQ001',
            stationeryName: 'Bút bi xanh',
            stationeryCode: 'PEN001',
            quantity: 10,
            totalCost: 25000,
            status: 'APPROVED',
            toDate: '2024-01-15',
            reason: 'Cần bút cho dự án mới',
            createdAt: '2024-01-10',
            approvedAt: '2024-01-12',
            approverName: 'Mary Manager'
          }
        ];
        setRequests(mockData);
        setFilteredRequests(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const statuses = [
    { value: 'all', label: 'Tất cả', color: 'bg-gray-100 text-gray-800' },
    { value: 'DRAFT', label: 'Nháp', color: 'bg-gray-100 text-gray-800' },
    { value: 'SUBMITTED', label: 'Đã gửi', color: 'bg-blue-100 text-blue-800' },
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
        request.stationeryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.stationeryCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  }, [selectedStatus, searchTerm, requests]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DRAFT': return <FileText className="w-4 h-4" />;
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
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const handleWithdrawClick = (requestId: number) => {
    setSelectedRequestId(requestId);
    setShowWithdrawModal(true);
  };

  const handleWithdrawConfirm = async () => {
    if (!selectedRequestId) return;
    
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        toast({
          title: "Lỗi",
          description: "Không tìm thấy token đăng nhập",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`http://localhost:8080/api/requests/${selectedRequestId}/withdraw`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Rút lại thất bại');
      }

      const withdrawnRequest = await response.json();
      
      toast({
        title: "Thành công",
        description: "Yêu cầu đã được rút lại thành công!",
      });
      
      // Update local state
      setRequests(prev => prev.map(req => 
        req.id === selectedRequestId 
          ? { ...req, status: 'WITHDRAWN' }
          : req
      ));
      
      setShowWithdrawModal(false);
      setSelectedRequestId(null);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: `Lỗi rút lại: ${error instanceof Error ? error.message : 'Không xác định'}`,
        variant: "destructive",
      });
    }
  };

  const handleCancelClick = (requestId: number) => {
    setSelectedRequestId(requestId);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedRequestId || !cancelReason.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập lý do hủy",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        toast({
          title: "Lỗi",
          description: "Không tìm thấy token đăng nhập",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`http://localhost:8080/api/requests/${selectedRequestId}/cancel?reason=${encodeURIComponent(cancelReason)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Hủy thất bại');
      }

      const canceledRequest = await response.json();
      
      toast({
        title: "Thành công",
        description: "Yêu cầu đã được hủy thành công!",
      });
      
      // Update local state
      setRequests(prev => prev.map(req => 
        req.id === selectedRequestId 
          ? { ...req, status: 'CANCELED' }
          : req
      ));
      
      setShowCancelModal(false);
      setSelectedRequestId(null);
      setCancelReason('');
    } catch (error) {
      toast({
        title: "Lỗi",
        description: `Lỗi hủy: ${error instanceof Error ? error.message : 'Không xác định'}`,
        variant: "destructive",
      });
    }
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Yêu cầu của tôi</h1>
              <p className="text-gray-600 mt-2">
                Quản lý và theo dõi các yêu cầu văn phòng phẩm
              </p>
            </div>
          </div>
          <Button onClick={() => router.push('/requests/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Tạo yêu cầu mới
          </Button>
        </div>

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
                    placeholder="Tìm theo mã yêu cầu, tên sản phẩm..."
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
                  aria-label="Lọc theo trạng thái"
                >
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Tìm thấy <span className="font-semibold">{filteredRequests.length}</span> yêu cầu
          </p>
        </div>

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
                        <p className="text-sm text-gray-500">Sản phẩm</p>
                        <p className="font-medium">{request.stationeryName}</p>
                        <p className="text-sm text-gray-500">{request.stationeryCode}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Số lượng</p>
                        <p className="font-medium">{request.quantity} cái</p>
                        <p className="text-sm text-gray-500">Tổng: {formatCurrency(request.totalCost)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Ngày cần</p>
                        <p className="font-medium">{formatDate(request.toDate)}</p>
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
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Chi tiết
                    </Button>
                    
                    {request.status === 'DRAFT' && (
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Chỉnh sửa
                      </Button>
                    )}
                    
                    {request.status === 'SUBMITTED' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleWithdrawClick(request.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Rút lại
                      </Button>
                    )}
                    
                    {request.status === 'APPROVED' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleCancelClick(request.id)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Hủy
                      </Button>
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
                  : 'Bạn chưa có yêu cầu nào. Hãy tạo yêu cầu đầu tiên!'
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
              ) : (
                <Button onClick={() => router.push('/requests/new')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo yêu cầu mới
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Withdraw Confirmation Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Xác nhận rút lại</h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc muốn rút lại yêu cầu này? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowWithdrawModal(false);
                  setSelectedRequestId(null);
                }}
              >
                Hủy
              </Button>
              <Button
                onClick={handleWithdrawConfirm}
                className="bg-red-600 hover:bg-red-700"
              >
                Rút lại
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Hủy yêu cầu</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do hủy
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Nhập lý do hủy yêu cầu..."
              />
            </div>
            <p className="text-gray-600 mb-6">
              Bạn có chắc muốn hủy yêu cầu này? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedRequestId(null);
                  setCancelReason('');
                }}
              >
                Hủy
              </Button>
              <Button
                onClick={handleCancelConfirm}
                className="bg-red-600 hover:bg-red-700"
              >
                Xác nhận hủy
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
