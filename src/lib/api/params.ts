// src/lib/api/params.ts
// Type-safe request parameters for API endpoints

import { z } from 'zod';

/**
 * Common pagination parameters
 */
export const PaginationParamsSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(10),
});

export type PaginationParams = z.infer<typeof PaginationParamsSchema>;

/**
 * Common sorting parameters
 */
export const SortingParamsSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

export type SortingParams = z.infer<typeof SortingParamsSchema>;

/**
 * Common filtering parameters
 */
export const FilteringParamsSchema = z.record(z.string(), z.string().or(z.number()).or(z.boolean()).or(z.array(z.string().or(z.number()))));

export type FilteringParams = z.infer<typeof FilteringParamsSchema>;

/**
 * Common search parameters
 */
export const SearchParamsSchema = z.object({
  query: z.string().optional(),
  fields: z.array(z.string()).optional(),
});

export type SearchParams = z.infer<typeof SearchParamsSchema>;

/**
 * Combined list query parameters
 */
export const ListQueryParamsSchema = z.object({
  ...PaginationParamsSchema.shape,
  ...SortingParamsSchema.shape,
  ...SearchParamsSchema.shape,
  filters: FilteringParamsSchema.optional(),
});

export type ListQueryParams = z.infer<typeof ListQueryParamsSchema>;

/**
 * Login request parameters
 */
export const LoginParamsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginParams = z.infer<typeof LoginParamsSchema>;

/**
 * Registration request parameters
 */
export const RegisterParamsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['buyer', 'seller']),
});

export type RegisterParams = z.infer<typeof RegisterParamsSchema>;

/**
 * Product creation parameters
 */
export const CreateProductParamsSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
  categoryIds: z.array(z.string().or(z.number())).optional(),
  images: z.array(z.string()).optional(),
});

export type CreateProductParams = z.infer<typeof CreateProductParamsSchema>;

/**
 * Product update parameters
 */
export const UpdateProductParamsSchema = CreateProductParamsSchema.partial();

export type UpdateProductParams = z.infer<typeof UpdateProductParamsSchema>;

/**
 * Cart item parameters
 */
export const CartItemParamsSchema = z.object({
  productId: z.string().or(z.number()),
  quantity: z.number().int().positive(),
});

export type CartItemParams = z.infer<typeof CartItemParamsSchema>;

/**
 * Order creation parameters
 */
export const CreateOrderParamsSchema = z.object({
  shippingAddress: z.string().min(10),
  paymentMethod: z.enum(['credit_card', 'bank_transfer', 'cash_on_delivery']),
  notes: z.string().optional(),
});

export type CreateOrderParams = z.infer<typeof CreateOrderParamsSchema>;

/**
 * Feedback creation parameters
 */
export const CreateFeedbackParamsSchema = z.object({
  productId: z.string().or(z.number()),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export type CreateFeedbackParams = z.infer<typeof CreateFeedbackParamsSchema>;

/**
 * Validate parameters against a schema
 * @param schema - Zod schema to validate against
 * @param params - Parameters to validate
 * @returns Validated parameters
 * @throws Error if validation fails
 */
export function validateParams<T>(schema: z.ZodType<T>, params: unknown): T {
  try {
    return schema.parse(params);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join(', ');
      
      throw new Error(`Validation error: ${errorMessage}`);
    }
    throw error;
  }
}

export default {
  validateParams,
  PaginationParamsSchema,
  SortingParamsSchema,
  FilteringParamsSchema,
  SearchParamsSchema,
  ListQueryParamsSchema,
  LoginParamsSchema,
  RegisterParamsSchema,
  CreateProductParamsSchema,
  UpdateProductParamsSchema,
  CartItemParamsSchema,
  CreateOrderParamsSchema,
  CreateFeedbackParamsSchema,
};
