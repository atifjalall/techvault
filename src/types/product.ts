/* eslint-disable @typescript-eslint/no-explicit-any */
// Shared Product Types for consistency across components

export interface ProductVariant {
  id: string;
  variantName: string;
  sku: string | null;
  price: number;
  comparePrice: number | null;
  stock: number;
  lowStockAlert: number;
  inStock: boolean;
  isLowStock: boolean;
  color: string | null;
  colorHex: string | null;
  storage: string | null;
  ram: string | null;
  size: string | null;
  length: string | null;
  material: string | null;
  attributes: any;
  images: string[];
  thumbnailImage: string | null;
  discountPercentage: number;
}

export interface Brand {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
}

export interface Vendor {
  id: string;
  name: string;
  storeName?: string;
  storeSlug?: string;
  businessName?: string;
  logo?: string;
}

export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export interface ProductSpecification {
  category: string;
  categoryOrder: number;
  specs: {
    id: string;
    name: string;
    value: string;
    unit: string | null;
    specOrder: number;
    isHighlight: boolean;
  }[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  images: string[];
  brand: Brand | null;
  category: Category;
  subcategory: Subcategory | null;
  vendor: Vendor;
  basePrice: number;
  maxPrice: number | null;
  comparePrice: number | null;
  priceRange: string;
  totalStock: number;
  inStock: boolean;
  featured: boolean;
  newArrival: boolean;
  returnable: boolean;
  isActive: boolean;
  avgRating: number;
  reviewCount: number;
  wishlistCount: number;
  discountPercentage: number;
  tags: string[];
  modelNumber: string | null;
  views: number;
  sold: number;
  deliveryDays: number | null;
  warranty: string | null;
  weight: string | null;
  dimensions: string | null;
  variants: ProductVariant[];
  variantCount: number;
  inStockVariantCount: number;
  variantOptions: {
    colors: string[];
    storage: string[];
    ram: string[];
    sizes: string[];
  };
  specifications: ProductSpecification[];
  highlightedSpecs: any[];
  reviews: Review[];
}
