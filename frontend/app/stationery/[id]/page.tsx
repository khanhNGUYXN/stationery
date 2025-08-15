'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  Tag,
  DollarSign,
  Box,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Star,
  Info
} from 'lucide-react';

interface Stationery {
  id: number;
  code: string;
  name: string;
  description: string;
  cost: number;
  stockQuantity: number;
  minimumStock: number;
  category: string;
  brand: string;
  model: string;
  specifications: string;
  imageUrl?: string;
  tags: string[];
}

interface RequestForm {
  quantity: number;
  toDate: string;
  reason: string;
}

export default function StationeryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [stationery, setStationery] = useState<Stationery | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestForm, setRequestForm] = useState<RequestForm>({
    quantity: 1,
    toDate: '',
    reason: ''
  });
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
    const fetchStationery = async () => {
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

        const response = await fetch(`http://localhost:8080/api/stationeries/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            setStationery(null);
            setLoading(false);
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Transform API response to match our interface
        const transformedStationery: Stationery = {
          id: data.id,
          code: data.code,
          name: data.name,
          description: data.description || '',
          cost: data.cost,
          stockQuantity: data.stockQuantity,
          minimumStock: data.minimumStock || 10,
          category: data.category || 'Unknown',
          brand: data.brand || 'Unknown',
          model: data.model || 'Unknown',
          specifications: data.specifications || 'Không có thông số kỹ thuật',
          imageUrl: data.imageUrl,
          tags: data.tags || []
        };

        setStationery(transformedStationery);
        setLoading(false);
      } catch (error) {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Lỗi tải dữ liệu',
          message: 'Không thể tải thông tin sản phẩm. Vui lòng thử lại.',
          actionText: 'Thử lại',
          onAction: () => window.location.reload()
        });
        setLoading(false);
      }
    };

    if (params.id) {
      fetchStationery();
    }
  }, [params.id]);

  const getStockStatus = (quantity: number, minimum: number) => {
    if (quantity === 0) return { status: 'out', text: 'Hết hàng', color: 'text-red-500', bgColor: 'bg-red-50' };
    if (quantity <= minimum) return { status: 'low', text: 'Sắp hết', color: 'text-yellow-500', bgColor: 'bg-yellow-50' };
    return { status: 'available', text: 'Có sẵn', color: 'text-green-500', bgColor: 'bg-green-50' };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
          stationeryId: parseInt(params.id),
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
        title: 'Gửi yêu cầu thành công!',
        message: `Yêu cầu ${result.requestNumber} đã được tạo và gửi đến quản lý để phê duyệt.`,
        actionText: 'Xem yêu cầu của tôi',
        onAction: () => {
          setShowRequestForm(false);
          router.push('/requests/my');
        }
      });
    } catch (error) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Gửi yêu cầu thất bại',
        message: `Có lỗi xảy ra khi tạo yêu cầu: ${error.message}`,
        actionText: 'Thử lại',
        onAction: () => setNotification({ ...notification, isOpen: false })
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải thông tin sản phẩm...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stationery) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="text-center py-12">
            <CardContent>
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Không tìm thấy sản phẩm
              </h3>
              <p className="text-gray-600 mb-4">
                Sản phẩm bạn đang tìm kiếm không tồn tại
              </p>
              <Button onClick={() => router.push('/stationery')}>
                Quay lại danh sách
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus(stationery.stockQuantity, stationery.minimumStock);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => router.push('/stationery')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{stationery.name}</h1>
            <p className="text-gray-600 mt-1">
              {stationery.code} • {stationery.category}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Image */}
            <Card>
              <CardContent className="p-6">
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  {stationery.imageUrl ? (
                    <img 
                      src={stationery.imageUrl} 
                      alt={stationery.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Package className="w-24 h-24 text-gray-400" />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Product Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Thông tin sản phẩm
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Mô tả</h3>
                  <p className="text-gray-600 leading-relaxed">{stationery.description}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Thông số kỹ thuật</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-sm text-gray-700 whitespace-pre-line">{stationery.specifications}</pre>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {stationery.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center gap-1"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price & Stock */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Giá & Tồn kho
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {formatCurrency(stationery.cost)}
                  </div>
                  <p className="text-sm text-gray-500">Giá mỗi đơn vị</p>
                </div>

                <div className={`p-4 rounded-lg ${stockStatus.bgColor}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {stockStatus.status === 'available' && <CheckCircle className="w-4 h-4 text-green-500" />}
                    {stockStatus.status === 'low' && <AlertCircle className="w-4 h-4 text-yellow-500" />}
                    {stockStatus.status === 'out' && <XCircle className="w-4 h-4 text-red-500" />}
                    <span className={`font-medium ${stockStatus.color}`}>
                      {stockStatus.text}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Tồn kho: <span className="font-medium">{stationery.stockQuantity}</span> cái
                  </p>
                  <p className="text-xs text-gray-500">
                    Tối thiểu: {stationery.minimumStock} cái
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Thương hiệu:</span>
                    <span className="font-medium">{stationery.brand}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Model:</span>
                    <span className="font-medium">{stationery.model}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Danh mục:</span>
                    <span className="font-medium">{stationery.category}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Request Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Yêu cầu sản phẩm
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!showRequestForm ? (
                  <Button 
                    className="w-full" 
                    disabled={stockStatus.status === 'out'}
                    onClick={() => setShowRequestForm(true)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Tạo yêu cầu
                  </Button>
                ) : (
                  <form onSubmit={handleRequestSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="quantity">Số lượng</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        max={stationery.stockQuantity}
                        value={requestForm.quantity}
                        onChange={(e) => setRequestForm({
                          ...requestForm,
                          quantity: parseInt(e.target.value) || 1
                        })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="toDate">Ngày cần đến</Label>
                      <Input
                        id="toDate"
                        type="date"
                        value={requestForm.toDate}
                        onChange={(e) => setRequestForm({
                          ...requestForm,
                          toDate: e.target.value
                        })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="reason">Lý do yêu cầu</Label>
                      <Textarea
                        id="reason"
                        placeholder="Mô tả lý do cần sản phẩm này..."
                        value={requestForm.reason}
                        onChange={(e) => setRequestForm({
                          ...requestForm,
                          reason: e.target.value
                        })}
                        rows={3}
                        required
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Gửi yêu cầu
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setShowRequestForm(false)}
                      >
                        Hủy
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Thao tác nhanh</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Star className="w-4 h-4 mr-2" />
                  Thêm vào yêu thích
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Box className="w-4 h-4 mr-2" />
                  Xem sản phẩm tương tự
                </Button>
              </CardContent>
            </Card>
                     </div>
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
