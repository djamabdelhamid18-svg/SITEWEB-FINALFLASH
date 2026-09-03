export type Color = {
  name: string;
  hex: string;
  image?: string;
};

export type Measurement = {
  label: string;
  value: string;
};

export type Product = {
  id: number;
  title: string;
  category: string;
  price: number;
  badge: string;
  rating: number;
  inStock: boolean;
  stockCount: number;
  quality: string;
  conditionDetails: string;
  fabric: string;
  fit: string;
  care: string;
  measurements: Measurement[];
  images: string[];
  description: string;
  features: string[];
  sizes: string[];
  colors: Color[];
  isBundle?: boolean;
};

export type BundleOptions = {
  joggerColor: string;
  joggerSize: string;
  teeModel: 'gymshark' | 'hardrock' | string;
  teeSize: string;
};

export type CartItem = {
  product: Product;
  size: string;
  color: Color | null;
  quantity: number;
  bundleOptions?: BundleOptions;
};

export type OrderRecord = {
  orderNumber: string;
  date: string;
  customerName: string;
  phone: string;
  wilaya: string;
  commune: string;
  deliveryMethod: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  items: Array<{
    productId?: number;
    productTitle: string;
    size: string;
    color: string | null;
    quantity: number;
    unitPrice: number;
  }>;
};
