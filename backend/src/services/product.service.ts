import { productRepository, ProductWithInventory } from '../repositories/product.repository.js';
import { redisService } from './redis.service.js';
import { AppError } from '../types/api.js';

export class ProductService {
  async getProducts(params: {
    category?: string;
    search?: string;
    sort?: 'featured' | 'discount' | 'price-low' | 'price-high' | 'rating';
    limit?: number;
    offset?: number;
  }): Promise<{ products: ProductWithInventory[]; total: number }> {
    // Cache key incorporates all query parameters
    const cacheKey = `cache:products:${params.category || 'all'}:${params.search || ''}:${params.sort || 'featured'}:${params.limit || 50}:${params.offset || 0}`;

    const cached = await redisService.get(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // Continue to database on parse failure
      }
    }

    const result = await productRepository.findAll(params);

    // Cache product catalog for 5 minutes (300 seconds)
    await redisService.set(cacheKey, JSON.stringify(result), 300);

    return result;
  }

  async getProductById(id: string): Promise<ProductWithInventory> {
    const cacheKey = `cache:product:${id}`;
    const cached = await redisService.get(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // Continue to database
      }
    }

    const product = await productRepository.findById(id);
    if (!product) {
      throw new AppError(404, 'PRODUCT_NOT_FOUND', `Product with ID '${id}' was not found.`);
    }

    await redisService.set(cacheKey, JSON.stringify(product), 300);
    return product;
  }

  async invalidateProductCache(productId?: string): Promise<void> {
    if (productId) {
      await redisService.del(`cache:product:${productId}`);
    }
  }
}

export const productService = new ProductService();
