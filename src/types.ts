export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock: number;
  featured: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  tracking_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  total: number;
  notes: string | null;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string;
  quantity: number;
  unit_price: number;
}

export interface SupportTicket {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'open' | 'closed';
  created_at: string;
}
