import { Router } from 'express';
import { cartController } from '../controllers/cart.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';
import { addToCartSchema, updateCartItemSchema } from '../validators/index.js';

const router = Router();

// All cart operations require authentication
router.use(requireAuth);

router.get('/', cartController.getCart);
router.post('/items', validateBody(addToCartSchema), cartController.addItem);
router.patch('/items/:productId', validateBody(updateCartItemSchema), cartController.updateItem);
router.delete('/items/:productId', cartController.removeItem);
router.delete('/', cartController.clearCart);

export default router;
