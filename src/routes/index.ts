import { Router } from "express";
import ProductRoutes from '../routes/product.routes';
import ContactUsRoutes from '../routes/contact-us.routes';
import OrderRoutes from '../routes/order.routes';
import CartRoutes from '../routes/cart.routes';
import StockBatchRoutes from '../routes/stock-batch.routes';

const router = Router();

router.use('/product', ProductRoutes);
router.use('/contact-us', ContactUsRoutes);
router.use('/cart', CartRoutes);
router.use('/order', OrderRoutes);
router.use('/stock-batch', StockBatchRoutes);

export default router;