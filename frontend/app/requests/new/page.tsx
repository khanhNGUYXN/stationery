'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { NotificationPopup } from '@/components/ui/notification-popup';
import { 
  ArrowLeft, 
  Package, 
  ShoppingCart,
  Search,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Calendar,
  FileText
} from 'lucide-react';

interface Stationery {
  id: number;
  code: string;
  name: string;
  description: string;
  cost: number;
  stockQuantity: number;
  category: string;
  brand: string;
  model: string;
}

interface RequestForm {
  stationeryId: number | null;
  quantity: number;
  toDate: string;
  reason: string;
}

export default function NewRequestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [stationeries, setStationeries] = useState<Stationery[]>([]);
  const [selectedStationery, setSelectedStationery] = useState<Stationery | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStationeries, setFilteredStationeries] = useState<Stationery[]>([]);
  const [requestForm, setRequestForm] = useState<RequestForm>({
    stationeryId: null,
    quantity: 1,
    toDate: '',
    reason: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
    const fetchStationeries = async () => {
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

        const response = await fetch('http://localhost:8080/api/stationeries?size=100', {
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
        const transformedStationeries: Stationery[] = data.content.map((item: any) => ({
          id: item.id,
          code: item.code,
          name: item.name,
          description: item.description || '',
          cost: item.cost,
          stockQuantity: item.stockQuantity,
          category: item.category || 'Unknown',
          brand: item.brand || 'Unknown',
          model: item.model || 'Unknown'
        }));

        setStationeries(transformedStationeries);
        setFilteredStationeries(transformedStationeries);
        setLoading(false);

        // Check if stationeryId is provided in URL
        const stationeryId = searchParams.get('stationeryId');
        if (stationeryId) {
          const stationery = transformedStationeries.find(s => s.id === parseInt(stationeryId));
          if (stationery) {
            setSelectedStationery(stationery);
            setRequestForm(prev => ({
              ...prev,
              stationeryId: stationery.id
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching stationeries:', error);
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Lỗi tải dữ liệu',
          message: 'Không thể tải danh sách sản phẩm. Vui lòng thử lại.',
          actionText: 'Thử lại',
          onAction: () => window.location.reload()
        });
        setLoading(false);
      }
    };

    fetchStationeries();
  }, [searchParams]);

  useEffect(() => {
    let filtered = stationeries;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredStationeries(filtered);
  }, [searchTerm, stationeries]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const calculateTotalCost = () => {
    if (!selectedStationery) return 0;
    return selectedStationery.cost * requestForm.quantity;
  };

  const handleStationerySelect = (stationery: Stationery) => {
    setSelectedStationery(stationery);
    setRequestForm(prev => ({
      ...prev,
      stationeryId: stationery.id
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStationery) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: 'Thiếu thông tin',
        message: 'Vui lòng chọn sản phẩm trước khi tạo yêu cầu.'
      });
      return;
    }

    if (requestForm.quantity <= 0) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: 'Số lượng không hợp lệ',
        message: 'Số lượng phải lớn hơn 0.'
      });
      return;
    }

    if (requestForm.quantity > selectedStationery.stockQuantity) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: 'Số lượng vượt quá tồn kho',
        message: `Số lượng yêu cầu (${requestForm.quantity}) vượt quá tồn kho hiện có (${selectedStationery.stockQuantity}).`
      });
      return;
    }

    if (!requestForm.toDate) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: 'Thiếu thông tin',
        message: 'Vui lòng chọn ngày cần đến.'
      });
      return;
    }

    if (!requestForm.reason.trim()) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: 'Thiếu thông tin',
        message: 'Vui lòng nhập lý do yêu cầu.'
      });
      return;
    }

    setSubmitting(true);

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

      const response = await fetch('http://localhost:8080/api/requests', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stationeryId: requestForm.stationeryId,
          quantity: requestForm.quantity,
          toDate: requestForm.toDate,
          reason: requestForm.reason
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Tạo yêu cầu thất bại');
      }

      const result = await response.json();
      
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Tạo yêu cầu thành công!',
        message: `Yêu cầu ${result.requestNumber} đã được tạo và gửi đến quản lý để phê duyệt.`,
        actionText: 'Xem yêu cầu của tôi',
        onAction: () => router.push('/requests/my')
      });
    } catch (error) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Tạo yêu cầu thất bại',
        message: `Có lỗi xảy ra khi tạo yêu cầu: ${error.message}`,
        actionText: 'Thử lại',
        onAction: () => setNotification({ ...notification, isOpen: false })
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => router.push('/requests/my')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tạo yêu cầu mới</h1>
            <p className="text-gray-600 mt-2">
              Đăng ký yêu cầu văn phòng phẩm cần thiết
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="md:col-span-2 space-y-6">
              {/* Stationery Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Chọn sản phẩm
                  </CardTitle>
                  <CardDescription>
                    Tìm kiếm và chọn sản phẩm bạn muốn yêu cầu
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Tìm kiếm sản phẩm..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2">
                    <p className="text-sm text-gray-500 mb-2">
                      Tìm thấy {filteredStationeries.length} sản phẩm
                    </p>
                    {filteredStationeries.map((stationery) => (
                      <div
                        key={stationery.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedStationery?.id === stationery.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleStationerySelect(stationery)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium">{stationery.name}</h4>
                            <p className="text-sm text-gray-500">{stationery.code}</p>
                            <p className="text-sm text-gray-600 mt-1">{stationery.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-blue-600">
                              {formatCurrency(stationery.cost)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Tồn: {stationery.stockQuantity}
                            </p>
                          </div>
                        </div>
                        {selectedStationery?.id === stationery.id && (
                          <div className="flex items-center gap-1 mt-2 text-blue-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Đã chọn</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Request Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Chi tiết yêu cầu
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quantity">Số lượng *</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        max={selectedStationery?.stockQuantity || 999}
                        value={requestForm.quantity}
                        onChange={(e) => setRequestForm({
                          ...requestForm,
                          quantity: parseInt(e.target.value) || 1
                        })}
                        required
                      />
                      {selectedStationery && (
                        <p className="text-xs text-gray-500 mt-1">
                          Tối đa: {selectedStationery.stockQuantity} cái
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="toDate">Ngày cần đến *</Label>
                      <Input
                        id="toDate"
                        type="date"
                        value={requestForm.toDate}
                        onChange={(e) => setRequestForm({
                          ...requestForm,
                          toDate: e.target.value
                        })}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="reason">Lý do yêu cầu *</Label>
                    <Textarea
                      id="reason"
                      placeholder="Mô tả chi tiết lý do cần sản phẩm này..."
                      value={requestForm.reason}
                      onChange={(e) => setRequestForm({
                        ...requestForm,
                        reason: e.target.value
                      })}
                      rows={4}
                      required
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Selected Product Summary */}
              {selectedStationery && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Sản phẩm đã chọn
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="font-medium">{selectedStationery.name}</h4>
                      <p className="text-sm text-gray-500">{selectedStationery.code}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Giá:</span>
                        <span className="font-medium">{formatCurrency(selectedStationery.cost)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Số lượng:</span>
                        <span className="font-medium">{requestForm.quantity}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Tồn kho:</span>
                        <span className="font-medium">{selectedStationery.stockQuantity}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Cost Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Tổng chi phí
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {formatCurrency(calculateTotalCost())}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedStationery && `${formatCurrency(selectedStationery.cost)} × ${requestForm.quantity}`}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <Card>
                <CardContent className="pt-6">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={!selectedStationery || submitting}
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Đang tạo...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Tạo yêu cầu
                      </>
                    )}
                  </Button>
                  
                  {!selectedStationery && (
                    <p className="text-sm text-gray-500 text-center mt-2">
                      Vui lòng chọn sản phẩm trước
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Help */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Lưu ý
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Yêu cầu sẽ được gửi đến quản lý để phê duyệt</li>
                    <li>• Bạn có thể rút lại yêu cầu trước khi được phê duyệt</li>
                    <li>• Hãy đảm bảo thông tin chính xác trước khi gửi</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
                 </form>
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
