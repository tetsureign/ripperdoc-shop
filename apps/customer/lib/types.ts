export type CategoryDto = { name: string; slug: string; description: string };
export type BrandDto = { name: string; slug: string; description: string };
export type ProductDto = {
  id?: string; // exposed once backend ProductDto adds Id (see notes)
  name: string; slug: string; description: string; imageUrl: string;
  price: number; isFeatured: boolean; category: CategoryDto; brand: BrandDto | null;
};
export type PaginatedProductResponse = { products: ProductDto[]; totalCount: number; totalPages: number };
export type PaginatedCategoryResponse = { categories: CategoryDto[]; totalCount: number; totalPages: number };
export type PaginatedBrandResponse = { brands: BrandDto[]; totalCount: number; totalPages: number };
export type CartItemDto = { id: string; quantity: number; product: ProductDto; createdAt: string };
export type OrderItemDto = {
  id: string; productId: string; productName: string; productSlug: string;
  productImageUrl: string; productDescription: string; productCategory: string;
  productBrand: string | null; productPriceSnapshot: number; quantity: number;
};
export type OrderDto = { id: string; status: string; totalPrice: number; note?: string; createdAt: string; items: OrderItemDto[] };
export type OrderSummaryDto = { id: string; status: string; totalPrice: number; createdAt: string; itemCount: number };
export type PaginatedOrderSummaryResponse = { orders: OrderSummaryDto[]; totalCount: number; totalPages: number };
export type WhoAmIDto = { id: string; username: string; roles: string[] };
export type RatingDto = { id: string; score: number; comment?: string; productSlug: string; userId: string };
export type PaginatedRatingResponse = { ratings: RatingDto[]; totalCount: number; totalPages: number };
