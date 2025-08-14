'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { AuthGuard } from '@/components/auth-guard';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Save } from 'lucide-react';
import Cookies from 'js-cookie';

interface StationeryForm {
  code: string;
  name: string;
  description: string;
  cost: string;
  stockQuantity: string;
  minimumStock: string;
  imageUrl: string;
  category: string;
  brand: string;
  model: string;
  specifications: string;
  tags: string;
}

export default function NewStationeryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<StationeryForm>({
    code: '',
    name: '',
    description: '',
    cost: '',
    stockQuantity: '',
    minimumStock: '',
    imageUrl: '',
    category: '',
    brand: '',
    model: '',
    specifications: '',
    tags: ''
  });

  const handleInputChange = (field: keyof StationeryForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token') || Cookies.get('token');
      if (!token) {
        throw new Error('No authentication token');
      }

      // Convert form data to API format
      const requestData = {
        code: formData.code,
        name: formData.name,
        description: formData.description,
        cost: parseFloat(formData.cost) || 0,
        stockQuantity: parseInt(formData.stockQuantity) || 0,
        minimumStock: parseInt(formData.minimumStock) || 0,
        imageUrl: formData.imageUrl,
        category: formData.category,
        brand: formData.brand,
        model: formData.model,
        specifications: formData.specifications,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
      };

      const response = await fetch('http://localhost:8080/api/stationeries', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Tạo sản phẩm thất bại');
      }

      const newStationery = await response.json();
      
      toast({
        title: 'Thành công!',
        description: `Sản phẩm "${newStationery.name}" đã được tạo thành công.`,
      });

      // Redirect to stationery list
      router.push('/stationery');
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: `Không thể tạo sản phẩm: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const isManagerOrAdmin = user?.role === 'MANAGER' || user?.role === 'SUPER_ADMIN';

  if (!isManagerOrAdmin) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-4xl mx-auto">
            <Card className="text-center py-12">
              <CardContent>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Không có quyền truy cập
                </h3>
                <p className="text-gray-600 mb-4">
                  Chỉ Manager và Super Admin mới có quyền thêm sản phẩm mới.
                </p>
                <Button onClick={() => router.push('/stationery')}>
                  Quay lại danh sách sản phẩm
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/stationery')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Thêm sản phẩm mới</h1>
                <p className="text-gray-600">Tạo sản phẩm văn phòng phẩm mới vào hệ thống</p>
              </div>
            </div>

            {/* Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Thông tin sản phẩm
                </CardTitle>
                <CardDescription>
                  Điền đầy đủ thông tin sản phẩm. Các trường có dấu * là bắt buộc.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="code">Mã sản phẩm *</Label>
                      <Input
                        id="code"
                        value={formData.code}
                        onChange={(e) => handleInputChange('code', e.target.value)}
                        placeholder="VD: PEN001"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="name">Tên sản phẩm *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="VD: Bút bi xanh"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Mô tả</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Mô tả chi tiết về sản phẩm..."
                      rows={3}
                    />
                  </div>

                  {/* Pricing and Stock */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="cost">Giá (VNĐ) *</Label>
                      <Input
                        id="cost"
                        type="number"
                        value={formData.cost}
                        onChange={(e) => handleInputChange('cost', e.target.value)}
                        placeholder="0"
                        min="0"
                        step="1000"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="stockQuantity">Số lượng tồn kho *</Label>
                      <Input
                        id="stockQuantity"
                        type="number"
                        value={formData.stockQuantity}
                        onChange={(e) => handleInputChange('stockQuantity', e.target.value)}
                        placeholder="0"
                        min="0"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="minimumStock">Số lượng tối thiểu</Label>
                      <Input
                        id="minimumStock"
                        type="number"
                        value={formData.minimumStock}
                        onChange={(e) => handleInputChange('minimumStock', e.target.value)}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Category and Brand */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="category">Danh mục</Label>
                      <Input
                        id="category"
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        placeholder="VD: Bút viết"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="brand">Thương hiệu</Label>
                      <Input
                        id="brand"
                        value={formData.brand}
                        onChange={(e) => handleInputChange('brand', e.target.value)}
                        placeholder="VD: Thiên Long"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="model">Model</Label>
                      <Input
                        id="model"
                        value={formData.model}
                        onChange={(e) => handleInputChange('model', e.target.value)}
                        placeholder="VD: TL-027"
                      />
                    </div>
                  </div>

                  {/* Image URL */}
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">URL hình ảnh</Label>
                    <Input
                      id="imageUrl"
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  {/* Specifications */}
                  <div className="space-y-2">
                    <Label htmlFor="specifications">Thông số kỹ thuật</Label>
                    <Textarea
                      id="specifications"
                      value={formData.specifications}
                      onChange={(e) => handleInputChange('specifications', e.target.value)}
                      placeholder="Thông số kỹ thuật chi tiết..."
                      rows={3}
                    />
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (phân cách bằng dấu phẩy)</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => handleInputChange('tags', e.target.value)}
                      placeholder="VD: bút, viết, xanh, thiên long"
                    />
                  </div>



                  {/* Submit Button */}
                  <div className="flex justify-end gap-4 pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/stationery')}
                      disabled={loading}
                    >
                      Hủy
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {loading ? 'Đang tạo...' : 'Tạo sản phẩm'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
