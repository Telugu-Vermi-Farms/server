import { prisma } from "../prisma"
import ApiResponse from "../utils/api-response";
import HttpStatusCodes from "../utils/HTTP_STATUS_CODES";
import RestError from "../utils/rest-error";


const ProductService = {

    async fetchProducts(searchTerm: string, limit: number = 20, offset: number = 0) {
        const products = await prisma.product.findMany({
            where: {
                AND: [
                    { is_active: true },
                    searchTerm ? { OR: [
                        { name: { contains: searchTerm, mode: 'insensitive' as any } },
                        { description: { contains: searchTerm, mode: 'insensitive' as any } }
                    ] } : {}
                ]
            },
            include: {
                image: true
            },
            skip: offset,
            take: limit,
        });
        console.log('Fetching the products : ', products);
        return new ApiResponse(HttpStatusCodes.OK,'Proucts Fetched Successfully',products);
    },

    async createProduct(payload: { name: string, description: string, image_name: string, image_source_url: string, price_per_kg: number }) {
        if (!payload.name || payload.name.trim().length === 0) {
            throw new RestError(HttpStatusCodes.BAD_REQUEST, 'Product name is required');
        }
        if (!payload.description || payload.description.trim().length === 0) {
            throw new RestError(HttpStatusCodes.BAD_REQUEST, 'Product description is required');
        }
        if (!payload.image_name || payload.image_name.trim().length === 0) {
            throw new RestError(HttpStatusCodes.BAD_REQUEST, 'Image name is required');
        }
        if (!payload.image_source_url || payload.image_source_url.trim().length === 0) {
            throw new RestError(HttpStatusCodes.BAD_REQUEST, 'Image source_url is required');
        }
        if (typeof payload.price_per_kg !== 'number' || payload.price_per_kg <= 0) {
            throw new RestError(HttpStatusCodes.BAD_REQUEST, 'Valid price_per_kg is required');
        }
        const image = await prisma.image.create({
            data: {
                name: payload.image_name,
                source_url: payload.image_source_url
            }
        });
        const created = await prisma.product.create({
            data: {
                name: payload.name,
                description: payload.description,
                fk_id_image: image.id,
                price_per_kg: payload.price_per_kg,
                is_active: true
            }
        });
        return new ApiResponse(HttpStatusCodes.OK, 'Product created successfully', created);
    },

    async updateProductById(id: number, payload: { name?: string, description?: string, image_name?: string, image_source_url?: string, price_per_kg?: number, is_active?: boolean }) {
        const exists = await prisma.product.findFirst({ where: { id, is_active: true } });
        if (!exists) {
            throw new RestError(HttpStatusCodes.BAD_REQUEST, 'Product not found');
        }
        if (payload.price_per_kg !== undefined && (typeof payload.price_per_kg !== 'number' || payload.price_per_kg <= 0)) {
            throw new RestError(HttpStatusCodes.BAD_REQUEST, 'price_per_kg must be greater than 0');
        }
        // If image fields provided, update the linked image
        if ((payload.image_name && payload.image_name.trim().length > 0) || (payload.image_source_url && payload.image_source_url.trim().length > 0)) {
            await prisma.image.update({
                where: { id: (exists as any).fk_id_image },
                data: {
                    name: payload.image_name || undefined,
                    source_url: payload.image_source_url || undefined
                }
            });
        }
        const updated = await prisma.product.update({
            where: { id },
            data: {
                name: payload.name,
                description: payload.description,
                price_per_kg: payload.price_per_kg,
                is_active: payload.is_active
            },
            include: { image: true }
        });
        return new ApiResponse(HttpStatusCodes.OK, 'Product updated successfully', updated);
    },

    async softDeleteProductById(id: number) {
        const exists = await prisma.product.findFirst({ where: { id, is_active: true } });
        if (!exists) {
            throw new RestError(HttpStatusCodes.BAD_REQUEST, 'Product not found or already inactive');
        }
        const updated = await prisma.product.update({
            where: { id },
            data: { is_active: false },
            include: { image: true }
        });
        return new ApiResponse(HttpStatusCodes.OK, 'Product deleted successfully', updated);
    },

    async getProductsCount(searchTerm?: string) {
        const totalCount = await prisma.product.count({
            where: {
                AND: [
                    { is_active: true },
                    searchTerm ? { OR: [
                        { name: { contains: searchTerm, mode: 'insensitive' as any } },
                        { description: { contains: searchTerm, mode: 'insensitive' as any } }
                    ] } : {}
                ]
            }
        });
        return new ApiResponse(HttpStatusCodes.OK, 'Products count fetched successfully', { count: totalCount });
    }


};


export default ProductService;