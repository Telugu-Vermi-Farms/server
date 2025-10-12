import { prisma } from "../prisma";
import ApiResponse from "../utils/api-response";
import { MAX_LIMIT_PER_PAGE } from "../utils/constants";
import HttpStatusCodes from "../utils/HTTP_STATUS_CODES";
import RestError from "../utils/rest-error";
import { generateBatchCode } from "../utils/unique-field-utils";

const StockBatchService = {
    fetch: async function(filters?: {
        batchCode?: string;
        productIds?: number[];
        fromStartDate?: string | Date;
        toStartDate?: string | Date;
        fromEndDate?: string | Date;
        toEndDate?: string | Date;
        productionEndDate?: string | Date;
        onlyActive?: boolean;
        limit?: number;
        offset?: number;
    }) {
        const where: any = {};
        if (filters?.onlyActive !== false) {
            where.is_active = true;
        }
        if (filters?.batchCode) {
            where.batch_code = { contains: String(filters.batchCode), mode: 'insensitive' };
        }
        if (filters?.productIds && filters.productIds.length) {
            where.fk_id_product = { in: filters.productIds };
        }
        if(filters?.fromStartDate) {
            where.start_date = { gte: new Date(filters.fromStartDate) };
        }
        if(filters?.toStartDate) {
            where.start_date = { lte: new Date(filters.toStartDate) };
        }
        if(filters?.fromEndDate) {
            where.end_date = { gte: new Date(filters.fromEndDate) };
        }
        if(filters?.toEndDate) {
            where.end_date = { lte: new Date(filters.toEndDate) };
        }
        console.log('where : ', where);

        const take = filters?.limit && filters.limit >= 0 ? Math.min(MAX_LIMIT_PER_PAGE,filters?.limit) : MAX_LIMIT_PER_PAGE;
        const skip = filters?.offset && filters.offset >= 0 ? filters.offset : 0;

        const [batches, totalCount] = await Promise.all([
            prisma.stockBatch.findMany({
                where,
                orderBy: { end_date: 'asc' },
                take,
                skip
            }),
            prisma.stockBatch.count({ where })
        ]);

        const pagination = {
            totalCount,
            limit: take,
            offset: skip,
            hasNextPage: skip + take < totalCount,
            currentPage: Math.floor(skip / take) + 1,
            totalPages: Math.ceil(totalCount / take)
        };

        return new ApiResponse(HttpStatusCodes.OK, 'Stock batches fetched successfully', { batches, pagination });
    },
    create: async function(payload: {
        fk_id_product: number,
        quantity_produced: number,
        start_date: string | Date,
        end_date: string | Date,
        price_per_kg: number
    }) {
        const product = await prisma.product.findUnique({ where: { id: payload.fk_id_product, is_active: true } });
        if (!product) {
            throw new RestError(HttpStatusCodes.BAD_REQUEST, 'Product not found');
        }
        if(payload.quantity_produced <= 0) {
            throw new RestError(HttpStatusCodes.BAD_REQUEST, 'Quantity produced must be greater than 0');
        }
        if(payload.start_date >= payload.end_date) {
            throw new RestError(HttpStatusCodes.BAD_REQUEST, 'Start date must be before end date');
        }
        const batchCode = generateBatchCode(payload.fk_id_product, payload.start_date, payload.end_date);
        const created = await prisma.stockBatch.create({
            data: {
                fk_id_product: payload.fk_id_product,
                quantity_produced: payload.quantity_produced,
                quantity_allocated: 0,
                start_date: new Date(payload.start_date),
                end_date: new Date(payload.end_date),
                is_active: true,
                price_per_kg: payload.price_per_kg,
                batch_code: batchCode
            }
        });
        return new ApiResponse(HttpStatusCodes.OK, 'Stock batch created successfully', created);
    },

    updateById: async function(id: number, payload: {
        fk_id_product?: number;
        quantity_produced?: number;
        quantity_allocated?: number;
        end_date?: string | Date;
        is_active?: boolean;
    }) {
        const stockBatch = await prisma.stockBatch.findUnique({ where: { id, is_active: true } });
        if (!stockBatch) {
            throw new RestError(HttpStatusCodes.BAD_REQUEST, 'Stock batch not found');
        }
        if(payload.quantity_produced && payload.quantity_produced <= 0) {
            throw new RestError(HttpStatusCodes.BAD_REQUEST, 'Quantity produced must be greater than 0');
        }
        if(payload.end_date && payload.end_date < stockBatch.start_date) {
            throw new RestError(HttpStatusCodes.BAD_REQUEST, 'End date must be after start date');
        }
        const updated = await prisma.stockBatch.update({
            where: { id },
            data: {
                fk_id_product: payload.fk_id_product,
                quantity_produced: payload.quantity_produced,
                quantity_allocated: payload.quantity_allocated,
                end_date: payload.end_date ? new Date(payload.end_date) : undefined,
                is_active: payload.is_active
            }
        });
        return new ApiResponse(HttpStatusCodes.OK, 'Stock batch updated successfully', updated);
    },

    deleteById: async function(id: number) {
        const stockBatch = await prisma.stockBatch.findUnique({ where: { id, is_active: true } });
        if (!stockBatch) {
            throw new RestError(HttpStatusCodes.BAD_REQUEST, 'Stock batch not found');
        }
        await prisma.stockBatch.delete({ where: { id } });
        return new ApiResponse(HttpStatusCodes.OK, 'Stock batch deleted successfully', { id });
    }
};

export default StockBatchService;


