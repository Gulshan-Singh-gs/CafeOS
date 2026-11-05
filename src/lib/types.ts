export type OrderStatus = 'received' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'cash_on_delivery' | 'upi_received';
export type MembershipRole = 'owner' | 'manager' | 'staff';

export interface Cafe {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  phone: string;
  currency: string;
  currency_symbol: string;
  logo_url: string;
  banner_url: string;
  opening_time: string;
  closing_time: string;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  cafe_id: string;
  name: string;
  description?: string;
  sort_order: number;
  created_at: string;
}

export interface MenuItem {
  id: string;
  cafe_id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_available: boolean;
  is_veg: boolean;
  is_featured?: boolean;
  preparation_time_minutes?: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  item_name: string;
  item_price: number;
  quantity: number;
  subtotal: number;
  notes?: string;
}

export interface Order {
  id: string;
  cafe_id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  special_instructions?: string;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  total: number;
  payment_status: PaymentStatus;
  dining_option: 'dine_in' | 'takeaway';
  table_number?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface CartItem {
  menu_item: MenuItem;
  quantity: number;
  notes?: string;
}

export interface OrderSubmissionItem {
  menu_item_id: string;
  quantity: number;
  notes?: string;
}

export interface OrderSubmissionPayload {
  cafe_id: string;
  customer_name: string;
  customer_phone: string;
  special_instructions?: string;
  dining_option?: 'dine_in' | 'takeaway';
  table_number?: string;
  items: OrderSubmissionItem[];
}

export interface OwnerSession {
  cafe_id: string;
  user_email: string;
  role: MembershipRole;
}

