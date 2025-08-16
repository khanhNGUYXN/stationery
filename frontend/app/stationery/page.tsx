'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Header } from '@/components/header';
import { AuthGuard } from '@/components/auth-guard';
import { NotificationPopup } from '@/components/ui/notification-popup';
import { 
  Search, 
  Filter, 
  Package, 
  ShoppingCart,
  Eye,
  DollarSign,
  Box,
  Plus,
  X,
  Edit
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
  imageUrl?: string;
  tags: string[];
}

export default function StationeryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [stationeries, setStationeries] = useState<Stationery[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    minPrice: '',
    maxPrice: '',
    minStock: '',
    maxStock: '',
    brand: '',
    inStock: 'all'
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

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStationery, setEditingStationery] = useState<Stationery | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    cost: 0,
    stockQuantity: 0,
    minimumStock: 0,
    category: '',
    brand: '',
    model: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

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
          minimumStock: item.minimumStock || 10,
          category: item.category || 'Unknown',
          brand: item.brand || 'Unknown',
          model: item.model || 'Unknown',
          imageUrl: item.imageUrl,
          tags: item.tags || []
        }));

        setStationeries(transformedStationeries);
        setLoading(false);
      } catch (error) {
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
  }, []);

  const categories = ['all', 'Writing', 'Paper', 'Office Supplies'];

  // Filter stationeries based on search term and category
  const filteredStationeries = useMemo(() => {
    let filtered = stationeries;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Advanced filters
    if (advancedFilters.minPrice) {
      filtered = filtered.filter(item => item.cost >= parseFloat(advancedFilters.minPrice));
    }
    if (advancedFilters.maxPrice) {
      filtered = filtered.filter(item => item.cost <= parseFloat(advancedFilters.maxPrice));
    }
    if (advancedFilters.minStock) {
      filtered = filtered.filter(item => item.stockQuantity >= parseInt(advancedFilters.minStock));
    }
    if (advancedFilters.maxStock) {
      filtered = filtered.filter(item => item.stockQuantity <= parseInt(advancedFilters.maxStock));
    }
    if (advancedFilters.brand) {
      filtered = filtered.filter(item => 
        item.brand && item.brand.toLowerCase().includes(advancedFilters.brand.toLowerCase())
      );
    }
    if (advancedFilters.inStock === 'inStock') {
      filtered = filtered.filter(item => item.stockQuantity > 0);
    } else if (advancedFilters.inStock === 'outOfStock') {
      filtered = filtered.filter(item => item.stockQuantity === 0);
    }

    return filtered;
  }, [searchTerm, selectedCategory, stationeries, advancedFilters.minPrice, advancedFilters.maxPrice, advancedFilters.minStock, advancedFilters.maxStock, advancedFilters.brand, advancedFilters.inStock]);

  const getStockStatus = (quantity: number, minimum: number) => {
    if (quantity === 0) return { status: 'out', text: 'Hết hàng', color: 'text-red-500' };
    if (quantity <= minimum) return { status: 'low', text: 'Sắp hết', color: 'text-yellow-500' };
    return { status: 'available', text: 'Có sẵn', color: 'text-green-500' };
  };

  // Edit functions
  const openEditModal = (stationery: Stationery) => {
    setEditingStationery(stationery);
    setEditForm({
      name: stationery.name,
      description: stationery.description,
      cost: stationery.cost,
      stockQuantity: stationery.stockQuantity,
      minimumStock: stationery.minimumStock,
      category: stationery.category,
      brand: stationery.brand,
      model: stationery.model
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingStationery(null);
    setEditForm({
      name: '',
      description: '',
      cost: 0,
      stockQuantity: 0,
      minimumStock: 0,
      category: '',
      brand: '',
      model: ''
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStationery) return;

    setIsUpdating(true);
    try {
      const token = localStorage.getItem('token') || Cookies.get('token');
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`http://localhost:8080/api/stationeries/${editingStationery.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error('Failed to update stationery');
      }

      // Refresh the stationeries list
      const updatedResponse = await fetch('http://localhost:8080/api/stationeries?size=100', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (updatedResponse.ok) {
        const data = await updatedResponse.json();
        setStationeries(data.content || []);
      }

      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Thành công',
        message: 'Sản phẩm đã được cập nhật thành công'
      });

      closeEditModal();
    } catch (error) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể cập nhật sản phẩm. Vui lòng thử lại.'
      });
    } finally {
      setIsUpdating(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải danh sách sản phẩm...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header with Logout */}
          <Header 
            title="Văn phòng phẩm"
            subtitle="Tìm kiếm và yêu cầu văn phòng phẩm cần thiết"
            showHomeButton={true}
            actionButton={
              (user?.role === 'MANAGER' || user?.role === 'SUPER_ADMIN') && (
                <Button 
                  onClick={() => router.push('/stationery/new')}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Thêm sản phẩm
                </Button>
              )
            }
          />

          {/* Search and Filter */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Tìm kiếm & Lọc
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="search">Tìm kiếm</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Tìm theo tên, mã, mô tả..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="category">Danh mục</Label>
                  <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label="Chọn danh mục sản phẩm"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'Tất cả' : category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowAdvancedFilter(true)}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Lọc nâng cao
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-600">
              Tìm thấy <span className="font-semibold">{filteredStationeries.length}</span> sản phẩm
            </p>
          </div>

          {/* Stationery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStationeries.map((item) => {
              const stockStatus = getStockStatus(item.stockQuantity, item.minimumStock);
              
              return (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        <CardDescription className="text-sm text-gray-500">
                          {item.code} • {item.brand} {item.model}
                        </CardDescription>
                      </div>
                      <div className={`text-sm font-medium ${stockStatus.color}`}>
                        {stockStatus.text}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {item.description}
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Giá:</span>
                        <span className="font-semibold text-lg">{formatCurrency(item.cost)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Tồn kho:</span>
                        <span className="font-medium">{item.stockQuantity} cái</span>
                      </div>



                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => router.push(`/stationery/${item.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Chi tiết
                        </Button>
                        {user?.role === 'SUPER_ADMIN' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => openEditModal(item)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Chỉnh sửa
                          </Button>
                        )}
                        <Button
                          size="sm"
                          className="flex-1"
                          disabled={stockStatus.status === 'out'}
                          onClick={() => router.push(`/requests/new?stationeryId=${item.id}`)}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Yêu cầu
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredStationeries.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Không tìm thấy sản phẩm
                </h3>
                <p className="text-gray-600 mb-4">
                  Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                >
                  Xóa bộ lọc
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Advanced Filter Modal */}
        {showAdvancedFilter && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowAdvancedFilter(false)}
          >
            <div 
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Lọc nâng cao</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvancedFilter(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minPrice">Giá tối thiểu (VNĐ)</Label>
                    <Input
                      id="minPrice"
                      type="number"
                      value={advancedFilters.minPrice}
                      onChange={(e) => setAdvancedFilters(prev => ({
                        ...prev,
                        minPrice: e.target.value
                      }))}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxPrice">Giá tối đa (VNĐ)</Label>
                    <Input
                      id="maxPrice"
                      type="number"
                      value={advancedFilters.maxPrice}
                      onChange={(e) => setAdvancedFilters(prev => ({
                        ...prev,
                        maxPrice: e.target.value
                      }))}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minStock">Tồn kho tối thiểu</Label>
                    <Input
                      id="minStock"
                      type="number"
                      value={advancedFilters.minStock}
                      onChange={(e) => setAdvancedFilters(prev => ({
                        ...prev,
                        minStock: e.target.value
                      }))}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxStock">Tồn kho tối đa</Label>
                    <Input
                      id="maxStock"
                      type="number"
                      value={advancedFilters.maxStock}
                      onChange={(e) => setAdvancedFilters(prev => ({
                        ...prev,
                        maxStock: e.target.value
                      }))}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="brand">Thương hiệu</Label>
                  <Input
                    id="brand"
                    value={advancedFilters.brand}
                    onChange={(e) => setAdvancedFilters(prev => ({
                      ...prev,
                      brand: e.target.value
                    }))}
                    placeholder="Nhập tên thương hiệu..."
                  />
                </div>

                <div>
                  <Label htmlFor="inStock">Tình trạng tồn kho</Label>
                  <select
                    id="inStock"
                    value={advancedFilters.inStock}
                    onChange={(e) => setAdvancedFilters(prev => ({
                      ...prev,
                      inStock: e.target.value
                    }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label="Chọn tình trạng tồn kho"
                  >
                    <option value="all">Tất cả</option>
                    <option value="inStock">Còn hàng</option>
                    <option value="outOfStock">Hết hàng</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setAdvancedFilters({
                      minPrice: '',
                      maxPrice: '',
                      minStock: '',
                      maxStock: '',
                      brand: '',
                      inStock: 'all'
                    });
                  }}
                >
                  Xóa bộ lọc
                </Button>
                <Button onClick={() => setShowAdvancedFilter(false)}>
                  Áp dụng
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editingStationery && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Chỉnh sửa sản phẩm</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeEditModal}
                  disabled={isUpdating}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-name">Tên sản phẩm *</Label>
                    <Input
                      id="edit-name"
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-cost">Giá (VNĐ) *</Label>
                    <Input
                      id="edit-cost"
                      type="number"
                      value={editForm.cost}
                      onChange={(e) => setEditForm(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-description">Mô tả</Label>
                  <textarea
                    id="edit-description"
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    aria-label="Mô tả sản phẩm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="edit-stock">Tồn kho *</Label>
                    <Input
                      id="edit-stock"
                      type="number"
                      value={editForm.stockQuantity}
                      onChange={(e) => setEditForm(prev => ({ ...prev, stockQuantity: Number(e.target.value) }))}
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-min-stock">Tồn kho tối thiểu *</Label>
                    <Input
                      id="edit-min-stock"
                      type="number"
                      value={editForm.minimumStock}
                      onChange={(e) => setEditForm(prev => ({ ...prev, minimumStock: Number(e.target.value) }))}
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-category">Danh mục *</Label>
                    <select
                      id="edit-category"
                      value={editForm.category}
                      onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      aria-label="Chọn danh mục sản phẩm"
                    >
                      <option value="">Chọn danh mục</option>
                      {categories.filter(cat => cat !== 'all').map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-brand">Thương hiệu</Label>
                    <Input
                      id="edit-brand"
                      value={editForm.brand}
                      onChange={(e) => setEditForm(prev => ({ ...prev, brand: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-model">Model</Label>
                    <Input
                      id="edit-model"
                      value={editForm.model}
                      onChange={(e) => setEditForm(prev => ({ ...prev, model: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeEditModal}
                    disabled={isUpdating}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    disabled={isUpdating}
                  >
                    {isUpdating ? 'Đang cập nhật...' : 'Cập nhật'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

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
    </AuthGuard>
  );
}
