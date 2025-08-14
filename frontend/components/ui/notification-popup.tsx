'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info,
  X
} from 'lucide-react';

interface NotificationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
}

export function NotificationPopup({
  isOpen,
  onClose,
  type,
  title,
  message,
  actionText,
  onAction
}: NotificationPopupProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'error':
        return <XCircle className="w-8 h-8 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-8 h-8 text-yellow-500" />;
      case 'info':
        return <Info className="w-8 h-8 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Popup */}
      <Card className={`relative w-full max-w-md transform transition-all duration-300 ${
        isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      } ${getBgColor()}`}>
        <CardContent className="p-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-200 transition-colors"
            aria-label="Đóng thông báo"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>

          {/* Icon and Title */}
          <div className="flex items-center gap-3 mb-4">
            {getIcon()}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
          </div>

          {/* Message */}
          <p className="text-gray-600 mb-6 leading-relaxed">{message}</p>

          {/* Actions */}
          <div className="flex gap-3">
            {actionText && onAction && (
              <Button 
                onClick={onAction}
                className="flex-1"
                variant={type === 'success' ? 'default' : 'outline'}
              >
                {actionText}
              </Button>
            )}
            <Button 
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Đóng
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
