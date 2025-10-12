import { Router } from "express";
import asyncHandler from "../utils/async-handler";
import ProductController from "../controllers/product.controller";

const router = Router();


router.get('/fetch-products', asyncHandler(ProductController.fetchProducts));
router.get('/count', asyncHandler(ProductController.getProductsCount));
router.post('/', asyncHandler(ProductController.createProduct));
router.put('/:id', asyncHandler(ProductController.updateProduct));
router.delete('/:id', asyncHandler(ProductController.deleteProduct));


export default router;