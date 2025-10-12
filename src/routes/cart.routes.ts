import { Router } from "express";
import asyncHandler from "../utils/async-handler";
import CartController from "../controllers/cart.controller";

const router = Router();

// POST /api/cart/create - Create a new cart
router.post('/create', asyncHandler(CartController.createCart));

// GET /api/cart/fetch - Fetch cart details
router.get('/fetch', asyncHandler(CartController.fetchCart));

export default router;
