import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/product.service.js';
import { ApiResponse } from '../types/api.js';

export class ProductController {
  async getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category, search, sort, limit, offset } = req.query;

      const result = await productService.getProducts({
        category: category as string,
        search: search as string,
        sort: sort as any,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        offset: offset ? parseInt(offset as string, 10) : undefined
      });

      const response: ApiResponse = {
        success: true,
        data: result,
        meta: {
          requestId: req.id,
          total: result.total
        }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await productService.getProductById(req.params.id);
      const response: ApiResponse = {
        success: true,
        data: product,
        meta: { requestId: req.id }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
}

export const productController = new ProductController();
