'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Package, Calendar, FileText, User, DollarSign, CheckCircle } from 'lucide-react';

interface RequestItem {
  id: number;
  stationeryId: number;
  stationeryName: string;
  stationeryCode: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

interface Request {
  id: number;
  requestNumber: string;
  requester: {
    name: string;
    email: string;
  };
  items: RequestItem[];
  toDate: string;
  reason: string;
  status: string;
  totalAmount: number;
  itemCount: number;
  createdAt: string;
  approvedAt?: string;
  approver?: {
    name: string;
  };
  rejectionReason?: string;
}

interface RequestDetailModalProps {
  request: Request | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: (requestId: number, reason?: string) => void;
  onReject?: (requestId: number, reason: string) => void;
  canApprove?: boolean;
}

export default function RequestDetailModal({
  request,
  isOpen,
  onClose,
  onApprove,
  onReject,
  canApprove = false
}: RequestDetailModalProps) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  if (!isOpen || !request) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUBMITTED': return 'bg-blue-100 text-blue-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'CANCELED': return 'bg-yellow-100 text-yellow-800';
      case 'WITHDRAWN': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApprove = () => {
    if (onApprove) {
      onApprove(request.id);
    }
  };

  const handleReject = () => {
    if (onReject && rejectionReason.trim()) {
      onReject(request.id, rejectionReason);
      setRejectionReason('');
      setShowRejectForm(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Chi tiết yêu cầu
              </h2>
              <p className="text-gray-600">{request.requestNumber}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="grid gap-6">
            {/* Thông tin cơ bản */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Thông tin yêu cầu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                    <div className="mt-1">
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Ngày tạo</label>
                    <p className="mt-1">{formatDate(request.createdAt)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Ngày cần</label>
                    <p className="mt-1">{formatDate(request.toDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tổng tiền</label>
                    <p className="mt-1 font-semibold text-blue-600">
                      {formatCurrency(request.totalAmount)}
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Lý do</label>
                  <p className="mt-1 text-gray-700">{request.reason}</p>
                </div>
              </CardContent>
            </Card>

            {/* Thông tin người yêu cầu */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Người yêu cầu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Tên:</strong> {request.requester.name}</p>
                  <p><strong>Email:</strong> {request.requester.email}</p>
                </div>
              </CardContent>
            </Card>

            {/* Danh sách sản phẩm */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Sản phẩm ({request.itemCount} items)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {request.items.map((item, index) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{item.stationeryName}</h4>
                        <Badge variant="outline">{item.stationeryCode}</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Số lượng:</span>
                          <span className="ml-2 font-medium">{item.quantity}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Đơn giá:</span>
                          <span className="ml-2 font-medium">{formatCurrency(item.unitCost)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Thành tiền:</span>
                          <span className="ml-2 font-medium text-blue-600">{formatCurrency(item.totalCost)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Thông tin phê duyệt */}
            {request.approvedAt && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Thông tin phê duyệt
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><strong>Người phê duyệt:</strong> {request.approver?.name}</p>
                    <p><strong>Ngày phê duyệt:</strong> {formatDate(request.approvedAt)}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lý do từ chối */}
            {request.rejectionReason && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <X className="w-5 h-5 text-red-600" />
                    Lý do từ chối
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-red-600">{request.rejectionReason}</p>
                </CardContent>
              </Card>
            )}

            {/* Form từ chối */}
            {showRejectForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Lý do từ chối</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <textarea
                    className="w-full p-3 border rounded-lg"
                    rows={3}
                    placeholder="Nhập lý do từ chối..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleReject} disabled={!rejectionReason.trim()}>
                      Xác nhận từ chối
                    </Button>
                    <Button variant="outline" onClick={() => setShowRejectForm(false)}>
                      Hủy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            {canApprove && request.status === 'SUBMITTED' && (
              <div className="flex gap-4 justify-end">
                <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                  Phê duyệt
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowRejectForm(true)}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  Từ chối
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
