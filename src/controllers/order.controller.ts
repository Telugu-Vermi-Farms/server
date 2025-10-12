import { Request, Response } from 'express';
import OrderService from '../services/order.service';
import { OrderSearchFilter } from '../interfaces/OrderSearchFilter.interface';

const OrderController = {
    placeOrderByCart: async function(req: Request, res: Response) {
        const { cartUniqueId, maxDateRequired } = req.body;
        const maxDate = new Date(maxDateRequired);
        return OrderService.placeOrderByCart(cartUniqueId, maxDate);
    },

    confirmOrderByCustomer: async function(req: Request, res: Response) {
        const { orderUniqueId } = req.params;
        return OrderService.confirmOrderByCustomer(orderUniqueId);
    },

    fetchOrders: async function(req: Request, res: Response) {
        const { 
            limit, 
            offset, 
            orderUniqueId, 
            customerName, 
            customerEmail, 
            customerMobile, 
            deliveryDateFrom, 
            deliveryDateTo 
        } = req.query;
        
        // Parse query parameters
        const limitNum = limit ? parseInt(limit as string, 10) : 10;
        const offsetNum = offset ? parseInt(offset as string, 10) : 0;

        // Build search filter object
        const searchFilter: OrderSearchFilter = {};
        
        if (orderUniqueId) {
            searchFilter.orderUniqueId = orderUniqueId as string;
        }
        
        if (customerName) {
            searchFilter.customerName = customerName as string;
        }
        
        if (customerEmail) {
            searchFilter.customerEmail = customerEmail as string;
        }
        
        if (customerMobile) {
            searchFilter.customerMobile = customerMobile as string;
        }
        
        if (deliveryDateFrom) {
            searchFilter.deliveryDateFrom = new Date(deliveryDateFrom as string);
        }
        
        if (deliveryDateTo) {
            searchFilter.deliveryDateTo = new Date(deliveryDateTo as string);
        }

        // Check if any search filter is provided
        const hasSearchFilter = Object.keys(searchFilter).length > 0;

        return OrderService.fetchOrders(limitNum, offsetNum, hasSearchFilter ? searchFilter : undefined);
    },

    confirmOrderByAdmin: async function(req: Request, res: Response) {
        const { orderUniqueId } = req.params;
        return OrderService.confirmOrderByAdmin(orderUniqueId);
    },

    cancelOrderByAdmin: async function(req: Request, res: Response) {
        const { orderUniqueId } = req.params;
        return OrderService.cancelOrderByAdmin(orderUniqueId);
    },

    getOrdersCount: async function(req: Request, res: Response) {
        const { 
            orderUniqueId, 
            customerName, 
            customerEmail, 
            customerMobile, 
            deliveryDateFrom, 
            deliveryDateTo 
        } = req.query;

        // Build search filter object
        const searchFilter: OrderSearchFilter = {};
        
        if (orderUniqueId) {
            searchFilter.orderUniqueId = orderUniqueId as string;
        }
        
        if (customerName) {
            searchFilter.customerName = customerName as string;
        }
        
        if (customerEmail) {
            searchFilter.customerEmail = customerEmail as string;
        }
        
        if (customerMobile) {
            searchFilter.customerMobile = customerMobile as string;
        }
        
        if (deliveryDateFrom) {
            searchFilter.deliveryDateFrom = new Date(deliveryDateFrom as string);
        }
        
        if (deliveryDateTo) {
            searchFilter.deliveryDateTo = new Date(deliveryDateTo as string);
        }

        // Check if any search filter is provided
        const hasSearchFilter = Object.keys(searchFilter).length > 0;

        return OrderService.getOrdersCount(hasSearchFilter ? searchFilter : undefined);
    },

    fetchOrderDetails: async function(req: Request, res: Response) {
        const { orderIds, orderUniqueIds } = req.query as any;
        const parsedOrderIds = typeof orderIds === 'string' && orderIds.length
            ? orderIds.split(',').map((id: string) => Number(id)).filter((n: number) => !isNaN(n))
            : undefined;
        const parsedOrderUniqueIds = typeof orderUniqueIds === 'string' && orderUniqueIds.length
            ? orderUniqueIds.split(',').map((v: string) => v.trim()).filter((v: string) => v.length > 0)
            : undefined;
        return OrderService.fetchOrderDetails(parsedOrderIds, parsedOrderUniqueIds);
    }
};

export default OrderController;
