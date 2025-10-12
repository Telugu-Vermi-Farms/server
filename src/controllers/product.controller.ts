import { Request, Response } from 'express';
import ProductService from "../services/product.service"

const ProductController = {
    async fetchProducts(req: Request, res: Response) {
        const { q, limit, offset } = req.query as any;
        const limitNum = limit ? parseInt(limit, 10) : 20;
        const offsetNum = offset ? parseInt(offset, 10) : 0;
        console.log('Got the request in controller');
        return ProductService.fetchProducts(q || '', limitNum, offsetNum);
    },

    async getProductsCount(req: Request, res: Response) {
        const { q } = req.query as any;
        return ProductService.getProductsCount(q || '');
    },

    async createProduct(req: Request, res: Response) {
        const { name, description, image_name, image_source_url, price_per_kg } = req.body;
        return ProductService.createProduct({ name, description, image_name, image_source_url, price_per_kg });
    },

    async updateProduct(req: Request, res: Response) {
        const { id } = req.params;
        const { name, description, image_name, image_source_url, price_per_kg, is_active } = req.body;
        return ProductService.updateProductById(Number(id), { name, description, image_name, image_source_url, price_per_kg, is_active });
    },

    async deleteProduct(req: Request, res: Response) {
        const { id } = req.params;
        return ProductService.softDeleteProductById(Number(id));
    }
}


export default ProductController;