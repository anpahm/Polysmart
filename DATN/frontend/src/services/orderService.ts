import config from '@/config/api';
import { fetchApi } from '@/config/api';

export interface CustomerInfo {
  email?: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district?: string;
  note?: string;
}

export interface OrderItem {
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
  name?: string;
  image?: string;
  colorName?: string;
}

export interface OrderResponse {
  id: string;
  transferContent: string;
  bankInfo: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    branch: string;
  };
  totalAmount: number;
}

export const orderService = {
  async createOrder(data: {
    customerInfo: CustomerInfo;
    items: OrderItem[];
    totalAmount: number;
    paymentMethod: 'cod' | 'atm';
  }): Promise<OrderResponse> {
    try {
      const result = await fetchApi('/orders', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      return result.order;
    } catch (error: any) {
      console.error('Create order error:', error);
      throw new Error(error.message || 'Đã có lỗi xảy ra khi tạo đơn hàng');
    }
  },

  async verifyPayment(orderId: string, transferContent: string): Promise<void> {
    try {
      await fetchApi('/orders/verify-transfer', {
        method: 'POST',
        body: JSON.stringify({ orderId, transferContent }),
      });
    } catch (error: any) {
      console.error('Verify payment error:', error);
      throw new Error(error.message || 'Đã có lỗi xảy ra khi xác nhận thanh toán');
    }
  },
}; 