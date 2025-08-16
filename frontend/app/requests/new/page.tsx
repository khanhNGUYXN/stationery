'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, X } from 'lucide-react';
import Cookies from 'js-cookie';

interface Stationery {
  id: number;
  code: string;
  name: string;
  cost: number;
  stockQuantity: number;
  imageUrl?: string;
}

interface RequestItem {
  stationeryId: number;
  quantity: number;
  stationery?: Stationery;
}

export default function NewRequestPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stationeries, setStationeries] = useState<Stationery[]>([]);
  const [items, setItems] = useState<RequestItem[]>([]);
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Thêm delay nhỏ để tránh race condition
    const timer = setTimeout(() => {
      if (user === null) {
        router.push('/');
        return;
      }
      
      if (user) {
        fetchStationeries();
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [user, router]);

    const fetchStationeries = async () => {
      try {
        const token = localStorage.getItem('token') || Cookies.get('token');
      
      const response = await fetch('http://localhost:8080/api/stationeries', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

      if (response.ok) {
        const data = await response.json();
        setStationeries(data.content || data);
        }
      } catch (error) {
      // Silent error handling
    }
  };

  const addItem = () => {
    // Check if there's an empty item (stationeryId = 0)
    const hasEmptyItem = items.some(item => item.stationeryId === 0);
    
    if (!hasEmptyItem) {
      setItems([...items, { stationeryId: 0, quantity: 1 }]);
    }
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof RequestItem, value: any) => {
    const newItems = [...items];
    
    if (field === 'stationeryId') {
      // Check if this stationery is already in the list
      const existingIndex = newItems.findIndex((item, i) => 
        i !== index && item.stationeryId === value && value !== 0
      );
      
      if (existingIndex !== -1) {
        // If stationery already exists, increase quantity and remove current item
        const existingStationery = getSelectedStationery(value);
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + newItems[index].quantity
        };
        newItems.splice(index, 1);
        
        // Show message
        setMessage(`Đã gộp vào sản phẩm "${existingStationery?.name}" (tăng số lượng)`);
        setTimeout(() => setMessage(''), 3000);
      } else {
        // Update the current item
        newItems[index] = { ...newItems[index], [field]: value };
      }
    } else {
      // For other fields (like quantity), just update normally
      newItems[index] = { ...newItems[index], [field]: value };
    }
    
    setItems(newItems);
  };

  const getSelectedStationery = (stationeryId: number) => {
    return stationeries.find(s => s.id === stationeryId);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const stationery = getSelectedStationery(item.stationeryId);
      if (stationery) {
        return total + (stationery.cost * item.quantity);
      }
      return total;
    }, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      setError('Vui lòng thêm ít nhất một sản phẩm');
      return;
    }

    if (items.some(item => item.stationeryId === 0)) {
      setError('Vui lòng chọn đầy đủ sản phẩm');
      return;
    }

    if (!toDate || !reason) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token') || Cookies.get('token');
      const response = await fetch('http://localhost:8080/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: items,
          toDate: toDate,
          reason: reason,
        }),
      });

      if (response.ok) {
        router.push('/requests/my');
      } else {
        const errorData = await response.json();
        setError(errorData.errorMessage || errorData.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      setError('Có lỗi xảy ra khi tạo yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Tạo yêu cầu mới</h1>
          <p className="text-gray-600 mt-2">Tạo yêu cầu văn phòng phẩm mới</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Block bên trái - Form chính */}
            <div className="lg:col-span-2 space-y-6">
              {/* Sản phẩm */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Sản phẩm</span>
                    {!items.some(item => item.stationeryId === 0) && (
                      <Button type="button" onClick={addItem} variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm sản phẩm
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {items.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>Chưa có sản phẩm nào</p>
                      <p className="text-sm">Nhấn "Thêm sản phẩm" để bắt đầu</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {items.map((item, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-sm">Sản phẩm {index + 1}</h4>
                            <Button
                              type="button"
                              onClick={() => removeItem(index)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                  </div>

                          <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-2">
                              <Label htmlFor={`stationery-${index}`} className="text-sm">Sản phẩm</Label>
                              <Select
                                value={item.stationeryId.toString()}
                                onValueChange={(value) => updateItem(index, 'stationeryId', parseInt(value))}
                              >
                                <SelectTrigger className="h-9">
                                  <SelectValue placeholder="Chọn sản phẩm" />
                                </SelectTrigger>
                                <SelectContent>
                                  {stationeries.map((stationery) => (
                                    <SelectItem key={stationery.id} value={stationery.id.toString()}>
                                      {stationery.name} - {stationery.code} (Stock: {stationery.stockQuantity})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                          </div>
                            
                            <div>
                              <Label htmlFor={`quantity-${index}`} className="text-sm">Số lượng</Label>
                              <Input
                                id={`quantity-${index}`}
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                className="h-9"
                              />
                          </div>
                        </div>
                          
                          {item.stationeryId > 0 && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                              <div className="flex items-center justify-between">
                                <span>Đơn giá: {formatCurrency(getSelectedStationery(item.stationeryId)?.cost || 0)}</span>
                                <span className="font-medium">Tổng: {formatCurrency((getSelectedStationery(item.stationeryId)?.cost || 0) * item.quantity)}</span>
                              </div>
                              <div className="text-gray-500 mt-1">
                                Tồn kho: {getSelectedStationery(item.stationeryId)?.stockQuantity || 0}
                              </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  )}
                </CardContent>
              </Card>

              {/* Thông tin yêu cầu */}
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin yêu cầu</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                    <Label htmlFor="toDate">Ngày cần</Label>
                      <Input
                        id="toDate"
                        type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                        required
                      />
                  </div>

                  <div>
                    <Label htmlFor="reason">Lý do</Label>
                    <Textarea
                      id="reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Nhập lý do yêu cầu..."
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Error message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              {/* Success message */}
              {message && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-600">{message}</p>
                </div>
              )}

              {/* Submit button */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Đang tạo...' : 'Tạo yêu cầu'}
                </Button>
              </div>
            </div>

            {/* Block bên phải - Tổng tiền */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                  <CardHeader>
                  <CardTitle>Tổng tiền</CardTitle>
                  </CardHeader>
                <CardContent>
                  {items.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">Chưa có sản phẩm nào</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Chi tiết từng sản phẩm */}
                      <div className="space-y-2">
                        {items.map((item, index) => {
                          const stationery = getSelectedStationery(item.stationeryId);
                          if (!stationery) return null;
                          
                          return (
                            <div key={index} className="flex justify-between items-center text-sm">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{stationery.name}</p>
                                <p className="text-gray-500 text-xs">{item.quantity} x {formatCurrency(stationery.cost || 0)}</p>
                              </div>
                              <div className="text-right ml-2">
                                <p className="font-medium">{formatCurrency(stationery.cost * item.quantity)}</p>
                              </div>
                      </div>
                          );
                        })}
                      </div>
                      
                      {/* Tổng cộng */}
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold">Tổng cộng:</span>
                          <span className="text-xl font-bold text-blue-600">
                            {formatCurrency(calculateTotal())}
                          </span>
                      </div>
                    </div>
                      
                      {/* Thông tin bổ sung */}
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>• Số sản phẩm: {items.length}</p>
                        <p>• Tổng số lượng: {items.reduce((sum, item) => sum + item.quantity, 0)}</p>
                    </div>
                  </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
                 </form>
       </div>
     </div>
   );
 }
